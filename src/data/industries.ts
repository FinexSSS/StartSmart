export interface Industry {
  id: string;
  name: string;
  icon: string;
  description: string;
  minBudget: number;
  monthlyCostPerPerson: number;
  expenses: ExpenseItem[];
  influencers: Influencer[];
  materials: Material[];
  roadmap: RoadmapStep[];
  resources: ResourceItem[];
  marketingChannels?: MarketingChannel[];
}

export interface MarketingChannel {
  channel: string;
  percentage: number;
  description: string;
}

export interface ExpenseItem {
  category: string;
  amount: number;
  description: string;
  isMonthly?: boolean;
}

export interface Influencer {
  name: string;
  platform: string;
  followers: string;
  charge: number;
  specialty: string;
}

export interface Material {
  name: string;
  supplier: string;
  estimatedCost: number;
  unit: string;
  notes: string;
}

export interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  duration: string;
  cost: number;
}

export interface ResourceItem {
  name: string;
  type: "equipment" | "service" | "software" | "personnel";
  monthlyCost: number;
  oneTimeCost: number;
  description: string;
  essential: boolean;
}

export const industries: Industry[] = [
  {
    id: "clothing",
    name: "Clothing & Fashion",
    icon: "👗",
    description: "Start your own clothing brand or boutique",
    minBudget: 5000,
    monthlyCostPerPerson: 800,
    expenses: [
      { category: "Inventory & Materials", amount: 2000, description: "Initial fabric and clothing stock" },
      { category: "Branding & Design", amount: 800, description: "Logo, packaging, labels" },
      { category: "E-commerce Setup", amount: 500, description: "Website, domain, hosting" },
      { category: "Marketing", amount: 1000, description: "Social media ads, influencer outreach", isMonthly: true },
      { category: "Equipment", amount: 400, description: "Sewing machine, tools" },
      { category: "Legal & Permits", amount: 300, description: "Business registration, permits" },
      { category: "Team Salary", amount: 1500, description: "Monthly salary per team member", isMonthly: true },
    ],
    influencers: [
      { name: "Fashion Nova Girl", platform: "Instagram", followers: "500K", charge: 2000, specialty: "Streetwear & Casual" },
      { name: "Style Maven", platform: "TikTok", followers: "1.2M", charge: 3500, specialty: "Luxury Fashion" },
      { name: "Outfit Daily", platform: "YouTube", followers: "800K", charge: 2500, specialty: "Budget Fashion" },
    ],
    materials: [
      { name: "Cotton Fabric", supplier: "FabricMart", estimatedCost: 8, unit: "per yard", notes: "Bulk discounts available" },
      { name: "Polyester Blend", supplier: "TextilePro", estimatedCost: 5, unit: "per yard", notes: "Quick-dry material" },
      { name: "Labels & Tags", supplier: "LabelKing", estimatedCost: 0.15, unit: "per piece", notes: "Custom branding" },
      { name: "Packaging Boxes", supplier: "PackRight", estimatedCost: 1.5, unit: "per box", notes: "Eco-friendly options" },
    ],
    roadmap: [
      { step: 1, title: "Market Research", description: "Identify target audience, analyze competitors, and find your niche", duration: "2 weeks", cost: 0 },
      { step: 2, title: "Brand Identity", description: "Create logo, brand colors, and overall aesthetic", duration: "1 week", cost: 800 },
      { step: 3, title: "Source Materials", description: "Find reliable fabric suppliers and negotiate prices", duration: "2 weeks", cost: 2000 },
      { step: 4, title: "Create First Collection", description: "Design and produce your initial product line", duration: "4 weeks", cost: 500 },
      { step: 5, title: "Launch Online Store", description: "Set up e-commerce, product photography, and launch", duration: "2 weeks", cost: 500 },
      { step: 6, title: "Marketing Campaign", description: "Social media marketing and influencer partnerships", duration: "Ongoing", cost: 1000 },
    ],
    resources: [
      { name: "Industrial Sewing Machine", type: "equipment", monthlyCost: 0, oneTimeCost: 350, description: "Heavy-duty for production", essential: true },
      { name: "Shopify Store", type: "software", monthlyCost: 39, oneTimeCost: 0, description: "E-commerce platform", essential: true },
      { name: "Fashion Designer", type: "personnel", monthlyCost: 2000, oneTimeCost: 0, description: "Freelance or part-time designer", essential: false },
      { name: "Photography Studio Rental", type: "service", monthlyCost: 200, oneTimeCost: 0, description: "Product photoshoots", essential: true },
      { name: "Heat Press Machine", type: "equipment", monthlyCost: 0, oneTimeCost: 250, description: "For custom prints", essential: false },
    ],
  },
  {
    id: "food",
    name: "Food & Restaurant",
    icon: "🍕",
    description: "Launch a food business, restaurant, or catering service",
    minBudget: 8000,
    monthlyCostPerPerson: 1200,
    expenses: [
      { category: "Kitchen Equipment", amount: 3000, description: "Ovens, refrigerators, utensils" },
      { category: "Initial Ingredients", amount: 1500, description: "First month's raw materials" },
      { category: "Rent & Utilities", amount: 1500, description: "Kitchen space or food truck lease", isMonthly: true },
      { category: "Licensing", amount: 800, description: "Food safety permits, business license" },
      { category: "Marketing", amount: 700, description: "Menu design, local advertising", isMonthly: true },
      { category: "Packaging", amount: 500, description: "Containers, bags, branding" },
      { category: "Team Salary", amount: 1800, description: "Monthly salary per team member", isMonthly: true },
    ],
    influencers: [
      { name: "FoodieExplorer", platform: "Instagram", followers: "300K", charge: 1500, specialty: "Restaurant Reviews" },
      { name: "Chef's Table", platform: "YouTube", followers: "2M", charge: 5000, specialty: "Cooking Tutorials" },
      { name: "TasteBud Travels", platform: "TikTok", followers: "900K", charge: 2000, specialty: "Street Food" },
    ],
    materials: [
      { name: "Commercial Oven", supplier: "KitchenPro", estimatedCost: 1200, unit: "per unit", notes: "Energy efficient" },
      { name: "Bulk Ingredients", supplier: "WholeFoods Supply", estimatedCost: 500, unit: "monthly", notes: "Organic options" },
      { name: "Food Containers", supplier: "EcoPack", estimatedCost: 0.3, unit: "per piece", notes: "Biodegradable" },
      { name: "Uniforms", supplier: "ChefWear", estimatedCost: 35, unit: "per set", notes: "Custom embroidery" },
    ],
    roadmap: [
      { step: 1, title: "Concept Development", description: "Define cuisine type, menu, and unique selling proposition", duration: "2 weeks", cost: 0 },
      { step: 2, title: "Location & Permits", description: "Secure kitchen space and obtain required licenses", duration: "4 weeks", cost: 2300 },
      { step: 3, title: "Equipment Setup", description: "Purchase and install kitchen equipment", duration: "2 weeks", cost: 3000 },
      { step: 4, title: "Menu Testing", description: "Recipe development and taste testing", duration: "2 weeks", cost: 500 },
      { step: 5, title: "Soft Launch", description: "Open for limited service to gather feedback", duration: "2 weeks", cost: 1500 },
      { step: 6, title: "Grand Opening", description: "Full launch with marketing push", duration: "1 week", cost: 700 },
    ],
    resources: [
      { name: "Commercial Kitchen Space", type: "service", monthlyCost: 1200, oneTimeCost: 0, description: "Shared or private kitchen rental", essential: true },
      { name: "POS System", type: "software", monthlyCost: 60, oneTimeCost: 200, description: "Point of sale + inventory", essential: true },
      { name: "Delivery Platform Fee", type: "service", monthlyCost: 150, oneTimeCost: 0, description: "UberEats, DoorDash listing", essential: false },
      { name: "Food Safety Certification", type: "service", monthlyCost: 0, oneTimeCost: 300, description: "Required by law", essential: true },
      { name: "Line Cook", type: "personnel", monthlyCost: 2500, oneTimeCost: 0, description: "Full-time kitchen staff", essential: true },
    ],
  },
  {
    id: "youtube",
    name: "YouTube / Content Creation",
    icon: "🎬",
    description: "Start a YouTube channel or content creation business",
    minBudget: 2000,
    monthlyCostPerPerson: 500,
    expenses: [
      { category: "Camera Equipment", amount: 800, description: "Camera, lenses, tripod" },
      { category: "Audio Equipment", amount: 300, description: "Microphone, audio interface" },
      { category: "Lighting", amount: 200, description: "Ring light, softbox setup" },
      { category: "Editing Software", amount: 200, description: "Premiere Pro, After Effects subscription", isMonthly: true },
      { category: "Studio Setup", amount: 300, description: "Backdrop, desk, decor" },
      { category: "Initial Promotion", amount: 200, description: "Social media ads to boost first videos", isMonthly: true },
    ],
    influencers: [
      { name: "Creator Academy", platform: "YouTube", followers: "1.5M", charge: 500, specialty: "Creator Tips" },
      { name: "TechReviewPro", platform: "YouTube", followers: "3M", charge: 8000, specialty: "Tech Reviews" },
      { name: "VlogLife", platform: "Instagram", followers: "600K", charge: 1200, specialty: "Lifestyle Vlogs" },
    ],
    materials: [
      { name: "DSLR Camera", supplier: "CameraWorld", estimatedCost: 600, unit: "per unit", notes: "4K capable" },
      { name: "Wireless Mic", supplier: "AudioTech", estimatedCost: 150, unit: "per set", notes: "Lavalier type" },
      { name: "LED Panel Light", supplier: "LightPro", estimatedCost: 80, unit: "per unit", notes: "Adjustable temp" },
      { name: "Green Screen", supplier: "StudioGear", estimatedCost: 40, unit: "per unit", notes: "Collapsible" },
    ],
    roadmap: [
      { step: 1, title: "Niche Selection", description: "Choose your content niche and target audience", duration: "1 week", cost: 0 },
      { step: 2, title: "Equipment Purchase", description: "Get camera, mic, and lighting setup", duration: "1 week", cost: 1300 },
      { step: 3, title: "Channel Branding", description: "Create logo, banner, intro/outro templates", duration: "1 week", cost: 100 },
      { step: 4, title: "Content Planning", description: "Plan first 10 videos with scripts and schedules", duration: "1 week", cost: 0 },
      { step: 5, title: "First Upload", description: "Film, edit, and upload your first video", duration: "1 week", cost: 200 },
      { step: 6, title: "Growth Strategy", description: "SEO optimization, collaboration, and consistency", duration: "Ongoing", cost: 200 },
    ],
    resources: [
      { name: "Adobe Creative Suite", type: "software", monthlyCost: 55, oneTimeCost: 0, description: "Premiere Pro, Photoshop, etc.", essential: true },
      { name: "Video Editor (Freelance)", type: "personnel", monthlyCost: 500, oneTimeCost: 0, description: "Part-time editing help", essential: false },
      { name: "Thumbnail Designer", type: "service", monthlyCost: 100, oneTimeCost: 0, description: "Per video thumbnail", essential: false },
      { name: "Studio Soundproofing", type: "equipment", monthlyCost: 0, oneTimeCost: 200, description: "Foam panels", essential: true },
      { name: "Stock Music License", type: "software", monthlyCost: 15, oneTimeCost: 0, description: "Royalty-free music", essential: true },
    ],
  },
  {
    id: "cosmetics",
    name: "Cosmetics & Beauty",
    icon: "💄",
    description: "Launch your own beauty or skincare brand",
    minBudget: 6000,
    monthlyCostPerPerson: 1000,
    expenses: [
      { category: "Product Development", amount: 2000, description: "Formulation, testing, samples" },
      { category: "Packaging & Labels", amount: 1200, description: "Bottles, jars, custom labels" },
      { category: "Certifications", amount: 800, description: "FDA compliance, safety testing" },
      { category: "E-commerce", amount: 500, description: "Website and payment gateway" },
      { category: "Marketing", amount: 1000, description: "Influencer partnerships, ads", isMonthly: true },
      { category: "Initial Inventory", amount: 500, description: "First batch production" },
      { category: "Team Salary", amount: 1200, description: "Monthly salary per team member", isMonthly: true },
    ],
    influencers: [
      { name: "GlowUp Queen", platform: "Instagram", followers: "700K", charge: 2500, specialty: "Skincare Routines" },
      { name: "MakeupByMia", platform: "TikTok", followers: "1.8M", charge: 4000, specialty: "Makeup Tutorials" },
      { name: "Beauty Insider", platform: "YouTube", followers: "1.1M", charge: 3000, specialty: "Product Reviews" },
    ],
    materials: [
      { name: "Base Oils", supplier: "NaturalEssence", estimatedCost: 25, unit: "per liter", notes: "Organic certified" },
      { name: "Glass Jars 50ml", supplier: "PackBeauty", estimatedCost: 1.2, unit: "per piece", notes: "Frosted finish" },
      { name: "Pigment Powders", supplier: "ColorTech", estimatedCost: 15, unit: "per 100g", notes: "Cosmetic grade" },
      { name: "Safety Seals", supplier: "SecurePack", estimatedCost: 0.1, unit: "per piece", notes: "Tamper-evident" },
    ],
    roadmap: [
      { step: 1, title: "Product Research", description: "Study market trends and identify product gaps", duration: "2 weeks", cost: 0 },
      { step: 2, title: "Formulation", description: "Develop product formulas with a cosmetic chemist", duration: "4 weeks", cost: 2000 },
      { step: 3, title: "Safety Testing", description: "Get products tested and certified", duration: "3 weeks", cost: 800 },
      { step: 4, title: "Packaging Design", description: "Design and order custom packaging", duration: "3 weeks", cost: 1200 },
      { step: 5, title: "Online Store Launch", description: "Build website and list products", duration: "2 weeks", cost: 500 },
      { step: 6, title: "Marketing Blitz", description: "Influencer seeding and social media campaigns", duration: "Ongoing", cost: 1000 },
    ],
    resources: [
      { name: "Cosmetic Chemist Consultation", type: "service", monthlyCost: 0, oneTimeCost: 1500, description: "Formula development", essential: true },
      { name: "Lab Testing Services", type: "service", monthlyCost: 0, oneTimeCost: 800, description: "Safety & compliance", essential: true },
      { name: "Shopify + Beauty Theme", type: "software", monthlyCost: 39, oneTimeCost: 80, description: "Optimized storefront", essential: true },
      { name: "Fulfillment Service", type: "service", monthlyCost: 200, oneTimeCost: 0, description: "Order packing & shipping", essential: false },
      { name: "Brand Photographer", type: "personnel", monthlyCost: 300, oneTimeCost: 0, description: "Product photography", essential: true },
    ],
  },
  {
    id: "tech",
    name: "Tech / SaaS",
    icon: "💻",
    description: "Build a tech startup or SaaS product",
    minBudget: 10000,
    monthlyCostPerPerson: 2000,
    expenses: [
      { category: "Development", amount: 4000, description: "MVP development, freelancers" },
      { category: "Cloud & Hosting", amount: 1200, description: "AWS/GCP, domain, SSL", isMonthly: true },
      { category: "Design & UX", amount: 1500, description: "UI/UX design, prototyping" },
      { category: "Legal", amount: 1000, description: "Incorporation, terms of service" },
      { category: "Marketing", amount: 1500, description: "Landing page, PPC, content", isMonthly: true },
      { category: "Tools & Licenses", amount: 800, description: "Software subscriptions", isMonthly: true },
      { category: "Team Salary", amount: 3000, description: "Monthly salary per team member", isMonthly: true },
    ],
    influencers: [
      { name: "TechCrunch Writer", platform: "Twitter", followers: "200K", charge: 3000, specialty: "Startup Coverage" },
      { name: "SaaS Weekly", platform: "Newsletter", followers: "50K", charge: 1000, specialty: "SaaS Reviews" },
      { name: "DevTok", platform: "TikTok", followers: "400K", charge: 1500, specialty: "Tech Tutorials" },
    ],
    materials: [
      { name: "Cloud Credits", supplier: "AWS/GCP", estimatedCost: 100, unit: "monthly", notes: "Startup programs available" },
      { name: "Domain Name", supplier: "Namecheap", estimatedCost: 12, unit: "yearly", notes: ".com preferred" },
      { name: "Design Tools", supplier: "Figma", estimatedCost: 15, unit: "monthly", notes: "Per editor seat" },
      { name: "Analytics", supplier: "Mixpanel", estimatedCost: 0, unit: "monthly", notes: "Free tier available" },
    ],
    roadmap: [
      { step: 1, title: "Idea Validation", description: "Survey potential users and validate the problem", duration: "2 weeks", cost: 0 },
      { step: 2, title: "MVP Planning", description: "Define core features and create wireframes", duration: "2 weeks", cost: 1500 },
      { step: 3, title: "Development", description: "Build the minimum viable product", duration: "8 weeks", cost: 4000 },
      { step: 4, title: "Beta Testing", description: "Launch to early users and gather feedback", duration: "3 weeks", cost: 200 },
      { step: 5, title: "Launch", description: "Public launch with marketing campaign", duration: "2 weeks", cost: 2500 },
      { step: 6, title: "Iterate & Scale", description: "Improve based on feedback, acquire users", duration: "Ongoing", cost: 1800 },
    ],
    resources: [
      { name: "Full-Stack Developer", type: "personnel", monthlyCost: 4000, oneTimeCost: 0, description: "Core product development", essential: true },
      { name: "AWS/GCP Infrastructure", type: "software", monthlyCost: 100, oneTimeCost: 0, description: "Cloud hosting & services", essential: true },
      { name: "CI/CD Pipeline", type: "software", monthlyCost: 0, oneTimeCost: 0, description: "GitHub Actions (free tier)", essential: true },
      { name: "UX Designer (Contract)", type: "personnel", monthlyCost: 1500, oneTimeCost: 0, description: "Part-time design work", essential: false },
      { name: "Legal Consultation", type: "service", monthlyCost: 0, oneTimeCost: 1000, description: "Incorporation & ToS", essential: true },
    ],
  },
];

