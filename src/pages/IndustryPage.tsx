import { motion } from "framer-motion";
import { Store, ArrowRight, Check, Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIndustries } from "@/hooks/useIndustries";
import { useAppContext } from "@/context/AppContext";

export default function IndustryPage() {
  const { data: industries = [] } = useIndustries();
  const { budget, selectedIndustry, setSelectedIndustry, enhancedIndustry, isEnhancing, enhanceIndustryWithAI } = useAppContext();
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    const ind = industries.find((i) => i.id === id);
    if (ind) setSelectedIndustry(ind);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto page-enter pb-12">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Store className="w-6 h-6 text-primary" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Industries</h1>
        <p className="text-muted-foreground text-sm">
          {budget > 0 ? `$${budget.toLocaleString()} budget — ` : ""}Choose your industry and enhance results with AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {industries.map((ind, i) => {
          const isSelected = selectedIndustry?.id === ind.id;
          const displayData = isSelected && enhancedIndustry ? enhancedIndustry : ind;
          const affordable = budget >= displayData.minBudget;

          return (
            <motion.button key={ind.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }} onClick={() => handleSelect(ind.id)}
              className={`neo-card text-left relative transition-all duration-300 ${isSelected ? "border-primary/60 ring-1 ring-primary/20 bg-primary/5" : ""} ${!affordable && budget > 0 ? "opacity-40" : ""}`}>
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              {!affordable && budget > 0 && (
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
              {isEnhancing ? "Researching Market..." : enhancedIndustry ? "AI Enhanced & Verified" : "Enhance with Gemini AI"}
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
