import { useState } from "react";
import { motion } from "framer-motion";
import { Store, ArrowRight, Check, Lock, Zap, Sparkles, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIndustries } from "@/hooks/useIndustries";
import { useAppContext } from "@/context/AppContext";
import { fetchAIIndustrySuggestions, type AIIndustrySuggestion } from "@/services/aiService";
import { saveIndustryToSupabase, seedTopIndustriesToSupabase } from "@/services/industryAdminService";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type Industry } from "@/data/industries";
import { buildIndustryWithDefaults } from "@/data/industryTemplateEngine";

function normalizeIndustryId(value: string): string {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || `industry-${Date.now()}`;
}

export default function IndustryPage() {
  const { data: industries = [] } = useIndustries();
  const { budget, selectedIndustry, setSelectedIndustry, enhancedIndustry, isEnhancing, enhanceIndustryWithAI } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [customQuery, setCustomQuery] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<AIIndustrySuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [hasSeededTopIndustries, setHasSeededTopIndustries] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // New Filters
  const [filterAffordable, setFilterAffordable] = useState(false);
  const [filterSource, setFilterSource] = useState<'all' | 'db' | 'ai'>('all');
  const [filterBudgetTier, setFilterBudgetTier] = useState<'all' | 'low' | 'mid' | 'high'>('all');

  // Build an Industry object from an AI suggestion
  const aiToIndustry = (s: AIIndustrySuggestion): Industry => ({
    ...buildIndustryWithDefaults(s),
    id: normalizeIndustryId(s.name),
  });

  const handleSelect = async (ind: Industry, isFromAI: boolean) => {
    try {
      setSelectedIndustry(ind);
      toast.success(`Selected ${ind.name}`);

      // If this is an AI-suggested industry or not in the DB, save it immediately
      // This ensures the industry list grows automatically as users select new ones
      const isAlreadyInDb = industries.some(i => i.id === ind.id);
      
      if (isFromAI || !isAlreadyInDb) {
        console.log("Saving new industry to database:", ind.name);
        const { ok, error } = await saveIndustryToSupabase(ind);
        if (ok) {
          queryClient.invalidateQueries({ queryKey: ["industries"] });
          toast.success(`${ind.name} saved to industry database`);
        } else {
          console.error("Auto-save failed:", error);
          toast.error(`Could not save ${ind.name}: ${error || "unknown database error"}`);
        }
      }
    } catch (err) {
      console.error("Selection error:", err);
      toast.error("Failed to select industry");
    }
  };

  const handleGetAISuggestions = async () => {
    if (budget <= 0) {
      toast.error("Please set a budget first on the Budget page.");
      return;
    }
    setIsFetchingSuggestions(true);
    try {
      if (user?.role === "admin" && !hasSeededTopIndustries) {
        const seeded = await seedTopIndustriesToSupabase();
        if (seeded.ok) {
          setHasSeededTopIndustries(true);
          queryClient.invalidateQueries({ queryKey: ["industries"] });
        } else {
          console.error("Failed to seed top industries:", seeded.error);
        }
      }

      const suggestions = await fetchAIIndustrySuggestions(budget, user, customQuery);
      setAiSuggestions(suggestions);
      if (suggestions.length === 0) {
        toast.info("No suggestions found. Try a different budget.");
      } else {
        toast.success(`Found ${suggestions.length} AI suggestions from top industries.`);
      }
    } catch (err) {
      console.error("AI Suggestions Error:", err);
      toast.error("Failed to get AI suggestions. Try again.");
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  // Merge database industries + AI suggestions (deduplicate by name)
  const aiIndustries = aiSuggestions
    .filter((s) => {
      const normalizedName = s.name.toLowerCase().trim();
      const normalizedId = normalizeIndustryId(s.name);
      return !industries.some(
        (i) => i.name.toLowerCase().trim() === normalizedName || i.id === normalizedId
      );
    })
    .map(aiToIndustry);

  const allIndustries = [...industries, ...aiIndustries];

  // Apply search and then filters
  const filteredIndustries = allIndustries.filter((ind) => {
    // 1. Search Query
    const searchMatch = !customQuery.trim() || 
      ind.name.toLowerCase().includes(customQuery.toLowerCase()) ||
      ind.description.toLowerCase().includes(customQuery.toLowerCase());
    if (!searchMatch) return false;

    // 2. Affordability
    if (filterAffordable && budget > 0 && ind.minBudget > budget) return false;

    // 3. Source
    const isFromAI = aiIndustries.some((ai) => ai.id === ind.id);
    if (filterSource === 'db' && isFromAI) return false;
    if (filterSource === 'ai' && !isFromAI) return false;

    // 4. Budget Tier
    if (filterBudgetTier === 'low' && ind.minBudget > 10000) return false;
    if (filterBudgetTier === 'mid' && (ind.minBudget <= 10000 || ind.minBudget > 50000)) return false;
    if (filterBudgetTier === 'high' && ind.minBudget <= 50000) return false;

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredIndustries.length / ITEMS_PER_PAGE);
  const paginatedIndustries = filteredIndustries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when search/filters change
  const handleSearchChange = (val: string) => {
    setCustomQuery(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (type: string, value: any) => {
    if (type === 'affordable') setFilterAffordable(value);
    if (type === 'source') setFilterSource(value);
    if (type === 'tier') setFilterBudgetTier(value);
    setCurrentPage(1);
  };

  // Handle Enter key in search to trigger AI suggestions
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customQuery.trim() && filteredIndustries.length === 0) {
      handleGetAISuggestions();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto page-enter pb-12">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Store className="w-6 h-6 text-primary" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Industries</h1>
        <p className="text-muted-foreground text-sm">
          {budget > 0 ? `$${budget.toLocaleString()} budget — ` : ""}Choose or get AI-suggested industries
        </p>
      </div>

      {/* Search & AI Suggest Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search industries or type your idea..."
            value={customQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={handleGetAISuggestions}
          disabled={isFetchingSuggestions || budget <= 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all disabled:opacity-50"
        >
          {isFetchingSuggestions ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isFetchingSuggestions ? "Finding..." : "Suggest with AI"}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Affordability</label>
          <button 
            onClick={() => handleFilterChange('affordable', !filterAffordable)}
            className={`text-xs px-2.5 py-1 rounded-full transition-all ${filterAffordable ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            My Budget
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Source</label>
          {(['all', 'db', 'ai'] as const).map((s) => (
            <button 
              key={s}
              onClick={() => handleFilterChange('source', s)}
              className={`text-xs px-2.5 py-1 rounded-full transition-all capitalize ${filterSource === s ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              {s === 'db' ? 'Verified' : s === 'ai' ? 'AI' : 'All'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Tier</label>
          {(['all', 'low', 'mid', 'high'] as const).map((t) => (
            <button 
              key={t}
              onClick={() => handleFilterChange('tier', t)}
              className={`text-xs px-2.5 py-1 rounded-full transition-all capitalize ${filterBudgetTier === t ? 'bg-secondary text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              {t}
            </button>
          ))}
        </div>
        
        {(filterAffordable || filterSource !== 'all' || filterBudgetTier !== 'all') && (
          <button 
            onClick={() => {
              setFilterAffordable(false);
              setFilterSource('all');
              setFilterBudgetTier('all');
              setCurrentPage(1);
            }}
            className="text-[10px] font-bold text-primary hover:underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Industry cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {paginatedIndustries.map((ind, i) => {
          const isSelected = selectedIndustry?.id === ind.id || selectedIndustry?.name === ind.name;
          const displayData = isSelected && enhancedIndustry ? enhancedIndustry : ind;
          const affordable = budget >= displayData.minBudget;
          const isFromAI = aiIndustries.some((ai) => ai.id === ind.id);

          return (
            <motion.button key={ind.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }} onClick={() => handleSelect(ind, isFromAI)}
              className={`neo-card text-left relative transition-all duration-300 ${isSelected ? "border-primary/60 ring-1 ring-primary/20 bg-primary/5" : ""} ${!affordable && budget > 0 ? "opacity-40" : ""}`}>
              {isFromAI && (
                <div className="absolute top-2 left-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">AI</span>
                </div>
              )}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              {!affordable && budget > 0 && !isSelected && (
                <div className="absolute top-3 right-3"><Lock className="w-3.5 h-3.5 text-muted-foreground" /></div>
              )}
              <div className="text-3xl mb-2">{ind.icon}</div>
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                {ind.name}
                {isSelected && enhancedIndustry && <Zap className="w-3 h-3 text-primary animate-pulse" />}
              </h3>
              <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed min-h-[32px]">
                {displayData.description}
              </p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Entry Cost</span>
                <span className={`font-mono font-bold ${affordable || budget === 0 ? "text-primary" : "text-destructive"}`}>
                  ${displayData.minBudget.toLocaleString()}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-secondary text-muted-foreground disabled:opacity-30 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Simple logic to show a few pages around current
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 3 + i + 1;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    currentPage === pageNum 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-secondary text-muted-foreground disabled:opacity-30 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Empty state */}
      {filteredIndustries.length === 0 && !isFetchingSuggestions && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm mb-3">
            No industries match "<strong>{customQuery}</strong>".
          </p>
          <button
            onClick={handleGetAISuggestions}
            disabled={budget <= 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Discover with AI
          </button>
        </div>
      )}

      {/* Loading state */}
      {isFetchingSuggestions && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">AI is searching for the best industries for your budget...</p>
        </div>
      )}

      {/* Action buttons */}
      {selectedIndustry && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={enhanceIndustryWithAI}
              disabled={isEnhancing}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${enhancedIndustry
                ? "bg-secondary text-muted-foreground cursor-default"
                : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                }`}
            >
              <Zap className={`w-4 h-4 ${isEnhancing ? "animate-pulse" : ""}`} />
              {isEnhancing ? "Researching Market..." : enhancedIndustry ? "AI Enhanced & Verified" : "Enhance with AI"}
            </button>

            <button onClick={() => navigate("/dashboard/feasibility")}
              className="inline-flex items-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:translate-y-[-1px]">
              Proceed to Analysis <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {!enhancedIndustry && !isEnhancing && (
            <p className="text-[10px] text-muted-foreground italic">
              * Click "Enhance" to get genuine 2026 market costing and tailored insights.
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
