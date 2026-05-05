import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, TrendingDown, Users, Zap, Scale, Loader2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { calculateFeasibility } from "@/data/industries";
import { useRiskWithAI } from "@/hooks/useAICalculations";

const ICONS = [TrendingDown, Users, Scale, Zap, TrendingDown, Users];

interface RiskItem {
  category: string;
  icon: React.ElementType;
  level: "High" | "Medium" | "Low";
  description: string;
  mitigation: string;
}

function getRiskColor(level: string) {
  if (level === "High") return "text-destructive bg-destructive/10 border-destructive/20";
  if (level === "Medium") return "text-accent bg-accent/10 border-accent/20";
  return "text-success bg-success/10 border-success/20";
}

function getRiskBarWidth(level: string) {
  if (level === "High") return "85%";
  if (level === "Medium") return "50%";
  return "25%";
}

function getRiskBarColor(level: string) {
  if (level === "High") return "bg-destructive";
  if (level === "Medium") return "bg-accent";
  return "bg-success";
}

export default function RiskAssessmentPage() {
  const { budget, selectedIndustry, enhancedIndustry, teamSize, monthsToRun } = useAppContext();
  const navigate = useNavigate();

  const currentIndustry = enhancedIndustry || selectedIndustry;
  const { formulaResult: r, risks: aiRisks, aiLoading, aiEnabled } = useRiskWithAI(budget, currentIndustry, teamSize, monthsToRun);

  if (!currentIndustry || budget <= 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 page-enter">
        <AlertTriangle className="w-10 h-10 text-accent mb-3" />
        <h2 className="text-base font-semibold mb-1">Missing Parameters</h2>
        <p className="text-muted-foreground text-sm mb-3">Set budget & select a market first.</p>
        <button onClick={() => navigate("/dashboard/budget")} className="text-primary underline text-sm">Go to Budget</button>
      </div>
    );
  }

  const rFallback = r ?? calculateFeasibility(budget, currentIndustry, teamSize, monthsToRun);

  const capitalRisk: "High" | "Medium" | "Low" = rFallback.feasibilityScore < 60 ? "High" : rFallback.feasibilityScore < 90 ? "Medium" : "Low";
  const runwayRisk: "High" | "Medium" | "Low" = rFallback.runway < monthsToRun * 0.5 ? "High" : rFallback.runway < monthsToRun ? "Medium" : "Low";
  const teamRisk: "High" | "Medium" | "Low" = teamSize > 10 ? "High" : teamSize > 5 ? "Medium" : "Low";
  const marketRisk: "High" | "Medium" | "Low" = currentIndustry.minBudget > 8000 ? "High" : currentIndustry.minBudget > 4000 ? "Medium" : "Low";
  const burnRisk: "High" | "Medium" | "Low" = rFallback.monthlyBurn > budget * 0.15 ? "High" : rFallback.monthlyBurn > budget * 0.08 ? "Medium" : "Low";

  const defaultRisks: RiskItem[] = [
    { category: "Capital Limitation", icon: TrendingDown, level: capitalRisk, description: `Your budget covers ${rFallback.feasibilityScore}% of total estimated costs. ${capitalRisk === "High" ? "Significant funding gap exists." : capitalRisk === "Medium" ? "Budget is tight but manageable." : "Well-funded for this venture."}`, mitigation: capitalRisk === "High" ? "Seek external funding, reduce scope, or choose a lower-cost industry." : capitalRisk === "Medium" ? "Build a financial buffer and prioritize essential expenses." : "Maintain reserves for unexpected costs." },
    { category: "Market Competition", icon: Users, level: marketRisk, description: `The ${currentIndustry.name} industry has ${marketRisk === "High" ? "intense" : marketRisk === "Medium" ? "moderate" : "manageable"} competition with a minimum entry of $${currentIndustry.minBudget.toLocaleString()}.`, mitigation: marketRisk === "High" ? "Focus on a unique niche, build strong branding, and differentiate early." : "Research competitors and identify gaps in the market." },
    { category: "Demand Uncertainty", icon: Scale, level: "Medium", description: "Market demand can fluctuate based on trends, seasons, and economic conditions. Early validation is critical.", mitigation: "Conduct surveys, launch an MVP, and test with a small audience before full investment." },
    { category: "Burn Rate Risk", icon: Zap, level: burnRisk, description: `Monthly burn rate of $${rFallback.monthlyBurn.toLocaleString()} represents ${((rFallback.monthlyBurn / budget) * 100).toFixed(1)}% of your total budget.`, mitigation: burnRisk === "High" ? "Negotiate lower costs, defer non-essential hires, and reduce monthly subscriptions." : "Monitor spending weekly and adjust as needed." },
    { category: "Runway Exhaustion", icon: TrendingDown, level: runwayRisk, description: `Current runway is ${rFallback.runway} months against a planned ${monthsToRun}-month operation.`, mitigation: runwayRisk === "High" ? "Secure additional funding or drastically cut operating costs." : "Plan for revenue generation before runway ends." },
    { category: "Team Scaling", icon: Users, level: teamRisk, description: `A team of ${teamSize} ${teamRisk === "High" ? "creates significant coordination overhead and salary burden." : teamRisk === "Medium" ? "requires careful management." : "is lean and efficient."}`, mitigation: teamRisk === "High" ? "Start with core team, hire gradually, and consider contractors." : "Ensure clear roles and responsibilities." },
  ];

  const risks: RiskItem[] = aiRisks
    ? aiRisks.map((risk, i) => ({ ...risk, icon: ICONS[i % ICONS.length] }))
    : defaultRisks;

  const highCount = risks.filter(r => r.level === "High").length;
  const medCount = risks.filter(r => r.level === "Medium").length;
  const lowCount = risks.filter(r => r.level === "Low").length;
  const overallScore = Math.max(0, 100 - highCount * 20 - medCount * 8);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto page-enter">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><ShieldAlert className="w-6 h-6 text-accent" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Risk Assessment</h1>
        <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
          {currentIndustry.icon} {currentIndustry.name} · ${budget.toLocaleString()}
          {aiLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {aiEnabled && !aiLoading && <span className="text-[10px] text-primary">· AI-enhanced</span>}
        </p>
      </div>

      {/* Overall Score */}
      <div className="neo-card text-center mb-6">
        <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Overall Risk Score</h3>
        <div className="relative w-24 h-24 mx-auto mb-3">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle cx="48" cy="48" r="40" fill="none"
              stroke={overallScore >= 70 ? "hsl(var(--success))" : overallScore >= 40 ? "hsl(var(--accent))" : "hsl(var(--destructive))"}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallScore / 100)}`} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold font-mono">{overallScore}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {overallScore >= 70 ? "Low overall risk — good to proceed" : overallScore >= 40 ? "Moderate risk — proceed with caution" : "High risk — significant mitigation needed"}
        </p>
        <div className="flex justify-center gap-4 mt-3">
          <span className="text-xs text-destructive font-medium">{highCount} High</span>
          <span className="text-xs text-accent font-medium">{medCount} Medium</span>
          <span className="text-xs text-success font-medium">{lowCount} Low</span>
        </div>
      </div>

      {/* Risk Items */}
      <div className="space-y-3">
        {risks.map((risk, i) => (
          <motion.div key={risk.category} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className="neo-card">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getRiskColor(risk.level)}`}>
                <risk.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold">{risk.category}</h3>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase border ${getRiskColor(risk.level)}`}>
                    {risk.level}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{risk.description}</p>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${getRiskBarColor(risk.level)}`} style={{ width: getRiskBarWidth(risk.level) }} />
                </div>
                <div className="bg-secondary/50 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Mitigation</p>
                  <p className="text-xs text-foreground">{risk.mitigation}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
