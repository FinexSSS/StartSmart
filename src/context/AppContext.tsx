import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { Industry } from "@/data/industries";
import { useAuth } from "@/context/AuthContext";
import { useIndustries } from "@/hooks/useIndustries";
import { supabase } from "@/integrations/supabase/client";
import { fetchAIIndustryEnhancement, fetchAIInfluencerTips, AIInfluencerTipsResult } from "@/services/aiService";
import { saveIndustryToSupabase } from "@/services/industryAdminService";
import { useQueryClient } from "@tanstack/react-query";

export interface WorkshopItem {
  id: string;
  name: string;
  category: string;
  estimatedCost: number;
  notes: string;
  priority: "low" | "medium" | "high";
}

interface AppState {
  budget: number;
  setBudget: (b: number) => void;
  teamSize: number;
  setTeamSize: (t: number) => void;
  monthsToRun: number;
  setMonthsToRun: (m: number) => void;
  selectedIndustry: Industry | null;
  setSelectedIndustry: (i: Industry | null) => void;
  workshopItems: WorkshopItem[];
  setWorkshopItems: React.Dispatch<React.SetStateAction<WorkshopItem[]>>;
  addWorkshopItem: (item: Omit<WorkshopItem, "id">) => void;
  removeWorkshopItem: (id: string) => void;
  updateWorkshopItem: (item: WorkshopItem) => void;
  workshopTotalCost: number;
  enhancedIndustry: Industry | null;
  influencerTips: AIInfluencerTipsResult | null;
  isEnhancing: boolean;
  enhanceIndustryWithAI: () => Promise<void>;
  resetEnhancement: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const DEBOUNCE_MS = 300;

function useDebouncedSupabaseUpdate(
  projectId: string | null,
  payload: {
    budget?: number;
    team_size?: number;
    months_to_run?: number;
    selected_industry_id?: string | null;
  }
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!projectId) return;
    const p = payloadRef.current;
    if (
      p.budget === undefined &&
      p.team_size === undefined &&
      p.months_to_run === undefined &&
      p.selected_industry_id === undefined
    )
      return;
    supabase
      .from("user_projects")
      .update({
        ...(p.budget !== undefined && { budget: p.budget }),
        ...(p.team_size !== undefined && { team_size: p.team_size }),
        ...(p.months_to_run !== undefined && { months_to_run: p.months_to_run }),
        ...(p.selected_industry_id !== undefined && {
          selected_industry_id: p.selected_industry_id,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .then(() => { });
  }, [projectId]);

  const schedule = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(flush, DEBOUNCE_MS);
  }, [flush]);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);
  return { schedule, flush };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: industries = [] } = useIndustries();
  const queryClient = useQueryClient();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [budget, setBudgetState] = useState(0);
  const [teamSize, setTeamSizeState] = useState(1);
  const [monthsToRun, setMonthsToRunState] = useState(6);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string | null>(null);
  const [workshopItems, setWorkshopItems] = useState<WorkshopItem[]>([]);
  const [projectLoading, setProjectLoading] = useState(true);
  const [enhancedIndustry, setEnhancedIndustry] = useState<Industry | null>(null);
  const [influencerTips, setInfluencerTips] = useState<AIInfluencerTipsResult | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [selectedIndustry, setSelectedIndustryState] = useState<Industry | null>(null);

  // Sync selectedIndustry with industries list when it changes
  useEffect(() => {
    if (selectedIndustryId && industries.length > 0) {
      const found = industries.find(i => i.id === selectedIndustryId);
      if (found) {
        setSelectedIndustryState(found);
      }
    }
  }, [selectedIndustryId, industries]);

  const { schedule: scheduleProjectUpdate } = useDebouncedSupabaseUpdate(
    projectId,
    {
      budget,
      team_size: teamSize,
      months_to_run: monthsToRun,
      selected_industry_id: selectedIndustryId,
    }
  );

  // Load or create project when user is set
  useEffect(() => {
    if (!user) {
      setProjectId(null);
      setBudgetState(0);
      setTeamSizeState(1);
      setMonthsToRunState(6);
      setSelectedIndustryId(null);
      setWorkshopItems([]);
      setProjectLoading(false);
      return;
    }

    let cancelled = false;
    setProjectLoading(true);

    (async () => {
      const uid = user.id;
      if (!uid || cancelled) return;

      try {
        console.log("AppContext: loading project for user", uid);
        const { data: existing, error: fetchError } = await supabase
          .from("user_projects")
          .select("*")
          .eq("user_id", uid)
          .limit(1)
          .maybeSingle();

        if (cancelled) return;
        if (fetchError) throw fetchError;

        if (existing) {
          console.log("AppContext: found existing project", existing.id);
          setProjectId(existing.id);
          setBudgetState(Number(existing.budget ?? 0));
          setTeamSizeState(Number(existing.team_size ?? 1));
          setMonthsToRunState(Number(existing.months_to_run ?? 6));
          setSelectedIndustryId(existing.selected_industry_id ?? null);
        } else {
          console.log("AppContext: no project found, creating new one...");
          const { data: inserted, error: insertError } = await supabase
            .from("user_projects")
            .insert({
              user_id: uid,
              budget: 0,
              team_size: 1,
              months_to_run: 6,
            })
            .select("id")
            .single();

          if (cancelled) return;
          if (insertError) throw insertError;
          if (!inserted) throw new Error("Failed to create project");

          console.log("AppContext: created new project", inserted.id);
          setProjectId(inserted.id);
          setBudgetState(0);
          setTeamSizeState(1);
          setMonthsToRunState(6);
          setSelectedIndustryId(null);
        }
      } catch (err) {
        console.error("AppContext: Error in project initialization:", err);
      } finally {
        if (!cancelled) {
          setProjectLoading(false);
          console.log("AppContext: project loading finished");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Load workshop items when projectId is set
  useEffect(() => {
    if (!projectId) {
      setWorkshopItems([]);
      return;
    }
    let cancelled = false;
    supabase
      .from("workshop_items")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!cancelled && data)
          setWorkshopItems(
            data.map((r) => ({
              id: r.id,
              name: r.name ?? "",
              category: r.category ?? "",
              estimatedCost: Number(r.estimated_cost ?? 0),
              notes: r.notes ?? "",
              priority: (r.priority as "low" | "medium" | "high") ?? "medium",
            }))
          );
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const setBudget = useCallback(
    (b: number) => {
      setBudgetState(b);
      scheduleProjectUpdate();
    },
    [scheduleProjectUpdate]
  );
  const setTeamSize = useCallback(
    (t: number) => {
      setTeamSizeState(t);
      scheduleProjectUpdate();
    },
    [scheduleProjectUpdate]
  );
  const setMonthsToRun = useCallback(
    (m: number) => {
      setMonthsToRunState(m);
      scheduleProjectUpdate();
    },
    [scheduleProjectUpdate]
  );
  const addWorkshopItem = useCallback(
    async (item: Omit<WorkshopItem, "id">) => {
      if (!projectId || !user) return;
      const uid = user.id;
      const { data } = await supabase
        .from("workshop_items")
        .insert({
          project_id: projectId,
          user_id: uid,
          name: item.name,
          category: item.category || null,
          estimated_cost: item.estimatedCost,
          notes: item.notes || null,
          priority: item.priority || "medium",
        })
        .select("id")
        .single();
      if (data) {
        setWorkshopItems((prev) => [
          ...prev,
          { ...item, id: data.id },
        ]);
      }
    },
    [projectId]
  );

  const removeWorkshopItem = useCallback(async (id: string) => {
    await supabase.from("workshop_items").delete().eq("id", id);
    setWorkshopItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateWorkshopItem = useCallback(async (item: WorkshopItem) => {
    await supabase
      .from("workshop_items")
      .update({
        name: item.name,
        category: item.category || null,
        estimated_cost: item.estimatedCost,
        notes: item.notes || null,
        priority: item.priority || "medium",
      })
      .eq("id", item.id);
    setWorkshopItems((prev) =>
      prev.map((i) => (i.id === item.id ? item : i))
    );
  }, []);

  const resetEnhancement = useCallback(() => {
    setEnhancedIndustry(null);
    setInfluencerTips(null);
  }, []);

  const enhanceIndustryWithAI = useCallback(async () => {
    if (!selectedIndustry) return;
    setIsEnhancing(true);
    try {
      const enhancedData = await fetchAIIndustryEnhancement(selectedIndustry.name, budget, user);

      if (enhancedData) {
        const fullEnhanced: Industry = {
          ...selectedIndustry,
          description: enhancedData.description,
          minBudget: enhancedData.minBudget,
          monthlyCostPerPerson: enhancedData.monthlyCostPerPerson,
          expenses: enhancedData.expenses,
          resources: enhancedData.resources,
          materials: enhancedData.materials,
          influencers: enhancedData.influencers,
          roadmap: enhancedData.roadmap || [],
        };
        setEnhancedIndustry(fullEnhanced);
        setSelectedIndustryState(fullEnhanced);
        const { ok, error } = await saveIndustryToSupabase(fullEnhanced);
        if (!ok) {
          console.error("Failed to persist AI-enhanced industry:", error);
        } else {
          queryClient.invalidateQueries({ queryKey: ["industries"] });
        }
      }
      if (enhancedData?.influencerTips) {
        setInfluencerTips(enhancedData.influencerTips);
      }
    } catch (error) {
      console.error("Failed to enhance industry with AI:", error);
    } finally {
      setIsEnhancing(false);
    }
  }, [selectedIndustry, budget, user, queryClient]);

  const setSelectedIndustry = useCallback(
    (i: Industry | null) => {
      setSelectedIndustryId(i?.id ?? null);
      setSelectedIndustryState(i);
      resetEnhancement();
      scheduleProjectUpdate();
    },
    [scheduleProjectUpdate, resetEnhancement]
  );

  const workshopTotalCost = workshopItems.reduce((s, i) => s + i.estimatedCost, 0);

  const value: AppState = {
    budget,
    setBudget,
    teamSize,
    setTeamSize,
    monthsToRun,
    setMonthsToRun,
    selectedIndustry,
    setSelectedIndustry,
    workshopItems,
    setWorkshopItems,
    addWorkshopItem,
    removeWorkshopItem,
    updateWorkshopItem,
    workshopTotalCost,
    enhancedIndustry,
    influencerTips,
    isEnhancing,
    enhanceIndustryWithAI,
    resetEnhancement,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
