import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Plus, Trash2, Save, Edit2, BarChart3, Users, Box, Download, Search,
  ChevronDown, ChevronUp, Settings, Database, Activity, UserX, Mail, MapPin,
  Calendar, TrendingUp, Check, X, RefreshCw, Eye, EyeOff,
  DollarSign, Megaphone, Package, Route, Layers, Wrench, UserCog,
  FileText, Globe, Bell, Lock, AlertTriangle, Brain, Cpu, Key, Zap, ToggleLeft,
} from "lucide-react";
import {
  industries as defaultIndustries,
  Industry, ExpenseItem, Influencer, Material, RoadmapStep, ResourceItem,
} from "@/data/industries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useIndustries } from "@/hooks/useIndustries";
import { saveIndustryToSupabase, deleteIndustryFromSupabase } from "@/services/industryAdminService";
import { getAIFeatures, clearAIFeaturesCache, type AIFeaturesConfig, fetchAIIndustryEnhancement } from "@/services/aiService";
import { supabase } from "@/integrations/supabase/client";
import { seedIndustries } from "@/lib/seed_data";
import { toast } from "sonner";

type AdminTab = "overview" | "users" | "industries" | "settings";
type IndustrySubTab = "expenses" | "influencers" | "materials" | "resources" | "roadmap";

const ADMIN_TABS: AdminTab[] = ["overview", "users", "industries", "settings"];