export function getIndustryById(id: string): Industry | undefined {
  return industries.find((i) => i.id === id);
}

export function calculateFeasibility(budget: number, industry: Industry, teamSize: number = 1, months: number = 6) {
  const oneTimeExpenses = industry.expenses.filter(e => !e.isMonthly).reduce((sum, e) => sum + e.amount, 0);
  const monthlyExpenses = industry.expenses.filter(e => e.isMonthly).reduce((sum, e) => sum + e.amount, 0);
  const teamMonthlyCost = industry.monthlyCostPerPerson * (teamSize - 1); // extra team members beyond founder
  const totalMonthly = (monthlyExpenses + teamMonthlyCost) * months;
  const totalExpenses = oneTimeExpenses + totalMonthly;

  const isFeasible = budget >= totalExpenses;
  const budgetGap = isFeasible ? 0 : totalExpenses - budget;
  const surplus = isFeasible ? budget - totalExpenses : 0;
  const estimatedProfit = isFeasible ? surplus * 0.3 + totalExpenses * 0.15 : 0;
  const feasibilityScore = Math.min(100, Math.round((budget / totalExpenses) * 100));
  const monthlyBurn = monthlyExpenses + teamMonthlyCost;
  const runway = monthlyBurn > 0 ? Math.floor((budget - oneTimeExpenses) / monthlyBurn) : months;

  return { totalExpenses, oneTimeExpenses, monthlyBurn, totalMonthly, isFeasible, budgetGap, surplus, estimatedProfit, feasibilityScore, runway };
}

export function getRecommendations(budget: number): Industry[] {
  return industries
    .filter((i) => budget >= i.minBudget * 0.7)
    .sort((a, b) => {
      const aFit = Math.abs(budget - a.minBudget);
      const bFit = Math.abs(budget - b.minBudget);
      return aFit - bFit;
    });
}
