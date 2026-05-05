import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useIndustries } from "@/hooks/useIndustries";
import { calculateFeasibility } from "@/data/industries";
import { useAppContext } from "@/context/AppContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  AreaChart, Area, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { ChartTooltip } from "@/components/ChartTooltip";

const COLORS = ["hsl(174, 72%, 46%)", "hsl(322, 80%, 58%)", "hsl(45, 93%, 55%)", "hsl(152, 60%, 42%)", "hsl(262, 70%, 58%)"];

export default function AnalyticsPage() {
  const { data: industries = [] } = useIndustries();
  const { budget, teamSize, monthsToRun, enhancedIndustry, selectedIndustry } = useAppContext();
  const useBudget = budget > 0 ? budget : 10000;

  const currentIndustries = industries.map((ind) =>
    enhancedIndustry && selectedIndustry?.id === ind.id && enhancedIndustry.id === ind.id
      ? enhancedIndustry
      : ind
  );

  const comparisonData = currentIndustries.map((ind) => {
    const r = calculateFeasibility(useBudget, ind, teamSize, monthsToRun);
    return { name: ind.name.split(" ")[0], totalCost: r.totalExpenses, profit: Math.round(r.estimatedProfit), score: r.feasibilityScore, monthlyBurn: r.monthlyBurn, runway: r.runway };
  });

  const radarData = currentIndustries.map((ind) => {
    const r = calculateFeasibility(useBudget, ind, teamSize, monthsToRun);
    return {
      industry: ind.name.split(" ")[0],
      feasibility: r.feasibilityScore,
      profitability: Math.min(100, Math.round((r.estimatedProfit / useBudget) * 100)),
      affordability: Math.min(100, Math.round((useBudget / r.totalExpenses) * 100)),
    };
  });

  const burnData = Array.from({ length: Math.min(monthsToRun, 24) }, (_, i) => {
    const month = i + 1;
    const entry: Record<string, number | string> = { month: `M${month}` };
    currentIndustries.forEach((ind) => {
      const r = calculateFeasibility(useBudget, ind, teamSize, monthsToRun);
      entry[ind.name.split(" ")[0]] = Math.max(0, Math.round(useBudget - r.oneTimeExpenses - r.monthlyBurn * month));
    });
    return entry;
  });

  const bubbleData = currentIndustries.map((ind, i) => {
    const r = calculateFeasibility(useBudget, ind, teamSize, monthsToRun);
    return { name: ind.name.split(" ")[0], x: r.totalExpenses, y: r.estimatedProfit, z: r.feasibilityScore, fill: COLORS[i] };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto page-enter">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Activity className="w-6 h-6 text-primary" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          <span className="font-mono">${useBudget.toLocaleString()}</span> · {teamSize} ppl · {monthsToRun}mo
          {budget <= 0 && " (default)"}
        </p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-5">
        {comparisonData.map((d) => (
          <div key={d.name} className="neo-card text-center py-3">
            <p className="text-[10px] text-muted-foreground mb-0.5">{d.name}</p>
            <p className={`font-mono text-lg font-bold ${d.score >= 100 ? "text-success" : d.score >= 70 ? "text-chart-3" : "text-destructive"}`}>
              {d.score}%
            </p>
            <p className="text-[9px] text-muted-foreground">Run: {d.runway}mo</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Cost vs Profit */}
        <div className="neo-card">
          <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Cost vs Profit</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-muted-foreground" tick={{ fontSize: 10 }} />
              <YAxis className="text-muted-foreground" tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="totalCost" name="Cost" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Profit" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="neo-card">
          <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Multi-Dimensional</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis dataKey="industry" className="text-muted-foreground" tick={{ fontSize: 9 }} />
              <PolarRadiusAxis className="text-muted-foreground" tick={{ fontSize: 8 }} />
              <Radar name="Feasibility" dataKey="feasibility" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.15} />
              <Radar name="Profitability" dataKey="profitability" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.1} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Burn Over Time */}
      <div className="neo-card mb-4">
        <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Capital Runway</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={burnData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-muted-foreground" tick={{ fontSize: 10 }} />
            <YAxis className="text-muted-foreground" tick={{ fontSize: 10 }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend />
            {currentIndustries.map((ind, i) => (
              <Area key={ind.id} type="monotone" dataKey={ind.name.split(" ")[0]} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.06} strokeWidth={2} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bubble / Scatter */}
      <div className="neo-card">
        <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Risk vs Reward</h3>
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="x" name="Cost" className="text-muted-foreground" tick={{ fontSize: 10 }} />
            <YAxis dataKey="y" name="Profit" className="text-muted-foreground" tick={{ fontSize: 10 }} />
            <ZAxis dataKey="z" range={[60, 400]} name="Score" />
            <Tooltip content={<ChartTooltip />} />
            {bubbleData.map((d, i) => (
              <Scatter key={d.name} name={d.name} data={[d]} fill={COLORS[i]} />
            ))}
            <Legend />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
