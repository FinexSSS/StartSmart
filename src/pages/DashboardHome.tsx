import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAppContext } from "@/context/AppContext";
import {
  DollarSign, Store, Gauge, Wallet, Megaphone, Box,
  Brain, Route, Activity, Lightbulb, ArrowRight, Sparkles,
  TrendingUp, Target, Zap, Clock, CheckCircle2, Circle,
  Rocket, BookOpen, ShieldAlert, Landmark, Crosshair, FileText, User,
} from "lucide-react";

const modules = [
  { title: "Expenses", icon: Wallet, url: "/dashboard/expenses" },
  { title: "Break-Even", icon: Target, url: "/dashboard/breakeven" },
  { title: "Risk Assessment", icon: ShieldAlert, url: "/dashboard/risk" },
  { title: "SWOT", icon: Crosshair, url: "/dashboard/swot" },
  { title: "Influencers", icon: Megaphone, url: "/dashboard/influencers" },
  { title: "Resources", icon: Box, url: "/dashboard/materials" },
  { title: "Marketing", icon: TrendingUp, url: "/dashboard/marketing" },
  { title: "Funding", icon: Landmark, url: "/dashboard/funding" },
  { title: "Suggestions", icon: Brain, url: "/dashboard/recommendations" },
  { title: "Roadmap", icon: Route, url: "/dashboard/roadmap" },
  { title: "Business Plan", icon: FileText, url: "/dashboard/export" },
  { title: "Workshop", icon: Lightbulb, url: "/dashboard/workshop" },
];

const startupTips = [
  "Start with a clear problem statement before building solutions.",
  "Validate your idea with at least 10 potential customers.",
  "Keep your MVP lean — focus on one core feature.",
  "Budget 20% extra for unexpected costs.",
  "Track your burn rate weekly, not monthly.",
  "Build in public — share your journey on social media.",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function DashboardHome() {
  const { user } = useAuth();
  const { budget, selectedIndustry, monthsToRun, teamSize, workshopItems, workshopTotalCost } = useAppContext();
  const navigate = useNavigate();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const checklist = [
    { label: "Set your budget", done: budget > 0, url: "/dashboard/budget" },
    { label: "Choose an industry", done: !!selectedIndustry, url: "/dashboard/industry" },
    { label: "Run feasibility check", done: budget > 0 && !!selectedIndustry, url: "/dashboard/feasibility" },
    { label: "Review your roadmap", done: !!selectedIndustry, url: "/dashboard/roadmap" },
    { label: "Explore analytics", done: budget > 0, url: "/dashboard/analytics" },
  ];

  const completedSteps = checklist.filter(c => c.done).length;
  const progress = Math.round((completedSteps / checklist.length) * 100);

  const randomTip = startupTips[Math.floor(new Date().getDate() % startupTips.length)];

  const quickActions = [
    { title: "Set Budget", desc: "Define your startup capital", icon: DollarSign, url: "/dashboard/budget" },
    { title: "Pick Industry", desc: "Choose your market sector", icon: Store, url: "/dashboard/industry" },
    { title: "Check Feasibility", desc: "Validate your idea", icon: Gauge, url: "/dashboard/feasibility" },
    { title: "My Profile", desc: "Update your founder profile", icon: User, url: "/dashboard/profile" },
  ];

  return (
    <div className="page-enter max-w-6xl mx-auto space-y-8">
      {/* Hero Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-8 gradient-bg neon-border"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-xs font-medium text-accent uppercase tracking-wider">Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {greeting()}, <span className="gradient-text">{user?.firstName || "Entrepreneur"}</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg">
              Your startup command center. Set your budget, explore industries, and let StartSmart guide you to launch.
            </p>
          </div>

          {/* Progress Ring */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold font-mono text-primary">{progress}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Setup Progress</p>
              <p className="text-[10px] text-muted-foreground">{completedSteps}/{checklist.length} steps done</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Budget", value: budget > 0 ? `$${budget.toLocaleString()}` : "Not set", icon: DollarSign, hint: budget > 0 },
          { label: "Industry", value: selectedIndustry?.name || "Not selected", icon: Target, hint: !!selectedIndustry },
          { label: "Team Size", value: `${teamSize} member${teamSize > 1 ? "s" : ""}`, icon: TrendingUp, hint: teamSize > 1 },
          { label: "Workshop", value: workshopItems.length > 0 ? `${workshopItems.length} items · $${workshopTotalCost.toLocaleString()}` : "No items", icon: Lightbulb, hint: workshopItems.length > 0 },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item} className="neo-card !p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.hint ? "bg-primary/10" : "bg-muted"}`}>
              <stat.icon className={`w-4 h-4 ${stat.hint ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className={`text-sm font-semibold truncate ${stat.hint ? "text-foreground" : "text-muted-foreground"}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Getting Started Checklist + Tip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neo-card lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Getting Started</h2>
          </div>
          <div className="space-y-2">
            {checklist.map((step) => (
              <button
                key={step.label}
                onClick={() => navigate(step.url)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                  step.done
                    ? "bg-primary/5 text-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                )}
                <span className={step.done ? "line-through opacity-60" : ""}>{step.label}</span>
                {!step.done && <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground/40" />}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="neo-card flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Tip of the Day</h2>
          </div>
          <div className="flex-1 flex items-center">
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "{randomTip}"
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">💡 StartSmart Tips</p>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        </div>
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.title}
              variants={item}
              onClick={() => navigate(action.url)}
              className="neo-card !p-5 text-left group cursor-pointer"
            >
              <div className="icon-box !w-10 !h-10 !rounded-lg !mb-2">
                <action.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{action.title}</h3>
              <p className="text-[11px] text-muted-foreground mb-3">{action.desc}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium group-hover:gap-2 transition-all">
                Go <ArrowRight className="w-3 h-3" />
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* All Modules */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Explore Modules</h2>
        </div>
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {modules.map((mod) => (
            <motion.button
              key={mod.title}
              variants={item}
              onClick={() => navigate(mod.url)}
              className="neo-card !p-4 flex flex-col items-center text-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <mod.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs font-medium text-foreground">{mod.title}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
