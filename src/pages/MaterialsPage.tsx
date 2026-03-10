import { motion } from "framer-motion";
import { Box, AlertTriangle, Wrench, Server, Code, UserCheck, Zap } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { ResourceItem } from "@/data/industries";

const typeIcons: Record<string, React.ElementType> = { equipment: Wrench, service: Server, software: Code, personnel: UserCheck };
const typeColors: Record<string, string> = { equipment: "text-primary", service: "text-accent", software: "text-success", personnel: "text-destructive" };

export default function MaterialsPage() {
  const { selectedIndustry, enhancedIndustry, monthsToRun, isEnhancing, enhanceIndustryWithAI } = useAppContext();
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

  const totalResourceCost = currentIndustry.resources.reduce((s, r) => s + r.oneTimeCost + r.monthlyCost * monthsToRun, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto page-enter pb-12">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Box className="w-6 h-6 text-primary" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Resources</h1>
        <p className="text-muted-foreground text-sm">{currentIndustry.icon} {currentIndustry.name}</p>

        {!enhancedIndustry && (
          <button
            onClick={enhanceIndustryWithAI}
            disabled={isEnhancing}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors text-xs font-semibold"
          >
            <Zap className={`w-3.5 h-3.5 ${isEnhancing ? "animate-pulse" : ""}`} />
            {isEnhancing ? "Generating Genuine Insights..." : "Enhance with Gemini AI"}
          </button>
        )}
      </div>

      {/* Materials Table */}
      <div className="neo-card overflow-hidden mb-6">
        <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Raw Materials & Suppliers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground py-2.5 px-3">Material</th>
                <th className="text-left text-xs text-muted-foreground py-2.5 px-3">Supplier</th>
                <th className="text-left text-xs text-muted-foreground py-2.5 px-3">Cost</th>
                <th className="text-left text-xs text-muted-foreground py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {currentIndustry.materials.map((mat, i) => (
                <motion.tr key={mat.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
                  className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-sm">{mat.name}</td>
                  <td className="py-2.5 px-3 text-sm text-muted-foreground">{mat.supplier}</td>
                  <td className="py-2.5 px-3"><span className="font-mono text-sm text-primary font-semibold">${mat.estimatedCost}</span><span className="text-xs text-muted-foreground ml-1">{mat.unit}</span></td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{mat.notes}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resources */}
      <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Resources ({monthsToRun}mo)</h3>
      <div className="space-y-1.5 mb-6">
        {currentIndustry.resources.map((res, i) => {
          const Icon = typeIcons[res.type] || Wrench;
          const color = typeColors[res.type] || "text-primary";
          const totalCost = res.oneTimeCost + res.monthlyCost * monthsToRun;
          return (
            <motion.div key={res.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="neo-card flex items-center justify-between py-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg bg-secondary flex items-center justify-center ${color}`}><Icon className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="font-medium text-sm flex items-center gap-1.5">{res.name}
                    {res.essential && <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">ESSENTIAL</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{res.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-primary">${totalCost.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">
                  {res.oneTimeCost > 0 && `$${res.oneTimeCost} setup`}
                  {res.oneTimeCost > 0 && res.monthlyCost > 0 && " + "}
                  {res.monthlyCost > 0 && `$${res.monthlyCost}/mo`}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="neo-card text-center py-3"><p className="text-[10px] text-muted-foreground mb-0.5">Materials</p><p className="font-mono text-xl font-bold text-primary">{currentIndustry.materials.length}</p></div>
        <div className="neo-card text-center py-3"><p className="text-[10px] text-muted-foreground mb-0.5">Resources</p><p className="font-mono text-xl font-bold text-accent">{currentIndustry.resources.length}</p></div>
        <div className="neo-card text-center py-3"><p className="text-[10px] text-muted-foreground mb-0.5">Total Cost</p><p className="font-mono text-xl font-bold text-foreground">${totalResourceCost.toLocaleString()}</p></div>
      </div>
    </motion.div>
  );
}
