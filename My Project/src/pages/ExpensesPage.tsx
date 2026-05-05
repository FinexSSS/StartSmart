import { motion } from "framer-motion";
import { Wallet, AlertTriangle, Lightbulb } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { PieTooltip, ChartTooltip } from "@/components/ChartTooltip";

const COLORS = [
  "hsl(174, 72%, 46%)", "hsl(322, 80%, 58%)", "hsl(45, 93%, 55%)",
  "hsl(152, 60%, 42%)", "hsl(262, 70%, 58%)", "hsl(199, 89%, 52%)", "hsl(0, 72%, 55%)",
  "hsl(30, 80%, 55%)", "hsl(200, 70%, 50%)",
];

export default function ExpensesPage() {
  const { selectedIndustry, enhancedIndustry, teamSize, monthsToRun, workshopItems } = useAppContext();
  const navigate = useNavigate();

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

  const industryData = currentIndustry.expenses.map((e) => {
    let adjustedAmount = e.amount;
    if (e.isMonthly) {
      if (e.category === "Team Salary" || e.category.toLowerCase().includes("salary") || e.category.toLowerCase().includes("team")) {
        // Use monthlyCostPerPerson if available, otherwise fallback to e.amount
        const costPerPerson = currentIndustry.monthlyCostPerPerson || e.amount;
        adjustedAmount = costPerPerson * teamSize * monthsToRun;
      } else {
        adjustedAmount = e.amount * monthsToRun;
      }
    }
    return { name: e.category, value: adjustedAmount, isMonthly: e.isMonthly, source: "industry" as const, description: e.description };
  });

  // Include workshop items as additional expenses
  const workshopData = workshopItems.length > 0
    ? [{ name: "Workshop Items", value: workshopItems.reduce((s, d) => s + d.estimatedCost, 0), isMonthly: false, source: "workshop" as const, description: "Custom items added in workshop" }]
    : [];

  const data = [...industryData, ...workshopData];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto page-enter pb-12">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Wallet className="w-6 h-6 text-primary" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Expenses</h1>
        <p className="text-muted-foreground text-sm">
          {currentIndustry.icon} {currentIndustry.name} · Total: <span className="font-mono text-primary font-bold">${total.toLocaleString()}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="neo-card" style={{ minHeight: 320 }}>
          <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Distribution</h3>
          <ResponsiveContainer width="100%" height={270}>
            <RechartsPie>
              <Pie data={data} cx="50%" cy="45%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" iconSize={7}
                wrapperStyle={{ fontSize: 10 }} />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

        <div className="neo-card" style={{ minHeight: 320 }}>
          <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">By Category</h3>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis type="number" className="text-muted-foreground" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={100} className="text-muted-foreground" tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-1.5">
        {industryData.map((expense, i) => (
          <motion.div key={expense.name} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className="neo-card flex items-center justify-between py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <div>
                <p className="font-medium text-sm">{expense.name}</p>
                <p className="text-xs text-muted-foreground">
                  {expense.description}
                  {expense.isMonthly && <span className="ml-1.5 text-accent font-medium">× {monthsToRun}mo</span>}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="font-mono text-sm font-bold text-primary">${expense.value.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">{((expense.value / total) * 100).toFixed(1)}%</p>
            </div>
          </motion.div>
        ))}

        {/* Workshop Items Section */}
        {workshopItems.length > 0 && (
          <>
            <div className="pt-3 pb-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lightbulb className="w-3.5 h-3.5 text-accent" />
                <span className="uppercase tracking-widest font-medium">Workshop Items</span>
              </div>
            </div>
            {workshopItems.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (industryData.length + i) * 0.06 }}
                className="neo-card flex items-center justify-between py-3.5 border-accent/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-accent" />
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category} · {item.priority} priority</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="font-mono text-sm font-bold text-accent">${item.estimatedCost.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{((item.estimatedCost / total) * 100).toFixed(1)}%</p>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}
