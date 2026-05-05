import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, ArrowRight, Sparkles, Loader2, Info } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useIndustries } from "@/hooks/useIndustries";
import { calculateFeasibility } from "@/data/industries";
import { useNavigate } from "react-router-dom";
import { fetchAIIndustrySuggestions, type AIIndustrySuggestion } from "@/services/aiService";
import { toast } from "sonner";

export default function RecommendationsPage() {
  const { data: industries = [] } = useIndustries();
  const { budget, setSelectedIndustry, teamSize, monthsToRun } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [aiSuggestions, setAiSuggestions] = useState<AIIndustrySuggestion[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const recommendations =
    budget > 0
      ? industries
        .filter((i) => budget >= i.minBudget * 0.7)
        .sort((a, b) => Math.abs(budget - a.minBudget) - Math.abs(budget - b.minBudget))
      : [];

  const handleGetAiSuggestions = async () => {
    if (budget <= 0) {
      toast.error("Please set a budget first");
      return;
    }
    setLoadingAI(true);
    try {
      const suggestions = await fetchAIIndustrySuggestions(budget, user);
      setAiSuggestions(suggestions);
      toast.success("AI found 5 matching industries for you!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch AI suggestions. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSelectAI = (s: AIIndustrySuggestion) => {
    // Treat AI suggestion as a temporary industry object
    const indObj = {
      id: s.name.toLowerCase().replace(/\s+/g, '-'),
      name: s.name,
      icon: s.icon,
      description: s.description,
      minBudget: s.minBudget,
      monthlyCostPerPerson: budget / 20, // Rough estimate for now
    };
    setSelectedIndustry(indObj as any);
    navigate("/dashboard/industry"); // Go to industry enhancement page to fill in the rest
    toast.info(`Initial data set for ${s.name}. Enhancing with Gemini...`);
  };

  if (budget <= 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 page-enter">
        <Brain className="w-10 h-10 text-accent mb-3" />
        <h2 className="text-base font-semibold mb-1">Set Your Budget First</h2>
        <button onClick={() => navigate("/dashboard/budget")} className="text-primary underline text-sm">Go to Budget</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto page-enter">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Brain className="w-6 h-6 text-accent" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Market Recommendations</h1>
        <p className="text-muted-foreground text-sm">${budget.toLocaleString()} · {teamSize} ppl · {monthsToRun}mo</p>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={handleGetAiSuggestions}
          disabled={loadingAI}
          className="relative group px-6 py-3 bg-card border border-primary/20 rounded-xl flex items-center gap-2.5 transition-all hover:border-primary/50 hover:shadow-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {loadingAI ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 text-primary" />
          )}
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">Get AI Suggestions</p>
            <p className="text-[10px] text-muted-foreground">Personalized match by Gemini AI</p>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {aiSuggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-10 overflow-hidden">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4 px-1">
              <Sparkles className="w-4 h-4 text-primary" /> Gemini AI Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiSuggestions.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className="neo-card border-primary/20 hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() => handleSelectAI(s)}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl w-10 h-10 flex items-center justify-center bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                      {s.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold mb-0.5">{s.name}</h4>
                      <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2">{s.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-primary font-bold">MIN BUDGET: ${s.minBudget.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-accent flex items-center gap-1 group-hover:gap-1.5 transition-all">
                          SELECT <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4 px-1">
          <Info className="w-4 h-4 text-muted-foreground" /> Standard Market Suggestions
        </h2>
        {recommendations.length === 0 ? (
          <div className="neo-card text-center py-10"><p className="text-muted-foreground">Budget too low for standard markets. Try the AI suggestions above!</p></div>
        ) : (
          <div className="space-y-2.5">
            {recommendations.map((ind, i) => {
              const r = calculateFeasibility(budget, ind, teamSize, monthsToRun);
              return (
                <motion.div key={ind.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="neo-card flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl">{ind.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold">{ind.name}</h3>
                        {i === 0 && <span className="px-2 py-0.5 bg-accent/15 text-accent rounded text-[9px] tracking-wider font-semibold uppercase">Typical Startup</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{ind.description}</p>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <span className="bg-secondary px-2 py-0.5 rounded font-mono"><span className="text-muted-foreground">Min: </span><span className="text-primary">${ind.minBudget.toLocaleString()}</span></span>
                        <span className="bg-secondary px-2 py-0.5 rounded font-mono"><span className="text-muted-foreground">Score: </span><span className={r.feasibilityScore >= 100 ? "text-success" : "text-accent"}>{r.feasibilityScore}%</span></span>
                        <span className="bg-secondary px-2 py-0.5 rounded font-mono"><span className="text-muted-foreground">Run: </span><span className={r.runway >= monthsToRun ? "text-success" : "text-destructive"}>{r.runway}mo</span></span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedIndustry(ind); navigate("/dashboard/feasibility"); }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-all whitespace-nowrap">
                    <TrendingUp className="w-3 h-3" /> Explore <ArrowRight className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
