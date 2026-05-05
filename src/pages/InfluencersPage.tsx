import { motion } from "framer-motion";
import { Megaphone, AlertTriangle, Instagram, Youtube, ExternalLink, Zap, Lightbulb, Target, MessageSquare } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";

const platformIcons: Record<string, React.ElementType> = {
  Instagram, TikTok: ExternalLink, YouTube: Youtube, Twitter: ExternalLink, Newsletter: ExternalLink,
};

export default function InfluencersPage() {
  const { selectedIndustry, enhancedIndustry, influencerTips, isEnhancing, enhanceIndustryWithAI } = useAppContext();
  const navigate = useNavigate();

  const currentIndustry = enhancedIndustry || selectedIndustry;

  if (!selectedIndustry) {
    return (
      <div className="flex flex-col items-center justify-center h-96 page-enter">
        <AlertTriangle className="w-10 h-10 text-accent mb-3" />
        <h2 className="text-base font-semibold mb-1">No Market Selected</h2>
        <button onClick={() => navigate("/dashboard/industry")} className="text-primary underline text-sm">Go to Industries</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto page-enter pb-12">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Megaphone className="w-6 h-6 text-primary" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Influencers</h1>
        <p className="text-muted-foreground text-sm">{selectedIndustry.icon} {selectedIndustry.name} — Top voices & strategies</p>

        {!enhancedIndustry && (
          <button
            onClick={enhanceIndustryWithAI}
            disabled={isEnhancing}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors text-xs font-semibold"
          >
            <Zap className={`w-3.5 h-3.5 ${isEnhancing ? "animate-pulse" : ""}`} />
            {isEnhancing ? "Generating Genuine Insights..." : "Enhance with AI"}
          </button>
        )}
      </div>

      {influencerTips && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="neo-card border-primary/20 bg-primary/5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-primary">
              <Target className="w-4 h-4" /> Niche Strategy & Focus
            </h3>
            <p className="text-xs leading-relaxed mb-4 text-foreground/90">{influencerTips.generalStrategy}</p>
            <div className="flex flex-wrap gap-2">
              {influencerTips.platformFocus.map(p => (
                <span key={p} className="px-2 py-1 rounded bg-secondary text-[10px] font-medium border border-border">{p}</span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="neo-card border-accent/20 bg-accent/5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-accent">
              <Lightbulb className="w-4 h-4" /> Genuine Collaboration Tips
            </h3>
            <ul className="space-y-2">
              {influencerTips.genuineTips.map((tip, i) => (
                <li key={i} className="text-[11px] flex gap-2 items-start text-foreground/80">
                  <span className="text-accent mt-0.5">•</span> {tip}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 neo-card border-border/50">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-muted-foreground" /> Campaign Ideas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {influencerTips.collaborationIdeas.map((idea, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-secondary/30 border border-border/40 text-[11px]">
                  {idea}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
        {enhancedIndustry ? "Genuine Influencer Benchmarks" : "Representative Influencers"}
        <div className="h-px flex-1 bg-border/50" />
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {currentIndustry?.influencers.map((inf, i) => {
          const PlatformIcon = platformIcons[inf.platform] || ExternalLink;
          return (
            <motion.div key={inf.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} className="neo-card group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <PlatformIcon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{inf.name}</h3>
                  <p className="text-xs text-muted-foreground">{inf.platform}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reach</span>
                  <span className="font-mono font-medium">{inf.followers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Focus</span>
                  <span className="font-medium text-xs text-right max-w-[120px]">{inf.specialty}</span>
                </div>
                <div className="pt-2.5 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Rate</span>
                    <span className="font-mono text-lg font-bold text-accent">${inf.charge.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
