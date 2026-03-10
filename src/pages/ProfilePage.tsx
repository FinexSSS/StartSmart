import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Save, LogOut, Mail, Phone, MapPin, Calendar, Shield, Camera,
  Lock, Key, Bell, Eye, EyeOff, Settings, Palette, Globe, Check, AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/integrations/supabase/client";

const regions = [
  "North America", "South America", "Europe", "Asia", "Africa",
  "Middle East", "Oceania", "Central America", "Caribbean",
];

type ProfileTab = "general" | "security" | "preferences";

export default function ProfilePage() {
  const { user, updateProfile, logout, changePassword } = useAuth();
  const { budget, selectedIndustry, teamSize, monthsToRun } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ProfileTab>("general");

  // General form
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    region: user?.region || "",
    dateOfBirth: user?.dateOfBirth || "",
  });
  const [profilePreview, setProfilePreview] = useState<string | null>(user?.profilePicture || null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Security form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // Preferences
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    weeklyReport: false,
    securityAlerts: true,
    marketingTips: false,
  });

  const handleProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaveError("");
    try {
      let pictureUrl: string | null = profilePreview && !profilePreview.startsWith("data:") ? profilePreview : null;
      if (profileFile) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const ext = profileFile.name.split(".").pop()?.toLowerCase() || "jpg";
          const path = `${authUser.id}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(path, profileFile, { upsert: true });
          if (uploadError) {
            setSaveError("Failed to upload photo. Create an 'avatars' bucket in Supabase Storage (public).");
            return;
          }
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          pictureUrl = urlData.publicUrl;
        }
        setProfileFile(null);
      }
      await updateProfile({ ...form, profilePicture: pictureUrl ?? profilePreview });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError("Failed to save profile.");
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(false), 3000);
    } else {
      setPwError("Current password is incorrect.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

  const tabs: { key: ProfileTab; label: string; icon: React.ElementType }[] = [
    { key: "general", label: "General", icon: User },
    { key: "security", label: "Security", icon: Lock },
    { key: "preferences", label: "Preferences", icon: Settings },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto page-enter">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><User className="w-6 h-6 text-primary" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">My Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your account, security & preferences</p>
      </div>

      {/* Profile Header Card */}
      <div className="neo-card flex flex-col sm:flex-row items-center gap-4 mb-6">
        <label className="relative cursor-pointer group flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
            {profilePreview ? (
              <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Camera className="w-3 h-3 text-primary-foreground" />
          </div>
          <input type="file" accept="image/*" onChange={handleProfilePic} className="hidden" />
        </label>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-lg font-semibold">{user.firstName} {user.lastName}</h2>
          <p className="text-sm text-muted-foreground">@{user.username} · {user.email}</p>
          <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary uppercase">
              <Shield className="w-3 h-3" /> {user.role}
            </span>
            {user.createdAt && (
              <span className="text-[10px] text-muted-foreground">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <Button onClick={handleLogout} variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg text-sm">
          <LogOut className="w-4 h-4 mr-1" /> Sign Out
        </Button>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 p-1 bg-secondary/50 rounded-xl">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════ GENERAL TAB ══════ */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="neo-card space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Personal Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">First Name</label>
                <Input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} className="bg-secondary border-border rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Last Name</label>
                <Input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} className="bg-secondary border-border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="bg-secondary border-border rounded-lg" placeholder="+1-555-0000" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date of Birth</label>
              <Input type="date" value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} className="bg-secondary border-border rounded-lg" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Region</label>
              <select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
                className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-foreground">
                <option value="">Select region</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold">
              <Save className="w-4 h-4 mr-2" /> {saved ? "✓ Saved!" : "Save Changes"}
            </Button>
          </div>

          {/* Account Info (Read-only) + Setup Summary */}
          <div className="space-y-4">
            <div className="neo-card">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Mail className="w-4 h-4 text-accent" /> Account Details</h3>
              <div className="space-y-2.5">
                {[
                  { icon: Mail, label: "Email", value: user.email },
                  { icon: User, label: "Username", value: `@${user.username}` },
                  { icon: Shield, label: "Role", value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
                  { icon: Calendar, label: "Joined", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <item.icon className="w-3.5 h-3.5" /> {item.label}
                    </div>
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="neo-card">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Globe className="w-4 h-4 text-primary" /> Setup Summary</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Budget", value: budget > 0 ? `$${budget.toLocaleString()}` : "Not set" },
                  { label: "Industry", value: selectedIndustry ? `${selectedIndustry.icon} ${selectedIndustry.name}` : "Not selected" },
                  { label: "Team", value: `${teamSize} member${teamSize > 1 ? "s" : ""}` },
                  { label: "Timeline", value: `${monthsToRun} months` },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-sm font-semibold text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════ SECURITY TAB ══════ */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="neo-card space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Change Password</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Current Password</label>
              <div className="relative">
                <Input type={showCurrentPw ? "text" : "password"} value={currentPassword}
                  onChange={e => { setCurrentPassword(e.target.value); setPwError(""); }}
                  placeholder="Enter current password" className="bg-secondary border-border rounded-lg pr-10" />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">New Password</label>
              <div className="relative">
                <Input type={showNewPw ? "text" : "password"} value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPwError(""); }}
                  placeholder="At least 6 characters" className="bg-secondary border-border rounded-lg pr-10" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Confirm New Password</label>
              <Input type="password" value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setPwError(""); }}
                placeholder="Repeat new password" className="bg-secondary border-border rounded-lg" />
            </div>
            {pwError && <p className="text-sm text-destructive flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {pwError}</p>}
            {pwSuccess && <p className="text-sm text-primary flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Password changed successfully!</p>}
            <Button onClick={handleChangePassword} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold">
              <Lock className="w-4 h-4 mr-2" /> Update Password
            </Button>
          </div>

          <div className="space-y-4">
            <div className="neo-card">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-accent" /> Security Status</h3>
              <div className="space-y-2">
                {[
                  { label: "Password", status: "Set", ok: true },
                  { label: "Two-Factor Auth", status: "Not available (Backend required)", ok: false },
                  { label: "Email Verified", status: "Pending (Backend required)", ok: false },
                  { label: "Last Login", status: new Date().toLocaleDateString(), ok: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/50">
                    <span className="text-sm">{item.label}</span>
                    <span className={`text-xs font-medium ${item.ok ? "text-primary" : "text-muted-foreground"}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="neo-card">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-destructive" /> Danger Zone</h3>
              <p className="text-xs text-muted-foreground mb-3">These actions cannot be undone once backend is connected.</p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg text-sm" disabled>
                  Deactivate Account (Backend Required)
                </Button>
                <Button variant="outline" className="w-full border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg text-sm" disabled>
                  Delete Account (Backend Required)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════ PREFERENCES TAB ══════ */}
      {activeTab === "preferences" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="neo-card">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Palette className="w-4 h-4 text-primary" /> Appearance</h3>
            <div className="flex items-center justify-between px-3 py-3 rounded-lg bg-secondary/50">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">Switch between dark and light mode</p>
              </div>
              <button onClick={toggleTheme}
                className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
              </button>
            </div>
          </div>

          <div className="neo-card">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-accent" /> Notifications</h3>
            <p className="text-xs text-muted-foreground mb-3">These will activate once backend email service is connected.</p>
            <div className="space-y-2.5">
              {[
                { key: "emailUpdates" as const, label: "Email Updates", desc: "Important account notifications" },
                { key: "weeklyReport" as const, label: "Weekly Report", desc: "Weekly summary of your startup progress" },
                { key: "securityAlerts" as const, label: "Security Alerts", desc: "Login attempts and password changes" },
                { key: "marketingTips" as const, label: "Marketing Tips", desc: "Tips to grow your business" },
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/50 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" checked={notifications[item.key]}
                      onChange={e => setNotifications(p => ({ ...p, [item.key]: e.target.checked }))}
                      className="sr-only peer" />
                    <div className="w-10 h-5 rounded-full bg-border peer-checked:bg-primary transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-card shadow peer-checked:translate-x-5 transition-transform" />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
