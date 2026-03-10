import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Rocket, Activity, Brain, ArrowRight, Zap, Gauge, Star, Users, TrendingUp, CheckCircle2, ChevronRight, Shield } from "lucide-react";
import HeroScene from "@/components/HeroScene";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const features = [
  { icon: Rocket, title: "Plan Your Budget", desc: "Configure investment, team size, and operational timeline" },
  { icon: Activity, title: "Live Analytics", desc: "Real-time analytics with interactive data visualizations" },
  { icon: Brain, title: "Smart Suggestions", desc: "AI-matched recommendations tailored to your resources" },
  { icon: Gauge, title: "Feasibility Check", desc: "Instant viability scoring for any startup idea" },
];

const howItWorks = [
  { step: "01", title: "Set Budget", desc: "Define your investment capital, team size, and timeline" },
  { step: "02", title: "Pick Industry", desc: "Choose from 5+ curated industries with real cost data" },
  { step: "03", title: "Get Insights", desc: "See feasibility scores, expenses, resources, and roadmaps" },
  { step: "04", title: "Launch Smart", desc: "Follow your personalized blueprint to bring your idea to life" },
];

const testimonials = [
  { name: "Sarah K.", role: "Fashion Entrepreneur", text: "StartSmart showed me exactly how to allocate my $10K budget. Launched my clothing brand in 3 months!", rating: 5 },
  { name: "James L.", role: "Food Startup Founder", text: "The feasibility check saved me from a $20K mistake. Pivoted to a food truck instead and it's thriving.", rating: 5 },
  { name: "Priya M.", role: "Content Creator", text: "From zero to 100K subscribers. The roadmap feature gave me clarity I couldn't find anywhere else.", rating: 5 },
];

const stats = [
  { value: "5+", label: "Industries" },
  { value: "50+", label: "Resources Mapped" },
  { value: "100%", label: "Free to Start" },
  { value: "24/7", label: "Available" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <HeroScene />

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          {/* Logo as text only — no 3D logo in hero to avoid misplacement */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-5"
          >
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Startup Intelligence Platform</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-5 tracking-tight leading-tight">
            <span className="text-glow text-primary">Start</span>
            <span className="text-glow-accent text-accent">Smart</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            From idea to launch — evaluate feasibility, plan costs, discover influencers, and chart your startup journey.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow text-sm px-8 h-11 rounded-lg font-semibold tracking-wide"
            >
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/signin")}
              className="border-primary/30 text-primary hover:bg-primary/10 text-sm px-8 h-11 rounded-lg tracking-wide"
            >
              Sign In
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-14 max-w-4xl w-full px-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + i * 0.1 }}
              className="neo-card text-center group py-8"
            >
              <div className="icon-box mx-auto group-hover:scale-110 transition-transform">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 py-16 px-4">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={item} className="text-center">
              <p className="text-4xl md:text-5xl font-extrabold gradient-text mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* How It Works */}
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Simple Process</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Four simple steps to go from idea to a fully planned startup</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {howItWorks.map((step, i) => (
              <motion.div key={step.step} variants={item} className="neo-card text-center relative">
                <div className="text-4xl font-extrabold text-primary/10 mb-2">{step.step}</div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="w-4 h-4 text-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4">
              <Users className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Testimonials</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Loved by Founders</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">See what entrepreneurs are saying about StartSmart</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={item} className="neo-card">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-foreground mb-4 leading-relaxed italic">"{t.text}"</p>
                <div className="border-t border-border pt-3">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center neo-card !py-12 gradient-bg neon-border"
        >
          <div className="icon-box mx-auto">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Ready to Launch?</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Join StartSmart today and turn your startup idea into a fully planned, actionable blueprint.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/signup")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow text-sm px-10 h-12 rounded-lg font-semibold tracking-wide"
          >
            Create Free Account <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold gradient-text">StartSmart</span>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <button onClick={() => navigate("/signup")} className="hover:text-primary transition-colors">Sign Up</button>
            <button onClick={() => navigate("/signin")} className="hover:text-primary transition-colors">Sign In</button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>© {new Date().getFullYear()} StartSmart. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