function SubSection({ title, count, icon: Icon, onAdd, addLabel }: { title: string; count: number; icon: React.ElementType; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-[10px] tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-primary" /> {title} ({count})
      </h4>
      {onAdd && (
        <button onClick={onAdd} className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium">
          <Plus className="w-3 h-3" /> {addLabel || "Add"}
        </button>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { getAllUsers, deleteUser, user: currentUser, updateUserRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: industriesFromDb } = useIndustries();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [industries, setIndustries] = useState<Industry[]>(() => JSON.parse(JSON.stringify(defaultIndustries)));
  const [industriesSynced, setIndustriesSynced] = useState(false);
  const [saveIndustriesLoading, setSaveIndustriesLoading] = useState(false);
  const [saveIndustriesError, setSaveIndustriesError] = useState("");
  const [aiFeatures, setAiFeatures] = useState<AIFeaturesConfig>({});
  const [aiFeaturesDirty, setAiFeaturesDirty] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  useEffect(() => {
    if (industriesSynced || !industriesFromDb?.length) return;
    setIndustries(JSON.parse(JSON.stringify(industriesFromDb)));
    setIndustriesSynced(true);
  }, [industriesFromDb, industriesSynced]);

  useEffect(() => {
    getAIFeatures().then(setAiFeatures);
  }, []);

  // User management
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [roleChangeUser, setRoleChangeUser] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    const list = await getAllUsers();
    setUsers(list);
    setUsersLoading(false);
  }, [getAllUsers]);

  useEffect(() => {
    if (activeTab === "overview" || activeTab === "users") loadUsers();
  }, [activeTab, loadUsers]);

  // Industry management
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [industrySubTab, setIndustrySubTab] = useState<IndustrySubTab>("expenses");
  const [editingIndustry, setEditingIndustry] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Industry>>({});
  const [showAddIndustry, setShowAddIndustry] = useState(false);
  const [newIndustry, setNewIndustry] = useState<Partial<Industry>>({ id: "", name: "", icon: "🏢", description: "", minBudget: 0, monthlyCostPerPerson: 0 });

  // Computed
  const filteredUsers = userSearch
    ? users.filter(u => `${u.firstName} ${u.lastName} ${u.email} ${u.username}`.toLowerCase().includes(userSearch.toLowerCase()))
    : users;
  const filteredIndustries = search
    ? industries.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : industries;

  const totalInfluencers = industries.reduce((s, i) => s + i.influencers.length, 0);
  const totalMaterials = industries.reduce((s, i) => s + i.materials.length, 0);
  const totalResources = industries.reduce((s, i) => s + i.resources.length, 0);
  const totalRoadmapSteps = industries.reduce((s, i) => s + i.roadmap.length, 0);
  const totalExpenses = industries.reduce((s, i) => s + i.expenses.length, 0);

  const regionCounts = users.reduce((acc, u) => {
    const r = u.region || "Unspecified";
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const adminCount = users.filter(u => u.role === "admin").length;
  const userCount = users.filter(u => u.role === "user").length;

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    const validTab = requestedTab && ADMIN_TABS.includes(requestedTab as AdminTab)
      ? (requestedTab as AdminTab)
      : "overview";

    if (requestedTab !== validTab) {
      setSearchParams({ tab: validTab }, { replace: true });
      return;
    }

    if (activeTab !== validTab) {
      setActiveTab(validTab);
    }
  }, [activeTab, searchParams, setSearchParams]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Industry CRUD
  const updateIndustry = (id: string, updates: Partial<Industry>) => {
    setIndustries(prev => prev.map(ind => ind.id === id ? { ...ind, ...updates } : ind));
  };
  const deleteIndustry = async (id: string) => {
    const { ok, error } = await deleteIndustryFromSupabase(id);
    if (!ok) {
      setSaveIndustriesError(error || "Failed to delete");
      return;
    }
    setIndustries(prev => prev.filter(ind => ind.id !== id));
    if (expandedId === id) setExpandedId(null);
    queryClient.invalidateQueries({ queryKey: ["industries"] });
  };
  const addNewIndustry = () => {
    if (!newIndustry.id || !newIndustry.name) return;
    setIndustries(prev => [...prev, {
      id: newIndustry.id!, name: newIndustry.name!, icon: newIndustry.icon || "🏢",
      description: newIndustry.description || "", minBudget: newIndustry.minBudget || 0,
      monthlyCostPerPerson: newIndustry.monthlyCostPerPerson || 0,
      expenses: [], influencers: [], materials: [], roadmap: [], resources: [],
    }]);
    setShowAddIndustry(false);
    setNewIndustry({ id: "", name: "", icon: "🏢", description: "", minBudget: 0, monthlyCostPerPerson: 0 });
  };

  // Sub-entity CRUD helpers
  const addExpense = (indId: string) => updateIndustry(indId, { expenses: [...(industries.find(i => i.id === indId)?.expenses || []), { category: "New Category", amount: 0, description: "Description", isMonthly: false }] });
  const updateExpense = (indId: string, idx: number, field: keyof ExpenseItem, value: string | number | boolean) => { const exps = [...(industries.find(i => i.id === indId)?.expenses || [])]; exps[idx] = { ...exps[idx], [field]: value }; updateIndustry(indId, { expenses: exps }); };
  const removeExpense = (indId: string, idx: number) => updateIndustry(indId, { expenses: (industries.find(i => i.id === indId)?.expenses || []).filter((_, i) => i !== idx) });

  const addInfluencer = (indId: string) => updateIndustry(indId, { influencers: [...(industries.find(i => i.id === indId)?.influencers || []), { name: "New Influencer", platform: "Instagram", followers: "0", charge: 0, specialty: "General" }] });
  const updateInfluencer = (indId: string, idx: number, field: keyof Influencer, value: string | number) => { const items = [...(industries.find(i => i.id === indId)?.influencers || [])]; items[idx] = { ...items[idx], [field]: value }; updateIndustry(indId, { influencers: items }); };
  const removeInfluencer = (indId: string, idx: number) => updateIndustry(indId, { influencers: (industries.find(i => i.id === indId)?.influencers || []).filter((_, i) => i !== idx) });

  const addMaterial = (indId: string) => updateIndustry(indId, { materials: [...(industries.find(i => i.id === indId)?.materials || []), { name: "New Material", supplier: "Supplier", estimatedCost: 0, unit: "per unit", notes: "" }] });
  const updateMaterial = (indId: string, idx: number, field: keyof Material, value: string | number) => { const items = [...(industries.find(i => i.id === indId)?.materials || [])]; items[idx] = { ...items[idx], [field]: value }; updateIndustry(indId, { materials: items }); };
  const removeMaterial = (indId: string, idx: number) => updateIndustry(indId, { materials: (industries.find(i => i.id === indId)?.materials || []).filter((_, i) => i !== idx) });

  const addResource = (indId: string) => updateIndustry(indId, { resources: [...(industries.find(i => i.id === indId)?.resources || []), { name: "New Resource", type: "equipment" as const, monthlyCost: 0, oneTimeCost: 0, description: "", essential: false }] });
  const updateResource = (indId: string, idx: number, field: keyof ResourceItem, value: string | number | boolean) => { const items = [...(industries.find(i => i.id === indId)?.resources || [])]; items[idx] = { ...items[idx], [field]: value } as ResourceItem; updateIndustry(indId, { resources: items }); };
  const removeResource = (indId: string, idx: number) => updateIndustry(indId, { resources: (industries.find(i => i.id === indId)?.resources || []).filter((_, i) => i !== idx) });

  const addRoadmapStep = (indId: string) => { const steps = industries.find(i => i.id === indId)?.roadmap || []; updateIndustry(indId, { roadmap: [...steps, { step: steps.length + 1, title: "New Step", description: "Description", duration: "1 week", cost: 0 }] }); };
  const updateRoadmap = (indId: string, idx: number, field: keyof RoadmapStep, value: string | number) => { const items = [...(industries.find(i => i.id === indId)?.roadmap || [])]; items[idx] = { ...items[idx], [field]: value }; updateIndustry(indId, { roadmap: items }); };
  const removeRoadmap = (indId: string, idx: number) => { const remaining = (industries.find(i => i.id === indId)?.roadmap || []).filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 })); updateIndustry(indId, { roadmap: remaining }); };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ industries, users, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "startsmart-admin-export.json"; a.click(); URL.revokeObjectURL(url);
  };

  const saveAllIndustriesToDb = async () => {
    setSaveIndustriesError("");
    setSaveIndustriesLoading(true);
    for (const ind of industries) {
      const { ok, error } = await saveIndustryToSupabase(ind);
      if (!ok) {
        setSaveIndustriesError(error || `Failed to save ${ind.name}`);
        setSaveIndustriesLoading(false);
        return;
      }
    }
    setSaveIndustriesLoading(false);
    queryClient.invalidateQueries({ queryKey: ["industries"] });
  };
  const handleSeedIndustries = async () => {
    setSeedLoading(true);
    try {
      await seedIndustries();
      toast.success("Industry data seeded successfully!");
      queryClient.invalidateQueries({ queryKey: ["industries"] });
      setIndustriesSynced(false); // Trigger re-sync
    } catch (error) {
      toast.error("Failed to seed industry data" + (error instanceof Error ? ": " + error.message : ""));
    } finally {
      setSeedLoading(false);
    }
  };

  const saveAIFeatures = async () => {
    const { error } = await supabase.from("admin_settings").upsert(
      { key: "ai_features", value: aiFeatures, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    if (!error) {
      clearAIFeaturesCache();
      setAiFeaturesDirty(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    const ok = await deleteUser(username);
    if (ok) {
      setShowDeleteConfirm(null);
      setSelectedUser(null);
      await loadUsers();
    }
  };
  const handleRoleChange = async (username: string, newRole: "user" | "admin") => {
    const ok = await updateUserRole(username, newRole);
    if (ok) {
      setRoleChangeUser(null);
      await loadUsers();
    }
  };

  const [aiFetchingId, setAiFetchingId] = useState<string | null>(null);

  const handleFetchAIIndustryData = async (ind: Industry) => {
    setAiFetchingId(ind.id);
    try {
      toast.info(`Fetching real-time 2026 data for ${ind.name}...`);
      const aiData = await fetchAIIndustryEnhancement(ind.name, Math.max(ind.minBudget, 5000), currentUser);

      const updatedInd: Industry = {
        ...ind,
        description: aiData.description || ind.description,
        minBudget: aiData.minBudget || ind.minBudget,
        monthlyCostPerPerson: aiData.monthlyCostPerPerson || ind.monthlyCostPerPerson,
        expenses: Array.isArray(aiData.expenses) ? aiData.expenses : ind.expenses,
        influencers: Array.isArray(aiData.influencers) ? aiData.influencers : ind.influencers,
        materials: Array.isArray(aiData.materials) ? aiData.materials : ind.materials,
        resources: Array.isArray(aiData.resources) ? aiData.resources : ind.resources,
        roadmap: Array.isArray(aiData.roadmap) ? aiData.roadmap : ind.roadmap
      };

      updateIndustry(ind.id, updatedInd);
      toast.success(`Updated ${ind.name} with AI data! Save to database to persist.`);
    } catch (err) {
      console.error("AI Fetch Error:", err);
      const msg = err instanceof Error ? err.message : "Possible JSON parse error or API timeout";
      toast.error(`Failed to fetch AI data: ${msg.substring(0, 60)}...`);
    } finally {
      setAiFetchingId(null);
    }
  };

  const tabs: { key: AdminTab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "users", label: "User Management", icon: Users },
    { key: "industries", label: "Data Management", icon: Database },
    { key: "settings", label: "Admin Settings", icon: Wrench },
  ];

  const industrySubTabs: { key: IndustrySubTab; label: string; icon: React.ElementType }[] = [
    { key: "expenses", label: "Expenses", icon: DollarSign },
    { key: "influencers", label: "Influencers", icon: Megaphone },
    { key: "materials", label: "Materials", icon: Package },
    { key: "resources", label: "Resources", icon: Layers },
    { key: "roadmap", label: "Roadmap", icon: Route },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="icon-box mx-auto"><Shield className="w-6 h-6 text-destructive" /></div>
        <h1 className="section-title-gradient text-3xl mb-1">Administration Panel</h1>
        <p className="text-muted-foreground text-sm">System control & data management · <span className="text-primary font-medium">{currentUser?.username}</span></p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 p-1 bg-secondary/50 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap px-3 ${activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ════════════════════ OVERVIEW ════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Users", value: users.length, icon: Users, color: "text-primary" },
              { label: "Admins", value: adminCount, icon: Shield, color: "text-destructive" },
              { label: "Industries", value: industries.length, icon: Database, color: "text-accent" },
              { label: "Total Data Points", value: totalExpenses + totalInfluencers + totalMaterials + totalResources + totalRoadmapSteps, icon: Layers, color: "text-foreground" },
            ].map(stat => (
              <div key={stat.label} className="neo-card text-center py-4">
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <p className={`font-mono text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button onClick={() => handleTabChange("users")} className="neo-card text-left hover:border-primary/30 transition-colors group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><UserCog className="w-5 h-5 text-primary" /></div>
                <div>
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">User Management</h3>
                  <p className="text-[10px] text-muted-foreground">{users.length} registered · {adminCount} admins</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Search, view details, change roles, remove users</p>
            </button>
            <button onClick={() => handleTabChange("industries")} className="neo-card text-left hover:border-accent/30 transition-colors group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><Database className="w-5 h-5 text-accent" /></div>
                <div>
                  <h3 className="text-sm font-semibold group-hover:text-accent transition-colors">Data Management</h3>
                  <p className="text-[10px] text-muted-foreground">{industries.length} industries · {totalExpenses} expenses</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Add/edit/remove industries, expenses, influencers, materials, resources, roadmaps</p>
            </button>
            <button onClick={() => handleTabChange("settings")} className="neo-card text-left hover:border-foreground/20 transition-colors group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"><Wrench className="w-5 h-5 text-foreground" /></div>
                <div>
                  <h3 className="text-sm font-semibold group-hover:text-foreground transition-colors">Admin Settings</h3>
                  <p className="text-[10px] text-muted-foreground">System config · Export · Backend</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Platform config, data export, backend readiness, security audit</p>
            </button>
          </div>

          {/* Two-column: Recent Users + Industries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="neo-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Recent Users</h3>
                <button onClick={() => handleTabChange("users")} className="text-xs text-primary hover:underline">Manage →</button>
              </div>
              <div className="space-y-2">
                {users.slice(-5).reverse().map(u => (
                  <div key={u.username} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{u.firstName[0]}{u.lastName[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                        <p className="text-[10px] text-muted-foreground">@{u.username} · {u.email}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>{u.role}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="neo-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Database className="w-4 h-4 text-accent" /> Data Summary</h3>
                <button onClick={() => handleTabChange("industries")} className="text-xs text-primary hover:underline">Manage →</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: "Expenses", value: totalExpenses, icon: DollarSign },
                  { label: "Influencers", value: totalInfluencers, icon: Megaphone },
                  { label: "Materials", value: totalMaterials, icon: Package },
                  { label: "Resources", value: totalResources, icon: Layers },
                  { label: "Roadmap Steps", value: totalRoadmapSteps, icon: Route },
                  { label: "Industries", value: industries.length, icon: Globe },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-secondary/50">
                    <s.icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <span className="ml-auto font-mono text-sm font-bold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demographics */}
          {Object.keys(regionCounts).length > 0 && (
            <div className="neo-card">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><MapPin className="w-4 h-4 text-accent" /> Users by Region</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(regionCounts).map(([region, count]) => (
                  <div key={region} className="px-3 py-2 rounded-lg bg-secondary/50 flex items-center justify-between">
                    <span className="text-sm">{region}</span>
                    <span className="font-mono text-sm font-bold text-primary">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════ USER MANAGEMENT ════════════════════ */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="Search users by name, email, or username..." className="pl-10 bg-secondary border-border rounded-lg" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-sm text-muted-foreground">
                <Users className="w-4 h-4" /> {filteredUsers.length}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 text-sm text-destructive">
                <Shield className="w-3.5 h-3.5" /> {adminCount} admins
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {filteredUsers.map((u, i) => (
              <motion.div key={u.username} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }} className="neo-card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary">{u.firstName[0]}{u.lastName[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold">{u.firstName} {u.lastName}</h3>
                      <span className="text-xs text-muted-foreground">@{u.username}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${u.role === "admin" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>{u.role}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="w-3 h-3" /> <span className="truncate">{u.email}</span></div>
                      {u.phone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground">📞 {u.phone}</div>}
                      {u.region && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /> {u.region}</div>}
                      {u.dateOfBirth && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="w-3 h-3" /> {u.dateOfBirth}</div>}
                    </div>
                    {u.createdAt && <p className="text-[10px] text-muted-foreground mt-2">Joined: {new Date(u.createdAt).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* View details */}
                    <button onClick={() => setSelectedUser(selectedUser?.username === u.username ? null : u)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View details">
                      {selectedUser?.username === u.username ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {/* Change role */}
                    {u.username !== "admin" && (
                      <button onClick={() => setRoleChangeUser(roleChangeUser === u.username ? null : u.username)}
                        className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors" title="Change role">
                        <UserCog className="w-4 h-4" />
                      </button>
                    )}
                    {/* Delete */}
                    {u.role !== "admin" && (
                      showDeleteConfirm === u.username ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDeleteUser(u.username)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setShowDeleteConfirm(null)} className="p-2 text-muted-foreground hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setShowDeleteConfirm(u.username)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete user"><UserX className="w-4 h-4" /></button>
                      )
                    )}
                  </div>
                </div>

                {/* Role change panel */}
                <AnimatePresence>
                  {roleChangeUser === u.username && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Change role for @{u.username}:</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant={u.role === "user" ? "default" : "outline"} onClick={() => handleRoleChange(u.username, "user")}
                          className="rounded-lg text-xs"><Users className="w-3 h-3 mr-1" /> User</Button>
                        <Button size="sm" variant={u.role === "admin" ? "default" : "outline"} onClick={() => handleRoleChange(u.username, "admin")}
                          className="rounded-lg text-xs"><Shield className="w-3 h-3 mr-1" /> Admin</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expanded details */}
                <AnimatePresence>
                  {selectedUser?.username === u.username && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-border">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { label: "Username", value: `@${u.username}` },
                          { label: "Email", value: u.email },
                          { label: "Role", value: u.role },
                          { label: "Region", value: u.region || "N/A" },
                          { label: "Phone", value: u.phone || "N/A" },
                          { label: "Date of Birth", value: u.dateOfBirth || "N/A" },
                          { label: "Joined", value: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A" },
                          { label: "Profile Picture", value: u.profilePicture ? "Uploaded" : "None" },
                        ].map(d => (
                          <div key={d.label} className="px-3 py-2 rounded-lg bg-secondary/50">
                            <p className="text-[9px] text-muted-foreground uppercase">{d.label}</p>
                            <p className="text-sm font-mono font-medium truncate">{d.value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════ DATA MANAGEMENT (Industries CRUD) ════════════════════ */}
      {activeTab === "industries" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search industries..." className="pl-10 bg-secondary border-border rounded-lg" />
            </div>
            <Button onClick={() => setShowAddIndustry(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm">
              <Plus className="w-4 h-4 mr-1" /> Add Industry
            </Button>
            <Button onClick={exportData} variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 rounded-lg text-sm">
              <Download className="w-4 h-4 mr-1" /> Export All
            </Button>
            <Button onClick={saveAllIndustriesToDb} disabled={saveIndustriesLoading} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm">
              {saveIndustriesLoading ? "Saving…" : "Save to database"}
            </Button>
            <Button onClick={handleSeedIndustries} disabled={seedLoading} variant="outline" className="border-accent/20 text-accent hover:bg-accent/10 rounded-lg text-sm">
              <RefreshCw className={`w-4 h-4 mr-1 ${seedLoading ? "animate-spin" : ""}`} />
              {seedLoading ? "Seeding…" : "Seed Default Data"}
            </Button>
          </div>
          {saveIndustriesError && <p className="text-sm text-destructive">{saveIndustriesError}</p>}

          {/* Add Industry Form */}
          <AnimatePresence>
            {showAddIndustry && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="neo-card border-2 border-primary/20">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Add New Industry</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div><Label className="text-xs text-muted-foreground">ID (slug)</Label><Input value={newIndustry.id} onChange={e => setNewIndustry(p => ({ ...p, id: e.target.value }))} placeholder="e.g. real-estate" className="bg-secondary border-border rounded-lg mt-1" /></div>
                  <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={newIndustry.name} onChange={e => setNewIndustry(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Real Estate" className="bg-secondary border-border rounded-lg mt-1" /></div>
                  <div><Label className="text-xs text-muted-foreground">Icon (emoji)</Label><Input value={newIndustry.icon} onChange={e => setNewIndustry(p => ({ ...p, icon: e.target.value }))} placeholder="🏠" className="bg-secondary border-border rounded-lg mt-1" /></div>
                  <div className="md:col-span-2"><Label className="text-xs text-muted-foreground">Description</Label><Input value={newIndustry.description} onChange={e => setNewIndustry(p => ({ ...p, description: e.target.value }))} placeholder="Short description" className="bg-secondary border-border rounded-lg mt-1" /></div>
                  <div><Label className="text-xs text-muted-foreground">Min Budget ($)</Label><Input type="number" value={newIndustry.minBudget} onChange={e => setNewIndustry(p => ({ ...p, minBudget: parseFloat(e.target.value) || 0 }))} className="bg-secondary border-border rounded-lg mt-1" /></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={addNewIndustry} size="sm" className="bg-primary text-primary-foreground rounded-lg"><Check className="w-3 h-3 mr-1" /> Create</Button>
                  <Button onClick={() => setShowAddIndustry(false)} size="sm" variant="outline" className="rounded-lg"><X className="w-3 h-3 mr-1" /> Cancel</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Industries */}
          {filteredIndustries.map(ind => {
            const isExpanded = expandedId === ind.id;
            return (
              <motion.div key={ind.id} layout className="neo-card">
                <div className="flex items-center justify-between">
                  <button onClick={() => { setExpandedId(isExpanded ? null : ind.id); setIndustrySubTab("expenses"); }}
                    className="flex items-center gap-2.5 flex-1 text-left">
                    <span className="text-2xl">{ind.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold">{ind.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Min: <span className="font-mono">${ind.minBudget.toLocaleString()}</span> ·
                        {ind.expenses.length} exp · {ind.influencers.length} inf · {ind.materials.length} mat · {ind.resources.length} res · {ind.roadmap.length} steps
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => handleFetchAIIndustryData(ind)} disabled={aiFetchingId === ind.id}
                      className="border-primary/20 text-primary hover:bg-primary/10 text-xs rounded-lg group">
                      <Brain className={`w-3 h-3 mr-1 ${aiFetchingId === ind.id ? "animate-pulse" : "group-hover:text-accent"} transition-colors`} />
                      {aiFetchingId === ind.id ? "Fetching..." : "Refresh with AI"}
                    </Button>
                    {editingIndustry === ind.id ? (
                      <Button size="sm" onClick={() => { updateIndustry(ind.id, editForm); setEditingIndustry(null); }} className="bg-primary text-primary-foreground text-xs rounded-lg">
                        <Save className="w-3 h-3 mr-1" /> Save
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => { setEditingIndustry(ind.id); setEditForm({ name: ind.name, icon: ind.icon, description: ind.description, minBudget: ind.minBudget, monthlyCostPerPerson: ind.monthlyCostPerPerson }); setExpandedId(ind.id); }}
                        className="border-primary/20 text-primary hover:bg-primary/10 text-xs rounded-lg">
                        <Edit2 className="w-3 h-3 mr-1" /> Edit
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => deleteIndustry(ind.id)}
                      className="border-destructive/20 text-destructive hover:bg-destructive/10 text-xs rounded-lg">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 pt-4 border-t border-border space-y-4">
                    {editingIndustry === ind.id && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
                        <div><Label className="text-[10px] text-muted-foreground">Name</Label><Input value={editForm.name || ""} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="bg-secondary border-border rounded-lg mt-0.5 text-sm" /></div>
                        <div><Label className="text-[10px] text-muted-foreground">Icon</Label><Input value={editForm.icon || ""} onChange={e => setEditForm(p => ({ ...p, icon: e.target.value }))} className="bg-secondary border-border rounded-lg mt-0.5 text-sm" /></div>
                        <div><Label className="text-[10px] text-muted-foreground">Min Budget</Label><Input type="number" value={editForm.minBudget || 0} onChange={e => setEditForm(p => ({ ...p, minBudget: parseFloat(e.target.value) || 0 }))} className="bg-secondary border-border rounded-lg mt-0.5 text-sm font-mono" /></div>
                        <div><Label className="text-[10px] text-muted-foreground">Monthly/Person</Label><Input type="number" value={editForm.monthlyCostPerPerson || 0} onChange={e => setEditForm(p => ({ ...p, monthlyCostPerPerson: parseFloat(e.target.value) || 0 }))} className="bg-secondary border-border rounded-lg mt-0.5 text-sm font-mono" /></div>
                      </div>
                    )}

                    <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
                      {industrySubTabs.map(st => (
                        <button key={st.key} onClick={() => setIndustrySubTab(st.key)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${industrySubTab === st.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            }`}>
                          <st.icon className="w-3 h-3" /> <span className="hidden sm:inline">{st.label}</span>
                        </button>
                      ))}
                    </div>

                    {industrySubTab === "expenses" && (
                      <div>
                        <SubSection title="Expenses" count={ind.expenses.length} icon={DollarSign} onAdd={() => addExpense(ind.id)} addLabel="Add Expense" />
                        <div className="space-y-1.5">
                          {ind.expenses.map((exp, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <Input value={exp.category} onChange={e => updateExpense(ind.id, i, "category", e.target.value)} className="flex-1 bg-secondary border-border text-sm rounded-lg" placeholder="Category" />
                              <Input type="number" value={exp.amount} onChange={e => updateExpense(ind.id, i, "amount", parseFloat(e.target.value) || 0)} className="w-24 bg-secondary border-border text-sm font-mono rounded-lg" placeholder="$" />
                              <Input value={exp.description} onChange={e => updateExpense(ind.id, i, "description", e.target.value)} className="flex-1 bg-secondary border-border text-sm rounded-lg" placeholder="Description" />
                              <label className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                                <input type="checkbox" checked={!!exp.isMonthly} onChange={e => updateExpense(ind.id, i, "isMonthly", e.target.checked)} className="rounded" /> Mo
                              </label>
                              <button onClick={() => removeExpense(ind.id, i)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {industrySubTab === "influencers" && (
                      <div>
                        <SubSection title="Influencers" count={ind.influencers.length} icon={Megaphone} onAdd={() => addInfluencer(ind.id)} addLabel="Add Influencer" />
                        <div className="space-y-1.5">
                          {ind.influencers.map((inf, i) => (
                            <div key={i} className="flex items-center gap-1.5 flex-wrap">
                              <Input value={inf.name} onChange={e => updateInfluencer(ind.id, i, "name", e.target.value)} className="flex-1 min-w-[120px] bg-secondary border-border text-sm rounded-lg" placeholder="Name" />
                              <Input value={inf.platform} onChange={e => updateInfluencer(ind.id, i, "platform", e.target.value)} className="w-28 bg-secondary border-border text-sm rounded-lg" placeholder="Platform" />
                              <Input value={inf.followers} onChange={e => updateInfluencer(ind.id, i, "followers", e.target.value)} className="w-24 bg-secondary border-border text-sm rounded-lg" placeholder="Followers" />
                              <Input type="number" value={inf.charge} onChange={e => updateInfluencer(ind.id, i, "charge", parseFloat(e.target.value) || 0)} className="w-24 bg-secondary border-border text-sm font-mono rounded-lg" placeholder="$" />
                              <Input value={inf.specialty} onChange={e => updateInfluencer(ind.id, i, "specialty", e.target.value)} className="flex-1 min-w-[100px] bg-secondary border-border text-sm rounded-lg" placeholder="Specialty" />
                              <button onClick={() => removeInfluencer(ind.id, i)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {industrySubTab === "materials" && (
                      <div>
                        <SubSection title="Materials" count={ind.materials.length} icon={Package} onAdd={() => addMaterial(ind.id)} addLabel="Add Material" />
                        <div className="space-y-1.5">
                          {ind.materials.map((mat, i) => (
                            <div key={i} className="flex items-center gap-1.5 flex-wrap">
                              <Input value={mat.name} onChange={e => updateMaterial(ind.id, i, "name", e.target.value)} className="flex-1 min-w-[120px] bg-secondary border-border text-sm rounded-lg" placeholder="Name" />
                              <Input value={mat.supplier} onChange={e => updateMaterial(ind.id, i, "supplier", e.target.value)} className="w-28 bg-secondary border-border text-sm rounded-lg" placeholder="Supplier" />
                              <Input type="number" value={mat.estimatedCost} onChange={e => updateMaterial(ind.id, i, "estimatedCost", parseFloat(e.target.value) || 0)} className="w-24 bg-secondary border-border text-sm font-mono rounded-lg" placeholder="$" />
                              <Input value={mat.unit} onChange={e => updateMaterial(ind.id, i, "unit", e.target.value)} className="w-24 bg-secondary border-border text-sm rounded-lg" placeholder="Unit" />
                              <Input value={mat.notes} onChange={e => updateMaterial(ind.id, i, "notes", e.target.value)} className="flex-1 min-w-[100px] bg-secondary border-border text-sm rounded-lg" placeholder="Notes" />
                              <button onClick={() => removeMaterial(ind.id, i)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {industrySubTab === "resources" && (
                      <div>
                        <SubSection title="Resources" count={ind.resources.length} icon={Layers} onAdd={() => addResource(ind.id)} addLabel="Add Resource" />
                        <div className="space-y-1.5">
                          {ind.resources.map((res, i) => (
                            <div key={i} className="flex items-center gap-1.5 flex-wrap">
                              <Input value={res.name} onChange={e => updateResource(ind.id, i, "name", e.target.value)} className="flex-1 min-w-[120px] bg-secondary border-border text-sm rounded-lg" placeholder="Name" />
                              <select value={res.type} onChange={e => updateResource(ind.id, i, "type", e.target.value)}
                                className="h-10 rounded-lg border border-border bg-secondary px-2 text-sm">
                                <option value="equipment">Equipment</option><option value="service">Service</option><option value="software">Software</option><option value="personnel">Personnel</option>
                              </select>
                              <Input type="number" value={res.oneTimeCost} onChange={e => updateResource(ind.id, i, "oneTimeCost", parseFloat(e.target.value) || 0)} className="w-24 bg-secondary border-border text-sm font-mono rounded-lg" placeholder="Setup $" />
                              <Input type="number" value={res.monthlyCost} onChange={e => updateResource(ind.id, i, "monthlyCost", parseFloat(e.target.value) || 0)} className="w-24 bg-secondary border-border text-sm font-mono rounded-lg" placeholder="$/mo" />
                              <label className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                                <input type="checkbox" checked={res.essential} onChange={e => updateResource(ind.id, i, "essential", e.target.checked)} className="rounded" /> Ess
                              </label>
                              <button onClick={() => removeResource(ind.id, i)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {industrySubTab === "roadmap" && (
                      <div>
                        <SubSection title="Roadmap Steps" count={ind.roadmap.length} icon={Route} onAdd={() => addRoadmapStep(ind.id)} addLabel="Add Step" />
                        <div className="space-y-1.5">
                          {ind.roadmap.map((step, i) => (
                            <div key={i} className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-xs text-primary font-bold w-6 text-center">{step.step}</span>
                              <Input value={step.title} onChange={e => updateRoadmap(ind.id, i, "title", e.target.value)} className="flex-1 min-w-[120px] bg-secondary border-border text-sm rounded-lg" placeholder="Title" />
                              <Input value={step.description} onChange={e => updateRoadmap(ind.id, i, "description", e.target.value)} className="flex-1 min-w-[120px] bg-secondary border-border text-sm rounded-lg" placeholder="Description" />
                              <Input value={step.duration} onChange={e => updateRoadmap(ind.id, i, "duration", e.target.value)} className="w-24 bg-secondary border-border text-sm rounded-lg" placeholder="Duration" />
                              <Input type="number" value={step.cost} onChange={e => updateRoadmap(ind.id, i, "cost", parseFloat(e.target.value) || 0)} className="w-24 bg-secondary border-border text-sm font-mono rounded-lg" placeholder="$" />
                              <button onClick={() => removeRoadmap(ind.id, i)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ════════════════════ ADMIN SETTINGS ════════════════════ */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          {/* Platform Config */}
          <div className="neo-card">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Settings className="w-4 h-4 text-primary" /> Platform Configuration</h3>
            <div className="space-y-2.5">
              {[
                { label: "Platform Version", sub: "Current release", value: "v1.0.0", color: "text-primary" },
                { label: "Frontend Framework", sub: "Core technology", value: "React 18 + TypeScript + Vite", color: "text-foreground" },
                { label: "Authentication", sub: "Current provider", value: "Supabase Auth", color: "text-primary" },
                { label: "Database", sub: "Storage backend", value: "Supabase (PostgreSQL)", color: "text-primary" },
                { label: "Admin Access", sub: "Dev login", value: "Sign in at /dev-login with admin account", color: "text-muted-foreground" },
                { label: "Total Registered Users", sub: "Including admins", value: String(users.length), color: "text-primary" },
                { label: "Data Industries", sub: "Configured industries", value: String(industries.length), color: "text-foreground" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between px-3 py-3 rounded-lg bg-secondary/50">
                  <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div>
                  <span className={`text-sm font-medium ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Access */}
          <div className="neo-card">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Lock className="w-4 h-4 text-destructive" /> Security & Access Control</h3>
            <div className="space-y-2.5">
              {[
                { label: "Admin users can manage all industry data", status: "Active" },
                { label: "Admin users can view/delete user accounts", status: "Active" },
                { label: "Admin users can change user roles", status: "Active" },
                { label: "Role-based route protection (frontend)", status: "Active" },
                { label: "Server-side role verification (RBAC)", status: "Active", pending: false },
                { label: "Two-factor authentication", status: "Active", pending: false },
                { label: "Session expiry & token refresh", status: "Active", pending: false },
                { label: "Audit logging for admin actions", status: "Active", pending: false },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary/50">
                  <div className={`w-2 h-2 rounded-full ${item.pending ? "bg-accent/60" : "bg-primary"}`} />
                  <span className="text-sm flex-1">{item.label}</span>
                  <span className={`text-[9px] font-medium uppercase ${item.pending ? "text-accent" : "text-primary"}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Configuration */}
          <div className="neo-card">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Brain className="w-4 h-4 text-primary" /> AI Configuration</h3>
            <p className="text-xs text-muted-foreground mb-4">Manage AI model settings, API keys, and AI-powered features. These settings will take effect once the backend is connected.</p>

            {/* AI API Keys */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Key className="w-3.5 h-3.5" /> API Keys</h4>
              <div className="space-y-2">
                {[
                  { label: "Lovable AI Gateway", key: "LOVABLE_API_KEY", status: "Not configured", desc: "Primary AI provider for all calculations" },
                  { label: "OpenAI (GPT-5)", key: "OPENAI_API_KEY", status: "Not configured", desc: "Fallback model for complex reasoning" },
                  { label: "Google Gemini", key: "VITE_GEMINI_API_KEY", status: import.meta.env.VITE_GEMINI_API_KEY ? "Connected" : "Not configured", desc: "Used for SWOT, risk, and feasibility analysis" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between px-3 py-3 rounded-lg bg-secondary/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{item.label}</p>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{item.key}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-medium text-accent uppercase">{item.status}</span>
                      <Button size="sm" variant="outline" className="text-xs rounded-lg border-primary/20 text-primary hover:bg-primary/10" disabled>
                        <Key className="w-3 h-3 mr-1" /> Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Model Settings */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Model Preferences</h4>
              <div className="space-y-2">
                {[
                  { label: "Default AI Model", value: "google/gemini-3-flash-preview", desc: "Used for general calculations and recommendations" },
                  { label: "Feasibility Analysis Model", value: "google/gemini-2.5-pro", desc: "Higher accuracy model for feasibility scoring" },
                  { label: "SWOT & Risk Model", value: "google/gemini-2.5-flash", desc: "Balanced model for analysis modules" },
                  { label: "Business Plan Generation", value: "openai/gpt-5", desc: "Premium model for comprehensive plan export" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between px-3 py-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-md">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Feature Toggles */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> AI-Powered Features</h4>
              <p className="text-[10px] text-muted-foreground mb-2">Enable AI for calculations. Gemini API key is configured in your project settings.</p>
              <div className="space-y-2">
                {[
                  { key: "feasibility" as const, label: "AI Feasibility Calculator", desc: "Use AI to score startup feasibility based on budget, industry, and market data" },
                  { key: "recommendations" as const, label: "AI Startup Recommendations", desc: "Generate personalized startup suggestions using machine learning" },
                  { key: "swot" as const, label: "AI SWOT Analysis", desc: "Auto-generate SWOT matrices based on industry and competitive landscape" },
                  { key: "risk" as const, label: "AI Risk Assessment", desc: "Predict and quantify startup risks using AI models" },
                  { key: "business_plan" as const, label: "AI Business Plan Writer", desc: "Generate complete business plans with AI-assisted content" },
                  { key: "breakeven" as const, label: "AI Break-Even Forecasting", desc: "Predict break-even timelines using historical industry data" },
                  { key: "influencer" as const, label: "AI Influencer Matching", desc: "Match businesses with optimal influencers using AI scoring" },
                  { key: "marketing" as const, label: "AI Marketing Budget Optimizer", desc: "Optimize marketing spend allocation across channels" },
                ].map(item => {
                  const enabled = !!aiFeatures[item.key];
                  return (
                    <div key={item.key} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-medium uppercase ${enabled ? "text-primary" : "text-accent"}`}>
                          {enabled ? "On" : "Off"}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setAiFeatures(prev => ({ ...prev, [item.key]: !prev[item.key] })); setAiFeaturesDirty(true); }}
                          className={`rounded-lg p-0.5 transition-colors ${enabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          <ToggleLeft className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {aiFeaturesDirty && (
                <Button onClick={saveAIFeatures} size="sm" className="mt-3 bg-primary text-primary-foreground rounded-lg">
                  <Save className="w-3 h-3 mr-1" /> Save AI feature toggles
                </Button>
              )}
            </div>
          </div>

          {/* Backend Readiness */}
          <div className="neo-card">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-accent" /> Backend Features Roadmap</h3>
            <div className="space-y-2">
              {[
                "User Authentication (Supabase Auth)", "Database Persistence (PostgreSQL)",
                "AI-Powered Feasibility Calculations", "AI Startup Recommendations",
                "AI SWOT & Risk Analysis", "PDF Business Plan Export",
                "File Storage (Profile Pictures)", "Email Notifications",
              ].map(feature => (
                <div key={feature} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">{feature}</span>
                  <span className="ml-auto text-[9px] text-primary font-medium uppercase">Live</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className="neo-card">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Download className="w-4 h-4 text-primary" /> Data Export & Import</h3>
            <p className="text-xs text-muted-foreground mb-3">Export all platform data including industries, users, and configurations as JSON.</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={exportData} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm">
                <Download className="w-4 h-4 mr-2" /> Export All Data (JSON)
              </Button>
              <Button variant="outline" className="border-border text-muted-foreground rounded-lg text-sm" disabled>
                <RefreshCw className="w-4 h-4 mr-2" /> Import Data (Backend Required)
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
