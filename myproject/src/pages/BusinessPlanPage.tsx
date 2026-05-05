import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, AlertTriangle, Download, CheckCircle2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { calculateFeasibility } from "@/data/industries";
import { Button } from "@/components/ui/button";
import { fetchAIBusinessPlan, AIBusinessPlanResult } from "@/services/aiService";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export default function BusinessPlanPage() {
  const { budget, selectedIndustry, enhancedIndustry, teamSize, monthsToRun, workshopItems, workshopTotalCost } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exported, setExported] = useState(false);
  const [aiPlan, setAiPlan] = useState<AIBusinessPlanResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const currentIndustry = enhancedIndustry || selectedIndustry;

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

  const r = calculateFeasibility(budget, currentIndustry, teamSize, monthsToRun);

  const generateAIPlan = async () => {
    setLoadingAI(true);
    try {
      const result = await fetchAIBusinessPlan({
        industryName: currentIndustry.name,
        budget: budget,
        industryDescription: currentIndustry.description
      }, user);
      setAiPlan(result);
      toast.success("AI Business Plan generated!");
    } catch (error) {
      toast.error("Failed to generate AI plan");
      console.error(error);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleExport = () => {
    const date = new Date().toLocaleDateString();
    const expenseRows = selectedIndustry.expenses.map(e => {
      const adj = e.isMonthly ? (e.category === "Team Salary" ? e.amount * teamSize * monthsToRun : e.amount * monthsToRun) : e.amount;
      return `  ${e.category.padEnd(25)} $${adj.toLocaleString().padStart(10)}  ${e.isMonthly ? "(monthly)" : "(one-time)"}`;
    }).join("\n");

    const roadmapRows = selectedIndustry.roadmap.map(s =>
      `  Step ${s.step}: ${s.title}\n    ${s.description}\n    Duration: ${s.duration} | Cost: $${s.cost.toLocaleString()}`
    ).join("\n\n");

    const materialRows = selectedIndustry.materials.map(m =>
      `  ${m.name.padEnd(20)} ${m.supplier.padEnd(15)} $${m.estimatedCost} ${m.unit}`
    ).join("\n");

    const influencerRows = selectedIndustry.influencers.map(inf =>
      `  ${inf.name.padEnd(20)} ${inf.platform.padEnd(12)} ${inf.followers.padStart(8)} followers  $${inf.charge.toLocaleString()}`
    ).join("\n");

    const workshopRows = workshopItems.length > 0
      ? workshopItems.map(w =>
        `  ${w.name.padEnd(25)} $${w.estimatedCost.toLocaleString().padStart(10)}  [${w.category}] (${w.priority})`
      ).join("\n")
      : "  No custom items added.";

    const aiContent = aiPlan ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AI GENERATED STRATEGY
─────────────────────
EXECUTIVE SUMMARY:
${aiPlan.executiveSummary}

MARKET ANALYSIS:
${aiPlan.marketAnalysis}

MARKETING STRATEGY:
${aiPlan.marketingStrategy}

OPERATIONAL PLAN:
${aiPlan.operationalPlan}

FINANCIAL PLAN:
${aiPlan.financialPlan}
` : "";

    const content = `
╔══════════════════════════════════════════════════════════════════╗
║                    STARTSMART BUSINESS PLAN                      ║
╚══════════════════════════════════════════════════════════════════╝

Generated: ${date}
Prepared for: ${user?.firstName || "Entrepreneur"} ${user?.lastName || ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EXECUTIVE SUMMARY
────────────────────
  Industry:        ${selectedIndustry.icon} ${selectedIndustry.name}
  Total Budget:    $${budget.toLocaleString()}
  Team Size:       ${teamSize} member${teamSize > 1 ? "s" : ""}
  Duration:        ${monthsToRun} months
  Feasibility:     ${r.isFeasible ? "✅ VIABLE" : "❌ NOT VIABLE"}
  Score:           ${r.feasibilityScore}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. FINANCIAL OVERVIEW
─────────────────────
  Total Estimated Cost:    $${r.totalExpenses.toLocaleString()}
  One-Time Expenses:       $${r.oneTimeExpenses.toLocaleString()}
  Monthly Burn Rate:       $${r.monthlyBurn.toLocaleString()}
  Total Monthly Costs:     $${r.totalMonthly.toLocaleString()}
  Budget ${r.isFeasible ? "Surplus" : "Gap"}:          ${r.isFeasible ? "+$" + r.surplus.toLocaleString() : "-$" + r.budgetGap.toLocaleString()}
  Estimated Profit:        $${Math.round(r.estimatedProfit).toLocaleString()}
  Runway:                  ${r.runway} months
  Workshop Items Cost:     $${workshopTotalCost.toLocaleString()}
${aiContent}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. EXPENSE BREAKDOWN
────────────────────
${expenseRows}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. CUSTOM WORKSHOP ITEMS
─────────────────────────
${workshopRows}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. STARTUP ROADMAP
──────────────────
${roadmapRows}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. RAW MATERIALS & SUPPLIERS
────────────────────────────
${materialRows}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. MARKETING & INFLUENCERS
──────────────────────────
${influencerRows}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    Generated by StartSmart Platform
                    © ${new Date().getFullYear()} StartSmart
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `StartSmart-BusinessPlan-${selectedIndustry.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const sections = [
    { title: "Executive Summary", desc: "Industry, budget, team size, feasibility status" },
    { title: "Financial Overview", desc: "Total costs, burn rate, surplus/gap, profit estimation" },
    { title: "Expense Breakdown", desc: "Detailed cost categories with monthly/one-time labels" },
    { title: "Custom Workshop Items", desc: `Your ${workshopItems.length} custom items ($${workshopTotalCost.toLocaleString()})` },
    { title: "Startup Roadmap", desc: "Step-by-step guide with durations and costs" },
    { title: "Raw Materials & Suppliers", desc: "Required materials, supplier info, and pricing" },
    { title: "Marketing & Influencers", desc: "Influencer contacts, rates, and platforms" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto page-enter">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><FileText className="w-6 h-6 text-primary" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Business Plan</h1>
        <p className="text-muted-foreground text-sm">{selectedIndustry.icon} {selectedIndustry.name} — Export your complete plan</p>
      </div>

      {/* Preview Card */}
      <div className="neo-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Plan Summary</h3>
            <p className="text-xs text-muted-foreground">For {user?.firstName || "Entrepreneur"} · {new Date().toLocaleDateString()}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${r.isFeasible ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
            {r.isFeasible ? "Viable" : "Not Viable"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-secondary rounded-lg px-3 py-2 text-center">
            <p className="text-[9px] text-muted-foreground">Budget</p>
            <p className="font-mono text-sm font-bold text-primary">${budget.toLocaleString()}</p>
          </div>
          <div className="bg-secondary rounded-lg px-3 py-2 text-center">
            <p className="text-[9px] text-muted-foreground">Total Cost</p>
            <p className="font-mono text-sm font-bold text-foreground">${r.totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-secondary rounded-lg px-3 py-2 text-center">
            <p className="text-[9px] text-muted-foreground">Profit Est.</p>
            <p className="font-mono text-sm font-bold text-accent">${Math.round(r.estimatedProfit).toLocaleString()}</p>
          </div>
          <div className="bg-secondary rounded-lg px-3 py-2 text-center">
            <p className="text-[9px] text-muted-foreground">Workshop</p>
            <p className="font-mono text-sm font-bold text-accent">${workshopTotalCost.toLocaleString()}</p>
          </div>
        </div>

        {!aiPlan ? (
          <Button onClick={generateAIPlan} disabled={loadingAI} variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10 rounded-lg h-10 mt-4">
            {loadingAI ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {loadingAI ? "AI is thinking..." : "Enhance with AI Strategy"}
          </Button>
        ) : (
          <div className="space-y-4 pt-2 border-t border-border mt-4">
            <h4 className="text-xs font-semibold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /> AI Strategy Enhanced</h4>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <p className="text-xs font-medium mb-1">Executive Summary Excerpt:</p>
              <p className="text-[10px] text-muted-foreground line-clamp-3 italic">"{aiPlan.executiveSummary}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Sections Included */}
      <div className="neo-card mb-6">
        <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Report Contents</h3>
        <div className="space-y-2">
          {sections.map((sec, i) => (
            <motion.div key={sec.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/50">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{sec.title}</p>
                <p className="text-xs text-muted-foreground">{sec.desc}</p>
              </div>
            </motion.div>
          ))}
          {aiPlan && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: sections.length * 0.06 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">AI Strategy Analysis</p>
                <p className="text-xs text-muted-foreground">Market, Ops, Marketing & Financial Detail</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Export Button */}
      <Button onClick={handleExport}
        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow font-semibold text-base rounded-lg shadow-lg">
        <Download className="w-5 h-5 mr-2" />
        {exported ? "Downloaded!" : "Export Business Plan"}
      </Button>
      {exported && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-success mt-2">
          ✅ Business plan exported successfully!
        </motion.p>
      )}
    </motion.div>
  );
}
