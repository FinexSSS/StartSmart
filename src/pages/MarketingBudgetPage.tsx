import { motion } from "framer-motion";
import { Megaphone, AlertTriangle } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { PieTooltip, ChartTooltip } from "@/components/ChartTooltip";

const COLORS = ["hsl(174, 72%, 46%)", "hsl(322, 80%, 58%)", "hsl(45, 93%, 55%)", "hsl(152, 60%, 42%)", "hsl(262, 70%, 58%)", "hsl(199, 89%, 52%)"];

interface MarketingChannel {
  channel: string;
  percentage: number;
  description: string;
}

const industryMarketing: Record<string, MarketingChannel[]> = {
  clothing: [
    { channel: "Social Media Ads", percentage: 35, description: "Instagram, TikTok, Facebook ads targeting fashion audiences" },
    { channel: "Influencer Marketing", percentage: 25, description: "Collaborations with fashion influencers and micro-influencers" },
    { channel: "Content Marketing", percentage: 15, description: "Blog posts, lookbooks, style guides, and SEO" },
    { channel: "Email Marketing", percentage: 10, description: "Newsletter campaigns, abandoned cart recovery" },
    { channel: "Events & Pop-ups", percentage: 10, description: "Local fashion events and pop-up shops" },
    { channel: "PR & Media", percentage: 5, description: "Fashion magazine features and press releases" },
  ],
  food: [
    { channel: "Local Advertising", percentage: 30, description: "Flyers, local newspapers, community boards" },
    { channel: "Social Media", percentage: 25, description: "Instagram food photography, TikTok recipes" },
    { channel: "Delivery Platforms", percentage: 20, description: "UberEats, DoorDash, Grubhub promotion" },
    { channel: "Influencer Reviews", percentage: 10, description: "Food bloggers and local reviewers" },
    { channel: "Loyalty Programs", percentage: 10, description: "Punch cards, reward apps, repeat customer discounts" },
    { channel: "Events & Catering", percentage: 5, description: "Food festivals, corporate catering samples" },
  ],
  youtube: [
    { channel: "SEO & Thumbnails", percentage: 30, description: "Video SEO, keyword research, click-worthy thumbnails" },
    { channel: "Social Media Cross-posting", percentage: 25, description: "Clips on TikTok, Instagram Reels, Twitter" },
    { channel: "Collaborations", percentage: 20, description: "Creator collaborations and guest appearances" },
    { channel: "Community Building", percentage: 15, description: "Discord, Patreon, live streams, comment engagement" },
    { channel: "Paid Promotion", percentage: 5, description: "YouTube ads and Google Ads" },
    { channel: "Merchandise", percentage: 5, description: "Branded merch as a promotional tool" },
  ],
  cosmetics: [
    { channel: "Influencer Seeding", percentage: 30, description: "Send products to beauty influencers for reviews" },
    { channel: "Social Media Ads", percentage: 25, description: "Instagram, TikTok beauty community ads" },
    { channel: "Content Creation", percentage: 15, description: "Tutorials, before/after, user-generated content" },
    { channel: "Email & SMS", percentage: 10, description: "Product launches, exclusive offers, skincare tips" },
    { channel: "PR & Media", percentage: 10, description: "Beauty magazine features, press kits" },
    { channel: "Sampling", percentage: 10, description: "Free samples with purchases, sample boxes" },
  ],
  tech: [
    { channel: "Content Marketing & SEO", percentage: 30, description: "Blog posts, whitepapers, case studies" },
    { channel: "PPC / Google Ads", percentage: 25, description: "Search ads, display network, retargeting" },
    { channel: "Social Media (LinkedIn)", percentage: 15, description: "B2B marketing on LinkedIn, Twitter" },
    { channel: "Product Hunt / Launches", percentage: 10, description: "Launch events, beta programs, Product Hunt" },
    { channel: "Email Campaigns", percentage: 10, description: "Drip campaigns, onboarding sequences" },
    { channel: "Webinars & Events", percentage: 10, description: "Online demos, webinars, conference sponsorships" },
  ],
};

export default function MarketingBudgetPage() {
  const { budget, selectedIndustry, enhancedIndustry, monthsToRun } = useAppContext();
  const navigate = useNavigate();

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

  const marketingExpense = currentIndustry.expenses.find(e => e.category.toLowerCase().includes("marketing"));
  const monthlyBudget = marketingExpense?.amount || Math.round(budget * 0.1 / monthsToRun);
  const totalBudget = monthlyBudget * monthsToRun;

  const channels = currentIndustry.marketingChannels || industryMarketing[currentIndustry.id] || industryMarketing.tech;

  const pieData = channels.map(c => ({ name: c.channel, value: Math.round(totalBudget * c.percentage / 100) }));
  const barData = channels.map(c => ({ name: c.channel.length > 15 ? c.channel.slice(0, 15) + "…" : c.channel, amount: Math.round(totalBudget * c.percentage / 100), pct: c.percentage }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto page-enter">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Megaphone className="w-6 h-6 text-accent" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">Marketing Budget</h1>
        <p className="text-muted-foreground text-sm">{selectedIndustry.icon} {selectedIndustry.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="neo-card text-center py-3">
          <p className="text-[10px] text-muted-foreground mb-0.5">Monthly Budget</p>
          <p className="font-mono text-xl font-bold text-primary">${monthlyBudget.toLocaleString()}</p>
        </div>
        <div className="neo-card text-center py-3">
          <p className="text-[10px] text-muted-foreground mb-0.5">Total ({monthsToRun}mo)</p>
          <p className="font-mono text-xl font-bold text-accent">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="neo-card text-center py-3">
          <p className="text-[10px] text-muted-foreground mb-0.5">% of Budget</p>
          <p className="font-mono text-xl font-bold text-foreground">{((totalBudget / budget) * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="neo-card" style={{ minHeight: 320 }}>
          <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Distribution</h3>
          <ResponsiveContainer width="100%" height={270}>
            <RechartsPie>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

        <div className="neo-card" style={{ minHeight: 320 }}>
          <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">By Channel</h3>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis type="number" className="text-muted-foreground" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={120} className="text-muted-foreground" tick={{ fontSize: 9 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Details */}
      <div className="space-y-2">
        {channels.map((ch, i) => (
          <motion.div key={ch.channel} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className="neo-card flex items-center justify-between py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <div>
                <p className="font-medium text-sm">{ch.channel}</p>
                <p className="text-xs text-muted-foreground">{ch.description}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="font-mono text-sm font-bold text-primary">${Math.round(totalBudget * ch.percentage / 100).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">{ch.percentage}%</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
