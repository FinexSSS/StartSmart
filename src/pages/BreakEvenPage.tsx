import { motion } from "framer-motion";
import { Target, AlertTriangle } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { calculateFeasibility } from "@/data/industries";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { ChartTooltip } from "@/components/ChartTooltip";

export default function BreakEvenPage() {
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

  // Estimate monthly revenue as a function of industry & team
  const monthlyRevenue = r.monthlyBurn * 1.4 + (teamSize * 200);
  const fixedCosts = r.oneTimeExpenses;
  const monthlyCosts = r.monthlyBurn;
  const monthlyProfit = monthlyRevenue - monthlyCosts;
  const breakEvenMonths = monthlyProfit > 0 ? Math.ceil(fixedCosts / monthlyProfit) : -1;

  const chartData = Array.from({ length: Math.max(24, breakEvenMonths + 6) }, (_, i) => {
    const month = i + 1;
    const totalCost = fixedCosts + monthlyCosts * month;
    const totalRevenue = monthlyRevenue * month;
    return { month: `M${month}`, cost: Math.round(totalCost), revenue: Math.round(totalRevenue), profit: Math.round(totalRevenue - totalCost) };
  }).slice(0, 36);

  const roiPercent = r.estimatedProfit > 0 ? ((r.estimatedProfit / r.totalExpenses) * 100).toFixed(1) : "0";
  const paybackPeriod = monthlyProfit > 0 ? (r.totalExpenses / monthlyProfit).toFixed(1) : "N/A";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto page-enter">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Target className="w-6 h-6 text-primary" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Break-Even Analysis</h1>
        <p className="text-muted-foreground text-sm">{selectedIndustry.icon} {selectedIndustry.name}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Break-Even Point", value: breakEvenMonths > 0 ? `${breakEvenMonths} mo` : "N/A", color: breakEvenMonths > 0 && breakEvenMonths <= monthsToRun ? "text-success" : "text-destructive" },
          { label: "Monthly Revenue (Est.)", value: `$${monthlyRevenue.toLocaleString()}`, color: "text-primary" },
          { label: "Monthly Costs", value: `$${monthlyCosts.toLocaleString()}`, color: "text-accent" },
          { label: "Monthly Profit", value: monthlyProfit > 0 ? `+$${monthlyProfit.toLocaleString()}` : `-$${Math.abs(monthlyProfit).toLocaleString()}`, color: monthlyProfit > 0 ? "text-success" : "text-destructive" },
        ].map(m => (
          <div key={m.label} className="neo-card text-center py-3">
            <p className="text-[10px] text-muted-foreground mb-0.5">{m.label}</p>
            <p className={`font-mono text-lg font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="neo-card mb-6">
        <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Revenue vs Cost Over Time</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-muted-foreground" tick={{ fontSize: 10 }} />
            <YAxis className="text-muted-foreground" tick={{ fontSize: 10 }} />
            <Tooltip content={<ChartTooltip />} />
            {breakEvenMonths > 0 && (
              <ReferenceLine x={`M${breakEvenMonths}`} stroke="hsl(var(--success))" strokeDasharray="5 5" label={{ value: "Break-Even", position: "top", fontSize: 10, fill: "hsl(var(--success))" }} />
            )}
            <Area type="monotone" dataKey="revenue" stroke="hsl(174, 72%, 46%)" fill="hsl(174, 72%, 46%)" fillOpacity={0.1} strokeWidth={2} name="Revenue" />
            <Area type="monotone" dataKey="cost" stroke="hsl(322, 80%, 58%)" fill="hsl(322, 80%, 58%)" fillOpacity={0.1} strokeWidth={2} name="Total Cost" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Profit Over Time */}
      <div className="neo-card mb-6">
        <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Cumulative Profit</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-muted-foreground" tick={{ fontSize: 10 }} />
            <YAxis className="text-muted-foreground" tick={{ fontSize: 10 }} />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Area type="monotone" dataKey="profit" stroke="hsl(152, 60%, 42%)" fill="hsl(152, 60%, 42%)" fillOpacity={0.15} strokeWidth={2} name="Profit" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ROI Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="neo-card text-center py-4">
          <p className="text-[10px] text-muted-foreground mb-0.5">Fixed Costs</p>
          <p className="font-mono text-lg font-bold text-foreground">${fixedCosts.toLocaleString()}</p>
        </div>
        <div className="neo-card text-center py-4">
          <p className="text-[10px] text-muted-foreground mb-0.5">Est. ROI</p>
          <p className="font-mono text-lg font-bold text-primary">{roiPercent}%</p>
        </div>
        <div className="neo-card text-center py-4">
          <p className="text-[10px] text-muted-foreground mb-0.5">Payback Period</p>
          <p className="font-mono text-lg font-bold text-accent">{paybackPeriod} mo</p>
        </div>
      </div>
    </motion.div>
  );
}
