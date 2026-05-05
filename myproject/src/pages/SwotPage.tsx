import { motion } from "framer-motion";
import { Crosshair, AlertTriangle, TrendingUp, TrendingDown, Shield, Zap, Loader2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { useSwotWithAI } from "@/hooks/useAICalculations";

const quadrants = [
  { key: "strengths" as const, label: "Strengths", icon: Shield, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  { key: "weaknesses" as const, label: "Weaknesses", icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
  { key: "opportunities" as const, label: "Opportunities", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { key: "threats" as const, label: "Threats", icon: Zap, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
];

export default function SwotPage() {
  const { selectedIndustry } = useAppContext();
  const navigate = useNavigate();
  const { swot, aiLoading, aiEnabled } = useSwotWithAI(selectedIndustry);

  if (!selectedIndustry) {
    return (
      <div className="flex flex-col items-center justify-center h-96 page-enter">
        <AlertTriangle className="w-10 h-10 text-accent mb-3" />
        <h2 className="text-base font-semibold mb-1">No Market Selected</h2>
        <button onClick={() => navigate("/dashboard/industry")} className="text-primary underline text-sm">Go to Industries</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto page-enter">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Crosshair className="w-6 h-6 text-primary" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">SWOT Analysis</h1>
        <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
          {selectedIndustry.icon} {selectedIndustry.name}
          {aiLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {aiEnabled && !aiLoading && <span className="text-[10px] text-primary">· AI-enhanced</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((q, qi) => (
          <motion.div key={q.key} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: qi * 0.1 }}
            className={`neo-card border ${q.border}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-lg ${q.bg} flex items-center justify-center`}>
                <q.icon className={`w-4 h-4 ${q.color}`} />
              </div>
              <h3 className={`text-sm font-bold ${q.color}`}>{q.label}</h3>
            </div>
            <ul className="space-y-2">
              {swot[q.key].map((item, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: qi * 0.1 + i * 0.05 }}
                  className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5`} style={{ backgroundColor: `hsl(var(--${q.key === "strengths" ? "success" : q.key === "weaknesses" ? "destructive" : q.key === "opportunities" ? "primary" : "accent"}))` }} />
                  <span className="text-sm text-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="neo-card mt-6 text-center">
        <h3 className="text-[10px] tracking-widest text-muted-foreground mb-2 uppercase">Strategic Summary</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The <strong className="text-foreground">{selectedIndustry.name}</strong> industry has{" "}
          <span className="text-success font-medium">{swot.strengths.length} strengths</span> and{" "}
          <span className="text-primary font-medium">{swot.opportunities.length} opportunities</span> to leverage,
          while managing <span className="text-destructive font-medium">{swot.weaknesses.length} weaknesses</span> and{" "}
          <span className="text-accent font-medium">{swot.threats.length} threats</span>.
          Focus on strengths to capitalize on opportunities, and develop mitigation plans for identified threats.
        </p>
      </motion.div>
    </motion.div>
  );
}
