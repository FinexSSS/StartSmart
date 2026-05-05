import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, ArrowRight, Users, Calendar, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAppContext } from "@/context/AppContext";

export default function BudgetPage() {
  const { budget, setBudget, teamSize, setTeamSize, monthsToRun, setMonthsToRun } = useAppContext();
  const [inputValue, setInputValue] = useState(budget > 0 ? budget.toString() : "");
  const navigate = useNavigate();

  const presets = [500, 1000, 2500, 5000, 10000, 25000, 50000, 75000, 100000, 150000, 250000, 500000, 1000000];
  const teamPresets = [1, 2, 3, 5, 8, 10, 15, 20, 30, 50, 75, 100];
  const monthPresets = [1, 3, 6, 9, 12, 18, 24, 36, 48, 60];

  const formatPreset = (p: number) => {
    if (p >= 1000000) return `$${p / 1000000}M`;
    if (p >= 1000) return `$${p / 1000}k`;
    return `$${p}`;
  };

  const handleSubmit = () => {
    const val = parseFloat(inputValue);
    if (val > 0) { setBudget(val); navigate("/dashboard/industry"); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-4 page-enter">
      <div className="text-center mb-6">
        <div className="icon-box mx-auto">
          <Rocket className="w-6 h-6 text-primary" />
        </div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Budget</h1>
        <p className="text-muted-foreground text-sm">Set your investment, team size, and timeline</p>
      </div>

      {/* Budget */}
      <div className="neo-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Investment Capital</h3>
        </div>
        <div className="relative mb-3">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <Input
            type="number"
            placeholder="Enter amount..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-10 h-12 text-lg bg-secondary border-border focus:border-primary font-mono rounded-lg"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button key={p} onClick={() => setInputValue(p.toString())}
              className={`chip ${inputValue === p.toString() ? "chip-active" : "chip-inactive"}`}>
              {formatPreset(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="neo-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-accent" />
          </div>
          <h3 className="text-sm font-semibold">Team Size</h3>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1">
            <Slider value={[teamSize]} onValueChange={(v) => setTeamSize(v[0])} min={1} max={100} step={1} />
          </div>
          <div className="w-16 text-center">
            <span className="font-mono text-xl font-bold text-accent">{teamSize}</span>
            <p className="text-[9px] text-muted-foreground">{teamSize === 1 ? "Solo" : "People"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {teamPresets.map((t) => (
            <button key={t} onClick={() => setTeamSize(t)}
              className={`chip ${teamSize === t ? "bg-accent text-accent-foreground neon-glow-accent" : "chip-inactive"}`}>
              {t === 1 ? "Solo" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="neo-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Operating Duration</h3>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1">
            <Slider value={[monthsToRun]} onValueChange={(v) => setMonthsToRun(v[0])} min={1} max={60} step={1} />
          </div>
          <div className="w-20 text-center">
            <span className="font-mono text-xl font-bold text-primary">{monthsToRun}</span>
            <p className="text-[9px] text-muted-foreground">
              {monthsToRun >= 12 ? `${(monthsToRun / 12).toFixed(1)} yr` : monthsToRun === 1 ? "Month" : "Months"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {monthPresets.map((m) => (
            <button key={m} onClick={() => setMonthsToRun(m)}
              className={`chip ${monthsToRun === m ? "chip-active" : "chip-inactive"}`}>
              {m >= 12 ? `${m / 12}yr` : `${m}mo`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {inputValue && parseFloat(inputValue) > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="neo-card border-primary/15 overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary to-accent mb-4 -mt-6 -mx-6" style={{width: 'calc(100% + 3rem)'}} />
          <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase font-medium">Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-mono text-lg font-bold text-primary">${parseFloat(inputValue).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Capital</p>
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-accent">{teamSize}</p>
              <p className="text-[10px] text-muted-foreground">Team</p>
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-foreground">
                {monthsToRun >= 12 ? `${(monthsToRun / 12).toFixed(1)}yr` : `${monthsToRun}mo`}
              </p>
              <p className="text-[10px] text-muted-foreground">Duration</p>
            </div>
          </div>
        </motion.div>
      )}

      <Button onClick={handleSubmit} disabled={!inputValue || parseFloat(inputValue) <= 0}
        className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow font-semibold tracking-wide rounded-lg">
        Continue to Industries <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </motion.div>
  );
}
