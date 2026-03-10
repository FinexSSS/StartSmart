import { motion } from "framer-motion";
import { Gauge, CheckCircle2, XCircle, TrendingUp, AlertTriangle, Clock, Users, Flame, Brain, Loader2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useFeasibilityWithAI } from "@/hooks/useAICalculations";
import { useNavigate } from "react-router-dom";

export default function FeasibilityPage() {
  const { budget, selectedIndustry, enhancedIndustry, teamSize, monthsToRun } = useAppContext();
  const navigate = useNavigate();

  const currentIndustry = enhancedIndustry || selectedIndustry;
  const { result: r, aiLoading, aiEnabled } = useFeasibilityWithAI(budget, currentIndustry, teamSize, monthsToRun);

  if (!selectedIndustry || budget <= 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 page-enter">
        <AlertTriangle className="w-10 h-10 text-accent mb-3" />
        <h2 className="text-base font-semibold mb-1">Missing Parameters</h2>
        <p className="text-muted-foreground text-sm mb-3">Set budget & select a market first.</p>
        <button onClick={() => navigate("/dashboard/budget")} className="text-primary underline text-sm">Go to Budget</button>
      </div>
    );
  }

  if (!r) {
    return (
      <div className="flex flex-col items-center justify-center h-96 page-enter">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
        <p className="text-muted-foreground text-sm">Calculating…</p>
      </div>
    );
  }

  const metrics = [
    { label: "Total Cost", value: `$${r.totalExpenses.toLocaleString()}`, color: "text-foreground" },
    { label: "One-Time", value: `$${r.oneTimeExpenses.toLocaleString()}`, color: "text-primary" },
    { label: "Monthly Burn", value: `$${r.monthlyBurn.toLocaleString()}`, color: "text-accent", icon: Flame },
    { label: "Surplus/Gap", value: r.isFeasible ? `+$${r.surplus.toLocaleString()}` : `-$${r.budgetGap.toLocaleString()}`, color: r.isFeasible ? "text-success" : "text-destructive" },
    { label: "Est. Profit", value: `$${Math.round(r.estimatedProfit).toLocaleString()}`, color: "text-accent", icon: TrendingUp },
    { label: "Runway", value: `${r.runway}mo`, color: r.runway >= monthsToRun ? "text-success" : "text-destructive", icon: Clock },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto page-enter">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Gauge className="w-6 h-6 text-primary" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Feasibility</h1>
        <p className="text-muted-foreground text-sm">
          {selectedIndustry.icon} {selectedIndustry.name} · ${budget.toLocaleString()} · {teamSize} ppl · {monthsToRun}mo
        </p>
      </div>

      {/* Result */}
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
        className={`neo-card text-center mb-5 ${r.isFeasible ? "border-success/20" : "border-destructive/20"}`} style={{ borderWidth: 1 }}>
        {r.isFeasible ? <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2" /> : <XCircle className="w-12 h-12 text-destructive mx-auto mb-2" />}
        <h2 className="text-xl font-bold mb-1" style={{ color: r.isFeasible ? "hsl(var(--success))" : "hsl(var(--destructive))" }}>
          {r.isFeasible ? "VIABLE" : "NOT VIABLE"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {r.isFeasible ? "Your capital covers this venture!" : `Need $${r.budgetGap.toLocaleString()} more.`}
        </p>
        {r.riskLevel && (
          <p className="text-xs text-muted-foreground mt-1">
            AI risk level: <span className="font-medium text-foreground">{r.riskLevel}</span>
          </p>
        )}
      </motion.div>

      {/* Score */}
      <div className="neo-card mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Viability Score</span>
          <span className="font-mono text-lg text-primary font-bold">{r.feasibilityScore}%</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, r.feasibilityScore)}%` }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-full rounded-full"
            style={{ background: r.feasibilityScore >= 100 ? "hsl(var(--success))" : r.feasibilityScore >= 70 ? "hsl(var(--chart-3))" : "hsl(var(--destructive))" }} />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-5">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
            className="neo-card text-center py-3">
            <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center justify-center gap-1">
              {m.icon && <m.icon className="w-3 h-3" />} {m.label}
            </p>
            <p className={`font-mono text-base font-bold ${m.color}`}>{m.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Plan */}
      <div className="neo-card mb-5">
        <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Configuration</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-0.5">
            <Users className="w-4 h-4 text-accent" />
            <span className="font-mono text-sm font-bold">{teamSize}</span>
            <span className="text-[9px] text-muted-foreground">Team</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm font-bold">{monthsToRun}mo</span>
            <span className="text-[9px] text-muted-foreground">Duration</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Flame className="w-4 h-4 text-destructive" />
            <span className="font-mono text-sm font-bold">${r.totalMonthly.toLocaleString()}</span>
            <span className="text-[9px] text-muted-foreground">Recurring</span>
          </div>
        </div>
      </div>

      {aiEnabled && r.aiRecommendations && r.aiRecommendations.length > 0 && (
        <div className="neo-card mb-5 border-primary/20">
          <h3 className="text-[10px] tracking-widest text-primary mb-2 uppercase flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" /> AI recommendations
          </h3>
          <ul className="space-y-1.5">
            {r.aiRecommendations.map((rec, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center gap-2.5 flex-wrap">
        {aiLoading && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI analysis…
          </span>
        )}
        <button onClick={() => navigate("/dashboard/expenses")} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold neon-glow hover:bg-primary/90">View Expenses</button>
        <button onClick={() => navigate("/dashboard/recommendations")} className="px-5 py-2.5 border border-primary/20 text-primary rounded-lg text-sm hover:bg-primary/10">
          <Brain className="w-3.5 h-3.5 inline mr-1.5" />Insights
        </button>
      </div>
    </motion.div>
  );
}
