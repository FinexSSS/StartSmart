import { motion } from "framer-motion";
import { Landmark, AlertTriangle, Building2, Users, Globe, Handshake, CreditCard, PiggyBank } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { calculateFeasibility } from "@/data/industries";

interface FundingSource {
  name: string;
  icon: React.ElementType;
  type: string;
  suitability: "Excellent" | "Good" | "Fair";
  description: string;
  pros: string[];
  cons: string[];
  typical: string;
}

export default function FundingPage() {
  const { budget, selectedIndustry, teamSize, monthsToRun } = useAppContext();
  const navigate = useNavigate();

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

  const r = calculateFeasibility(budget, selectedIndustry, teamSize, monthsToRun);
  const gap = r.budgetGap;
  const needsFunding = gap > 0;

  const sources: FundingSource[] = [
    {
      name: "Bank Business Loan",
      icon: Building2,
      type: "Debt",
      suitability: gap > 20000 ? "Excellent" : gap > 5000 ? "Good" : "Fair",
      description: "Traditional bank loans with fixed interest rates and structured repayment plans.",
      pros: ["Keep full ownership", "Predictable repayment", "Builds business credit"],
      cons: ["Requires collateral", "Interest payments", "Strict approval criteria"],
      typical: "$5,000 – $500,000",
    },
    {
      name: "Angel Investors",
      icon: Users,
      type: "Equity",
      suitability: gap > 10000 ? "Excellent" : "Good",
      description: "High-net-worth individuals who invest in early-stage startups in exchange for equity.",
      pros: ["Mentorship & network", "No repayment required", "Business guidance"],
      cons: ["Equity dilution", "Loss of some control", "Hard to find"],
      typical: "$10,000 – $200,000",
    },
    {
      name: "Crowdfunding",
      icon: Globe,
      type: "Mixed",
      suitability: selectedIndustry.minBudget < 10000 ? "Excellent" : "Good",
      description: "Raise small amounts from many people via platforms like Kickstarter or Indiegogo.",
      pros: ["Market validation", "No equity loss (reward-based)", "Marketing exposure"],
      cons: ["Platform fees (5-10%)", "Requires strong campaign", "No guarantee of funding"],
      typical: "$1,000 – $100,000",
    },
    {
      name: "Business Partnerships",
      icon: Handshake,
      type: "Equity",
      suitability: teamSize >= 2 ? "Excellent" : "Good",
      description: "Partner with someone who brings capital, skills, or resources in exchange for equity.",
      pros: ["Shared risk", "Combined expertise", "Shared workload"],
      cons: ["Shared profits", "Potential conflicts", "Legal complexity"],
      typical: "$5,000 – $100,000",
    },
    {
      name: "Microloans",
      icon: CreditCard,
      type: "Debt",
      suitability: gap < 10000 ? "Excellent" : "Fair",
      description: "Small loans from community lenders or online platforms with flexible terms.",
      pros: ["Easier approval", "Lower amounts", "Quick access"],
      cons: ["Higher interest rates", "Small amounts only", "Short terms"],
      typical: "$500 – $15,000",
    },
    {
      name: "Personal Savings / Bootstrapping",
      icon: PiggyBank,
      type: "Self-funded",
      suitability: gap < 5000 ? "Excellent" : gap < 15000 ? "Good" : "Fair",
      description: "Fund your startup entirely from personal savings without external debt or investors.",
      pros: ["Full ownership", "No interest/debt", "Complete control"],
      cons: ["Personal financial risk", "Limited funds", "Slower growth"],
      typical: "$1,000 – $50,000",
    },
  ];

  const suitabilityColor = (s: string) => {
    if (s === "Excellent") return "text-success bg-success/10";
    if (s === "Good") return "text-primary bg-primary/10";
    return "text-muted-foreground bg-secondary";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto page-enter">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Landmark className="w-6 h-6 text-primary" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Funding Sources</h1>
        <p className="text-muted-foreground text-sm">{selectedIndustry.icon} {selectedIndustry.name}</p>
      </div>

      {/* Gap Summary */}
      <div className={`neo-card text-center mb-6 border ${needsFunding ? "border-accent/20" : "border-success/20"}`}>
        {needsFunding ? (
          <>
            <p className="text-sm text-muted-foreground mb-1">Funding Gap</p>
            <p className="font-mono text-3xl font-bold text-accent">${gap.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">You need additional funding to cover all estimated costs</p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-1">Budget Surplus</p>
            <p className="font-mono text-3xl font-bold text-success">+${r.surplus.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">You're well-funded! Consider these options for growth capital</p>
          </>
        )}
      </div>

      {/* Sources */}
      <div className="space-y-3">
        {sources.map((src, i) => (
          <motion.div key={src.name} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className="neo-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <src.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-sm font-semibold">{src.name}</h3>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${suitabilityColor(src.suitability)}`}>
                    {src.suitability}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{src.type}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{src.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div className="bg-success/5 rounded-lg px-3 py-2">
                    <p className="text-[9px] text-success font-medium uppercase mb-1">Pros</p>
                    {src.pros.map(p => <p key={p} className="text-xs text-foreground">+ {p}</p>)}
                  </div>
                  <div className="bg-destructive/5 rounded-lg px-3 py-2">
                    <p className="text-[9px] text-destructive font-medium uppercase mb-1">Cons</p>
                    {src.cons.map(c => <p key={c} className="text-xs text-foreground">− {c}</p>)}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">Typical range: <span className="font-mono text-foreground">{src.typical}</span></p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
