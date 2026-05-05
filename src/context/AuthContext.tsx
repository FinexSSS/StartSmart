import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  dateOfBirth: string;
  region: string;
  profilePicture: string | null;
  role: "user" | "admin";
  createdAt: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  adminLogin: (identifier: string, password: string) => Promise<boolean>;
  signup: (
    profile: Omit<UserProfile, "role" | "profilePicture" | "createdAt"> & {
      password: string;
      profilePicture?: string | null;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  resetPasswordRequest: (email: string) => Promise<boolean>;
  getAllUsers: () => Promise<UserProfile[]>;
  deleteUser: (username: string) => Promise<boolean>;
  getUserCount: () => Promise<number>;
  updateUserRole: (username: string, role: "user" | "admin") => Promise<boolean>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function mapRowToProfile(
  row: {
    id?: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    username: string | null;
    phone: string | null;
    date_of_birth: string | null;
    region: string | null;
    profile_picture_url: string | null;
    created_at: string | null;
  },
  role: "user" | "admin" = "user"
): UserProfile {
  return {
    id: row.id ?? "",
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    email: row.email ?? "",
    username: row.username ?? "",
    phone: row.phone ?? "",
    dateOfBirth: row.date_of_birth ?? "",
    region: row.region ?? "",
    profilePicture: row.profile_picture_url ?? null,
    role,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

async function fetchProfileAndRole(userId: string): Promise<UserProfile | null> {
  console.log("AuthContext: fetchProfileAndRole starting for", userId);

  const timeoutValue = 10000; // 10s
  async function fetchWithTimeout<T>(promise: PromiseLike<T>, name: string): Promise<T> {
    return Promise.race([
      promise as Promise<T>,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout fetching ${name}`)), timeoutValue)
      )
    ]);
  }

  try {
    console.log("AuthContext: fetchProfileAndRole fetching profile row...");
    const profileResponse = await fetchWithTimeout(
      supabase.from("profiles").select("*").eq("id", userId).single(),
      "profile row"
    );

    const { data: profileRow, error: profileError } = profileResponse as any;

    if (profileError || !profileRow) {
      console.error("AuthContext: fetchProfileAndRole profile row error or missing:", profileError || "No profile found");
      return null;
    }

    console.log("AuthContext: fetchProfileAndRole fetching user roles...");
    const rolesResponse = await fetchWithTimeout(
      supabase.from("user_roles").select("role").eq("user_id", userId),
      "user roles"
    );

    const { data: roleRows, error: roleError } = rolesResponse as any;

    if (roleError) {
      console.error("AuthContext: fetchProfileAndRole roles error:", roleError);
      // Fallback to "user" if roles fetch fails but profile exists
      return mapRowToProfile(profileRow, "user");
    }

    const isAdmin = roleRows?.some((r: any) => r.role === "admin") ?? false;
    console.log("AuthContext: fetchProfileAndRole success. isAdmin:", isAdmin);
    return mapRowToProfile(profileRow, isAdmin ? "admin" : "user");
  } catch (err) {
    console.error("AuthContext: fetchProfileAndRole unexpected catch:", err);
    return null;
  }
}

async function resolveEmailFromIdentifier(identifier: string): Promise<string | null> {
  if (identifier.includes("@")) return identifier;
  const { data } = await supabase.rpc("get_email_for_login", {
    _username: identifier,
  });
  return typeof data === "string" ? data : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchingUserId = useRef<string | null>(null);
  const fetchPromiseRef = useRef<Promise<UserProfile | null> | null>(null);

  const loadUser = useCallback(async (supabaseUser: SupabaseUser | null) => {
    console.log("AuthContext: loadUser called for:", supabaseUser?.id);
    if (!supabaseUser) {
      setUser(null);
      fetchingUserId.current = null;
      fetchPromiseRef.current = null;
      setIsLoading(false);
      return null;
    }

    // If already fetching THIS user, wait for that promise
    if (fetchingUserId.current === supabaseUser.id && fetchPromiseRef.current) {
      console.log("AuthContext: Already fetching this user, waiting for EXISTING promise...");
      return await fetchPromiseRef.current;
    }

    // New fetch or different user
    const isFirstTime = fetchingUserId.current !== supabaseUser.id;
    fetchingUserId.current = supabaseUser.id;

    if (isFirstTime && !user) {
      setIsLoading(true);
    }

    console.log("AuthContext: Starting NEW profile fetch for:", supabaseUser.id);
    const promise = fetchProfileAndRole(supabaseUser.id);
    fetchPromiseRef.current = promise;

    try {
      const profileResult = await promise;
      console.log("AuthContext: Profile fetch result arrived for:", supabaseUser.id);

      let finalProfile = profileResult;

      if (!finalProfile) {
        // Keep prior user role/profile for this account if profile lookup temporarily fails.
        if (user?.id === supabaseUser.id) {
          console.warn("AuthContext: Profile fetch returned null; preserving current user role/state.");
          finalProfile = user;
        } else {
          console.warn("AuthContext: No profile record found in database for", supabaseUser.id, "- using fallback from metadata.");
          finalProfile = {
            id: supabaseUser.id,
            firstName: supabaseUser.user_metadata?.first_name || "",
            lastName: supabaseUser.user_metadata?.last_name || "",
            email: supabaseUser.email || "",
            username: supabaseUser.user_metadata?.username || supabaseUser.email?.split("@")[0] || "user",
            phone: supabaseUser.user_metadata?.phone || "",
            dateOfBirth: "",
            region: "",
            profilePicture: null,
            role: "user",
            createdAt: supabaseUser.created_at || new Date().toISOString(),
          };
        }
      }

      // Only set user if we are still looking for the same ID
      if (fetchingUserId.current === supabaseUser.id) {
        setUser(finalProfile);
      }
      return finalProfile;
    } catch (error) {
      console.error("AuthContext: Error in loadUser processing:", error);

      const fallback: UserProfile = {
        id: supabaseUser.id,
        firstName: "",
        lastName: "",
        email: supabaseUser.email || "",
        username: supabaseUser.email?.split("@")[0] || "user",
        phone: "",
        dateOfBirth: "",
        region: "",
        profilePicture: null,
        role: "user",
        createdAt: new Date().toISOString(),
      };

      if (fetchingUserId.current === supabaseUser.id) {
        if (user && user.id === supabaseUser.id) {
          // Keep current user state to avoid flickering to role 'user'
          console.warn("AuthContext: Profile fetch failed, retaining current user state.");
        } else {
          setUser(fallback);
        }
      }
      return user || fallback;
    } finally {
      if (fetchingUserId.current === supabaseUser.id) {
        fetchPromiseRef.current = null;
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthContext: onAuthStateChange event:", event, session?.user?.id);
        if (session?.user) {
          await loadUser(session.user);
        } else if (event === "SIGNED_OUT") {
          await loadUser(null);
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthContext: Initial session check result:", session?.user?.id);
      if (session?.user) {
        loadUser(session.user);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUser]);

  const _authenticate = async (identifier: string, password: string) => {
    const email = await resolveEmailFromIdentifier(identifier);
    if (!email) {
      console.warn("AuthContext: could not resolve email for", identifier);
      return null;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("AuthContext: Supabase signInWithPassword error:", error.message);
      return null;
    }
    if (data.user) {
      return await loadUser(data.user);
    }
    return null;
  };

  const login = useCallback(
    async (identifier: string, password: string): Promise<boolean> => {
      console.log("AuthContext: login function called for:", identifier);
      try {
        const profile = await _authenticate(identifier, password);
        if (!profile) return false;

        // Block admin users from logging in via regular user login section
        if (profile.role === "admin") {
          console.warn("AuthContext: Admin attempted to login via user portal");
          await supabase.auth.signOut();
          setUser(null);
          return false;
        }

        return true;
      } catch (err) {
        console.error("AuthContext: unexpected error in login function:", err);
        return false;
      }
    },
    [loadUser]
  );

  const adminLogin = useCallback(
    async (identifier: string, password: string): Promise<boolean> => {
      try {
        const profile = await _authenticate(identifier, password);
        if (!profile) return false;

        if (profile.role !== "admin") {
          console.warn("AuthContext: Non-admin attempted to login via admin portal");
          await supabase.auth.signOut();
          setUser(null);
          return false;
        }

        return true;
      } catch (err) {
        console.error("AuthContext: error in adminLogin:", err);
        return false;
      }
    },
    [loadUser]
  );

  const signup = useCallback(
    async (
      data: Omit<UserProfile, "role" | "profilePicture" | "createdAt"> & {
        password: string;
        profilePicture?: string | null;
      }
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
              username: data.username,
            },
          },
        });
        if (error) return { success: false, error: error.message };
        if (!signUpData.user) return { success: false, error: "Signup failed." };

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            phone: data.phone || null,
            date_of_birth: data.dateOfBirth || null,
            region: data.region || null,
          })
          .eq("id", signUpData.user.id);

        await loadUser(signUpData.user);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "An unexpected error occurred." };
      }
    },
    [loadUser]
  );


  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      const { data: { user: u } } = await supabase.auth.getUser();
      const uid = u?.id;
      if (!uid) return;
      const row: Record<string, unknown> = {};
      if (updates.firstName !== undefined) row.first_name = updates.firstName;
      if (updates.lastName !== undefined) row.last_name = updates.lastName;
      if (updates.phone !== undefined) row.phone = updates.phone;
      if (updates.dateOfBirth !== undefined) row.date_of_birth = updates.dateOfBirth;
      if (updates.region !== undefined) row.region = updates.region;
      if (updates.profilePicture !== undefined) row.profile_picture_url = updates.profilePicture;
      if (updates.username !== undefined) row.username = updates.username;
      row.updated_at = new Date().toISOString();
      await supabase.from("profiles").update(row).eq("id", uid);
      if (user) setUser({ ...user, ...updates });
    },
    [user]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<boolean> => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!u?.email) return false;
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: u.email,
          password: currentPassword,
        });
        if (signInError) return false;
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return !error;
      } catch {
        return false;
      }
    },
    []
  );

  const resetPasswordRequest = useCallback(async (email: string): Promise<boolean> => {
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      return !error;
    } catch {
      return false;
    }
  }, []);

  const getAllUsers = useCallback(async (): Promise<UserProfile[]> => {
    const { data: profiles, error } = await supabase.from("profiles").select("*");
    if (error || !profiles) return [];
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    const adminIds = new Set((adminRoles ?? []).map((r) => r.user_id));
    return profiles.map((p) =>
      mapRowToProfile(p, adminIds.has(p.id) ? "admin" : "user")
    );
  }, []);

  const deleteUser = useCallback(async (username: string): Promise<boolean> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return false;
      const res = await fetch(
        `${supabaseUrl}/functions/v1/admin-delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ username }),
        }
      );
      if (!res.ok) return false;
      const json = await res.json();
      return json.success === true;
    } catch {
      return false;
    }
  }, []);

  const getUserCount = useCallback(async (): Promise<number> => {
    const users = await getAllUsers();
    return users.length;
  }, [getAllUsers]);

  const updateUserRole = useCallback(
    async (username: string, role: "user" | "admin"): Promise<boolean> => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .maybeSingle();
        if (!profile) return false;
        await supabase.from("user_roles").delete().eq("user_id", profile.id);
        const { error } = await supabase.from("user_roles").insert({
          user_id: profile.id,
          role,
        });
        return !error;
      } catch {
        return false;
      }
    },
    []
  );

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        adminLogin,
        signup,
        logout,
        updateProfile,
        changePassword,
        resetPasswordRequest,
        getAllUsers,
        deleteUser,
        getUserCount,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
