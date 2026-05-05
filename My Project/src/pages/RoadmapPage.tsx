import { motion } from "framer-motion";
import { Route, AlertTriangle, CheckCircle2, Clock, DollarSign, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchAIRoadmap, AIRoadmapResult } from "@/services/aiService";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RoadmapPage() {
  const { selectedIndustry, enhancedIndustry, budget, monthsToRun } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [aiRoadmap, setAiRoadmap] = useState<AIRoadmapResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const currentIndustry = enhancedIndustry || selectedIndustry;

  if (!currentIndustry) {
    return (
      <div className="flex flex-col items-center justify-center h-96 page-enter">
        <AlertTriangle className="w-10 h-10 text-accent mb-3" />
        <h2 className="text-base font-semibold mb-1">No Market Selected</h2>
        <button onClick={() => navigate("/dashboard/industry")} className="text-primary underline text-sm">Go to Industries</button>
      </div>
    );
  }

  const generateAIRoadmap = async () => {
    setLoadingAI(true);
    try {
      const result = await fetchAIRoadmap({
        industryName: currentIndustry.name,
        budget,
        monthsToRun,
        industryDescription: currentIndustry.description
      }, user);
      setAiRoadmap(result);
      toast.success("AI Roadmap generated!");
    } catch (error) {
      toast.error("Failed to generate AI roadmap");
      console.error(error);
    } finally {
      setLoadingAI(false);
    }
  };

  const activeRoadmap = aiRoadmap ? aiRoadmap.roadmap : currentIndustry.roadmap;
  const totalCost = activeRoadmap.reduce((s, step) => s + step.cost, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto page-enter pb-12">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Route className="w-6 h-6 text-primary" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Roadmap</h1>
        <p className="text-muted-foreground text-sm">{currentIndustry.icon} {currentIndustry.name} — Step-by-step blueprint</p>
      </div>

      <div className="text-center mb-6">
        <Button onClick={generateAIRoadmap} disabled={loadingAI} variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 rounded-xl px-6">
          {loadingAI ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          {loadingAI ? "AI is generating..." : aiRoadmap ? "Regenerate AI Roadmap" : "Generate Dynamic AI Roadmap"}
        </Button>
        {aiRoadmap && (
          <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">
            Showing AI-Optimized Roadmap for ${budget.toLocaleString()} budget
          </p>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-transparent" />

        <div className="space-y-4">
          {activeRoadmap.map((step, i) => (
            <motion.div key={step.step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex gap-4 relative">
              <div className="relative z-10 w-14 h-14 rounded-xl bg-card border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="font-mono text-lg font-bold text-primary">{step.step}</span>
              </div>
              <div className="neo-card flex-1 hover:border-primary/30 transition-colors">
                <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-2.5 leading-relaxed">{step.description}</p>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground bg-secondary px-2 py-1 rounded">
                    <Clock className="w-3 h-3" /> {step.duration}
                  </span>
                  <span className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded font-mono font-medium">
                    <DollarSign className="w-3 h-3" /> ${step.cost.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="neo-card mt-6 text-center border border-success/15">
        <CheckCircle2 className="w-7 h-7 text-success mx-auto mb-1.5" />
        <h3 className="text-sm font-semibold mb-0.5">Total Milestone Cost</h3>
        <p className="font-mono text-2xl font-bold text-primary">${totalCost.toLocaleString()}</p>
      </motion.div>
    </motion.div>
  );
}
