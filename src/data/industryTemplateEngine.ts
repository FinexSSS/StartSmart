import type { Industry, ExpenseItem, Influencer, Material, ResourceItem, RoadmapStep } from "@/data/industries";
import type { AIIndustrySuggestion } from "@/services/aiService";

type IndustryCategory =
  | "tech"
  | "food"
  | "retail"
  | "health"
  | "education"
  | "services"
  | "manufacturing"
  | "logistics"
  | "media"
  | "energy"
  | "real_estate";

function normalizeId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function detectCategory(name: string): IndustryCategory {
  const n = name.toLowerCase();
  if (/(saas|app|tech|cloud|ai|iot|robotics|cyber|data|gaming|animation)/.test(n)) return "tech";
  if (/(food|cafe|bakery|restaurant|kitchen|beverage|snacks|dairy|ice cream)/.test(n)) return "food";
  if (/(store|retail|e-commerce|dropshipping|bookstore|toy|electronics|subscription box)/.test(n)) return "retail";
  if (/(clinic|medical|dental|pharmacy|wellness|nutrition|veterinary|telemedicine)/.test(n)) return "health";
  if (/(edtech|learning|coaching|training|language)/.test(n)) return "education";
  if (/(agency|consulting|accounting|legal|hr|staffing|cleaning|laundry|security)/.test(n)) return "services";
  if (/(manufacturing|packaging|furniture|printing|3d printing|leather|footwear|jewelry)/.test(n)) return "manufacturing";
  if (/(logistics|delivery|courier|import export|distribution|transport)/.test(n)) return "logistics";
  if (/(youtube|podcast|music|video|influencer|pr|market research|photography)/.test(n)) return "media";
  if (/(solar|ev charging|recycling|waste|energy)/.test(n)) return "energy";
  if (/(real estate|property|construction|renovation|architecture|interior)/.test(n)) return "real_estate";
  return "services";
}

function expenseTemplate(category: IndustryCategory, minBudget: number): ExpenseItem[] {
  const monthly = Math.round(minBudget * 0.12);
  const oneTime = Math.round(minBudget * 0.2);
  const common: ExpenseItem[] = [
    { category: "Business Registration", amount: Math.max(150, Math.round(minBudget * 0.03)), description: "Licensing and legal setup", isMonthly: false },
    { category: "Marketing", amount: Math.max(250, Math.round(minBudget * 0.08)), description: "Digital marketing and promotions", isMonthly: true },
  ];
  const map: Record<IndustryCategory, ExpenseItem[]> = {
    tech: [
      { category: "Product Development", amount: oneTime, description: "MVP build and initial engineering", isMonthly: false },
      { category: "Cloud Infrastructure", amount: monthly, description: "Hosting, monitoring, and APIs", isMonthly: true },
      { category: "Software Subscriptions", amount: Math.max(120, Math.round(monthly * 0.45)), description: "Dev and collaboration tools", isMonthly: true },
    ],
    food: [
      { category: "Kitchen Setup", amount: oneTime, description: "Equipment and setup costs", isMonthly: false },
      { category: "Raw Ingredients", amount: Math.max(300, Math.round(monthly * 1.1)), description: "Ongoing ingredients procurement", isMonthly: true },
      { category: "Rent & Utilities", amount: Math.max(350, Math.round(monthly * 0.9)), description: "Outlet/kitchen operational costs", isMonthly: true },
    ],
    retail: [
      { category: "Initial Inventory", amount: oneTime, description: "Opening inventory purchase", isMonthly: false },
      { category: "Store Operations", amount: Math.max(250, Math.round(monthly * 0.8)), description: "Rent and utilities", isMonthly: true },
      { category: "Packaging & Shipping", amount: Math.max(180, Math.round(monthly * 0.5)), description: "Fulfillment and delivery", isMonthly: true },
    ],
    health: [
      { category: "Equipment & Compliance", amount: oneTime, description: "Medical setup and compliance", isMonthly: false },
      { category: "Professional Services", amount: Math.max(450, Math.round(monthly * 1.2)), description: "Staff and specialist costs", isMonthly: true },
      { category: "Consumables", amount: Math.max(250, Math.round(monthly * 0.6)), description: "Routine operational consumables", isMonthly: true },
    ],
    education: [
      { category: "Curriculum Development", amount: oneTime, description: "Program content and setup", isMonthly: false },
      { category: "Platform & Tools", amount: Math.max(180, Math.round(monthly * 0.6)), description: "LMS, meeting tools, subscriptions", isMonthly: true },
      { category: "Instructor Cost", amount: Math.max(350, Math.round(monthly)), description: "Teaching and support staff", isMonthly: true },
    ],
    services: [
      { category: "Office Setup", amount: Math.max(300, Math.round(oneTime * 0.7)), description: "Basic equipment and setup", isMonthly: false },
      { category: "Operations", amount: Math.max(220, Math.round(monthly * 0.8)), description: "Admin and operations", isMonthly: true },
      { category: "Client Acquisition", amount: Math.max(220, Math.round(monthly * 0.7)), description: "Lead generation and sales", isMonthly: true },
    ],
    manufacturing: [
      { category: "Machinery", amount: Math.max(2500, Math.round(oneTime * 1.5)), description: "Production equipment and setup", isMonthly: false },
      { category: "Raw Materials", amount: Math.max(450, Math.round(monthly * 1.2)), description: "Regular material sourcing", isMonthly: true },
      { category: "Factory Operations", amount: Math.max(350, Math.round(monthly * 0.9)), description: "Power, maintenance, labor", isMonthly: true },
    ],
    logistics: [
      { category: "Fleet/Transport Setup", amount: oneTime, description: "Vehicles and operations setup", isMonthly: false },
      { category: "Fuel & Transit", amount: Math.max(350, Math.round(monthly * 1.1)), description: "Transport operating expenses", isMonthly: true },
      { category: "Tracking & Dispatch", amount: Math.max(150, Math.round(monthly * 0.4)), description: "Logistics software and operations", isMonthly: true },
    ],
    media: [
      { category: "Production Equipment", amount: Math.max(900, Math.round(oneTime * 0.9)), description: "Camera/audio/studio setup", isMonthly: false },
      { category: "Editing & Distribution", amount: Math.max(140, Math.round(monthly * 0.5)), description: "Software and publishing tools", isMonthly: true },
      { category: "Audience Growth", amount: Math.max(200, Math.round(monthly * 0.7)), description: "Ads and promotions", isMonthly: true },
    ],
    energy: [
      { category: "Infrastructure Setup", amount: Math.max(5000, Math.round(oneTime * 1.8)), description: "Core technical setup", isMonthly: false },
      { category: "Maintenance", amount: Math.max(300, Math.round(monthly * 0.8)), description: "Routine service and maintenance", isMonthly: true },
      { category: "Field Operations", amount: Math.max(300, Math.round(monthly * 0.9)), description: "On-ground operations", isMonthly: true },
    ],
    real_estate: [
      { category: "Office & Setup", amount: Math.max(1000, Math.round(oneTime)), description: "Branch/office setup", isMonthly: false },
      { category: "Lead Generation", amount: Math.max(300, Math.round(monthly * 0.9)), description: "Ads and lead channels", isMonthly: true },
      { category: "Operations", amount: Math.max(260, Math.round(monthly * 0.7)), description: "Transport and admin costs", isMonthly: true },
    ],
  };
  return [...map[category], ...common];
}

function materialTemplate(category: IndustryCategory): Material[] {
  const common: Material[] = [
    { name: "Packaging Material", supplier: "Local wholesale market", estimatedCost: 2, unit: "per unit", notes: "Bulk pricing preferred" },
    { name: "Operational Consumables", supplier: "Regional distributors", estimatedCost: 5, unit: "per unit", notes: "Monthly restock" },
  ];
  const categorySpecific: Record<IndustryCategory, Material[]> = {
    tech: [
      { name: "Cloud Credits", supplier: "AWS/Azure/GCP", estimatedCost: 80, unit: "monthly", notes: "Usage-based billing" },
      { name: "Domain & SSL", supplier: "Namecheap/Cloudflare", estimatedCost: 15, unit: "yearly", notes: "Basic security setup" },
    ],
    food: [
      { name: "Core Ingredients", supplier: "Local wholesale suppliers", estimatedCost: 250, unit: "weekly", notes: "Quality/price balance" },
      { name: "Kitchen Consumables", supplier: "Restaurant supply stores", estimatedCost: 80, unit: "weekly", notes: "Cleaning and disposables" },
    ],
    retail: [
      { name: "Product Inventory", supplier: "Manufacturers/wholesalers", estimatedCost: 500, unit: "batch", notes: "Trend-based replenishment" },
      { name: "Shipping Supplies", supplier: "Packaging vendors", estimatedCost: 1.5, unit: "per order", notes: "Branded packaging" },
    ],
    health: [
      { name: "Medical Consumables", supplier: "Certified suppliers", estimatedCost: 180, unit: "weekly", notes: "Compliance required" },
      { name: "Sanitization Supplies", supplier: "Healthcare distributors", estimatedCost: 60, unit: "weekly", notes: "Daily usage" },
    ],
    education: [
      { name: "Course Material", supplier: "Digital platforms", estimatedCost: 100, unit: "monthly", notes: "Content license or production" },
      { name: "Learning Tools", supplier: "EdTech vendors", estimatedCost: 70, unit: "monthly", notes: "Student engagement tools" },
    ],
    services: [
      { name: "Office Supplies", supplier: "Stationery wholesalers", estimatedCost: 40, unit: "monthly", notes: "Routine operations" },
      { name: "Field Consumables", supplier: "Local vendors", estimatedCost: 60, unit: "monthly", notes: "Service dependent" },
    ],
    manufacturing: [
      { name: "Raw Production Input", supplier: "Industrial suppliers", estimatedCost: 700, unit: "batch", notes: "Cost fluctuates with volume" },
      { name: "Machine Parts", supplier: "OEM/local suppliers", estimatedCost: 120, unit: "monthly", notes: "Preventive replacement" },
    ],
    logistics: [
      { name: "Fuel", supplier: "Regional fuel stations", estimatedCost: 350, unit: "weekly", notes: "Depends on route volume" },
      { name: "Packaging & Labels", supplier: "Packaging wholesalers", estimatedCost: 1, unit: "per package", notes: "Tracking labels included" },
    ],
    media: [
      { name: "Production Props", supplier: "Local creative stores", estimatedCost: 120, unit: "monthly", notes: "Campaign dependent" },
      { name: "Storage Media", supplier: "Electronics suppliers", estimatedCost: 80, unit: "monthly", notes: "Backup and archive" },
    ],
    energy: [
      { name: "Electrical Components", supplier: "Energy equipment distributors", estimatedCost: 900, unit: "batch", notes: "Safety compliance required" },
      { name: "Installation Hardware", supplier: "Industrial suppliers", estimatedCost: 450, unit: "batch", notes: "Site-specific quantities" },
    ],
    real_estate: [
      { name: "Site Documentation Materials", supplier: "Office/print shops", estimatedCost: 50, unit: "monthly", notes: "Listing documentation" },
      { name: "On-site Utilities", supplier: "Local utility providers", estimatedCost: 180, unit: "monthly", notes: "Project dependent" },
    ],
  };
  return [...categorySpecific[category], ...common];
}

function resourceTemplate(category: IndustryCategory): ResourceItem[] {
  const base: ResourceItem[] = [
    { name: "Project Management Tool", type: "software", monthlyCost: 20, oneTimeCost: 0, description: "Planning and task tracking", essential: true },
    { name: "Marketing Toolkit", type: "software", monthlyCost: 30, oneTimeCost: 0, description: "Email, social, and analytics tools", essential: true },
  ];
  const cat: Record<IndustryCategory, ResourceItem[]> = {
    tech: [
      { name: "Cloud Hosting", type: "software", monthlyCost: 120, oneTimeCost: 0, description: "Servers and managed services", essential: true },
      { name: "Developer Workstation", type: "equipment", monthlyCost: 0, oneTimeCost: 1200, description: "Coding and testing machine", essential: true },
    ],
    food: [
      { name: "Kitchen Equipment Set", type: "equipment", monthlyCost: 0, oneTimeCost: 2500, description: "Core cooking setup", essential: true },
      { name: "POS & Billing", type: "software", monthlyCost: 40, oneTimeCost: 100, description: "Order and billing system", essential: true },
    ],
    retail: [
      { name: "Inventory System", type: "software", monthlyCost: 35, oneTimeCost: 0, description: "Stock and reorder management", essential: true },
      { name: "Storage Fixtures", type: "equipment", monthlyCost: 0, oneTimeCost: 900, description: "Shelving and displays", essential: true },
    ],
    health: [
      { name: "Compliance Toolkit", type: "software", monthlyCost: 60, oneTimeCost: 0, description: "Record and compliance management", essential: true },
      { name: "Specialized Equipment", type: "equipment", monthlyCost: 0, oneTimeCost: 3500, description: "Service-specific equipment", essential: true },
    ],
    education: [
      { name: "LMS Platform", type: "software", monthlyCost: 55, oneTimeCost: 0, description: "Learning content delivery", essential: true },
      { name: "Teaching Setup", type: "equipment", monthlyCost: 0, oneTimeCost: 800, description: "Camera, mic, display setup", essential: false },
    ],
    services: [
      { name: "CRM Platform", type: "software", monthlyCost: 45, oneTimeCost: 0, description: "Leads and client management", essential: true },
      { name: "Field Equipment", type: "equipment", monthlyCost: 0, oneTimeCost: 700, description: "Operational tools", essential: false },
    ],
    manufacturing: [
      { name: "Production Machinery", type: "equipment", monthlyCost: 0, oneTimeCost: 5000, description: "Core manufacturing machinery", essential: true },
      { name: "Factory Utility Services", type: "service", monthlyCost: 300, oneTimeCost: 0, description: "Power and maintenance", essential: true },
    ],
    logistics: [
      { name: "Dispatch Software", type: "software", monthlyCost: 60, oneTimeCost: 0, description: "Route and dispatch optimization", essential: true },
      { name: "Transport Assets", type: "equipment", monthlyCost: 0, oneTimeCost: 4000, description: "Delivery vehicles/equipment", essential: true },
    ],
    media: [
      { name: "Editing Suite", type: "software", monthlyCost: 50, oneTimeCost: 0, description: "Video/audio design software", essential: true },
      { name: "Production Kit", type: "equipment", monthlyCost: 0, oneTimeCost: 1800, description: "Camera, lighting, audio", essential: true },
    ],
    energy: [
      { name: "Monitoring Software", type: "software", monthlyCost: 70, oneTimeCost: 0, description: "Performance monitoring systems", essential: true },
      { name: "Field Installation Kit", type: "equipment", monthlyCost: 0, oneTimeCost: 6000, description: "Installation and maintenance kit", essential: true },
    ],
    real_estate: [
      { name: "Listing CRM", type: "software", monthlyCost: 45, oneTimeCost: 0, description: "Listings and lead pipeline", essential: true },
      { name: "Site Operations Vehicle", type: "equipment", monthlyCost: 0, oneTimeCost: 3500, description: "Local site visits and operations", essential: false },
    ],
  };
  return [...cat[category], ...base];
}

function influencerTemplate(category: IndustryCategory): Influencer[] {
  const map: Record<IndustryCategory, Influencer[]> = {
    tech: [
      { name: "@techinsider", platform: "YouTube", followers: "950K", charge: 1800, specialty: "Tech products and SaaS" },
      { name: "@buildinpublic", platform: "X", followers: "420K", charge: 900, specialty: "Startup growth content" },
    ],
    food: [
      { name: "@foodtrail", platform: "Instagram", followers: "780K", charge: 1400, specialty: "Food reviews and launches" },
      { name: "@cookdaily", platform: "TikTok", followers: "1.2M", charge: 1700, specialty: "Recipe and brand features" },
    ],
    retail: [
      { name: "@shopsmart", platform: "Instagram", followers: "610K", charge: 1200, specialty: "Retail product highlights" },
      { name: "@dealupdate", platform: "YouTube", followers: "430K", charge: 1000, specialty: "Product comparisons" },
    ],
    health: [
      { name: "@healthguide", platform: "Instagram", followers: "690K", charge: 1500, specialty: "Wellness and healthcare awareness" },
      { name: "@fitmed", platform: "YouTube", followers: "500K", charge: 1300, specialty: "Health education content" },
    ],
    education: [
      { name: "@learnfast", platform: "YouTube", followers: "820K", charge: 1600, specialty: "Study and learning methods" },
      { name: "@exammentor", platform: "Instagram", followers: "350K", charge: 800, specialty: "Student-focused education tips" },
    ],
    services: [
      { name: "@bizinsights", platform: "LinkedIn", followers: "300K", charge: 900, specialty: "SMB growth and services" },
      { name: "@growthloops", platform: "X", followers: "250K", charge: 700, specialty: "Customer acquisition" },
    ],
    manufacturing: [
      { name: "@industrynext", platform: "YouTube", followers: "280K", charge: 900, specialty: "Industrial and factory solutions" },
      { name: "@makerworld", platform: "Instagram", followers: "190K", charge: 650, specialty: "Manufacturing workflows" },
    ],
    logistics: [
      { name: "@supplychainpro", platform: "LinkedIn", followers: "220K", charge: 850, specialty: "Logistics operations and insights" },
      { name: "@deliverystories", platform: "YouTube", followers: "180K", charge: 700, specialty: "Delivery and fulfillment content" },
    ],
    media: [
      { name: "@creatorboost", platform: "YouTube", followers: "1M", charge: 1900, specialty: "Creator growth and media strategy" },
      { name: "@socialspark", platform: "Instagram", followers: "740K", charge: 1500, specialty: "Brand storytelling" },
    ],
    energy: [
      { name: "@greenfuture", platform: "YouTube", followers: "260K", charge: 850, specialty: "Renewable energy education" },
      { name: "@solarinsight", platform: "LinkedIn", followers: "140K", charge: 600, specialty: "Solar adoption and awareness" },
    ],
    real_estate: [
      { name: "@propertypulse", platform: "Instagram", followers: "540K", charge: 1300, specialty: "Property market trends" },
      { name: "@realestateacademy", platform: "YouTube", followers: "460K", charge: 1200, specialty: "Buyer and investor guidance" },
    ],
  };
  return map[category];
}

function roadmapTemplate(category: IndustryCategory, minBudget: number): RoadmapStep[] {
  const launchCost = Math.max(500, Math.round(minBudget * 0.12));
  const setupCost = Math.max(700, Math.round(minBudget * 0.18));
  const scaleCost = Math.max(600, Math.round(minBudget * 0.15));
  return [
    { step: 1, title: "Market Validation", description: `Validate demand and niche for ${category} offering`, duration: "Week 1-2", cost: 0 },
    { step: 2, title: "Business Setup", description: "Register business, legal setup, and basic operations", duration: "Week 3-4", cost: setupCost },
    { step: 3, title: "Build Initial Offering", description: "Prepare MVP/product/service package for launch", duration: "Month 2", cost: launchCost },
    { step: 4, title: "Launch & Acquire First Customers", description: "Run launch campaign and onboard early users", duration: "Month 3", cost: launchCost },
    { step: 5, title: "Optimize Unit Economics", description: "Reduce costs and improve gross margin", duration: "Month 4-5", cost: 300 },
    { step: 6, title: "Scale Operations", description: "Expand distribution/channels and team capacity", duration: "Month 6-9", cost: scaleCost },
  ];
}

export function buildIndustryWithDefaults(suggestion: AIIndustrySuggestion): Industry {
  const category = detectCategory(suggestion.name);
  const minBudget = Math.max(1000, Number(suggestion.minBudget || 0));
  return {
    id: normalizeId(suggestion.name),
    name: suggestion.name,
    icon: suggestion.icon || "🏢",
    description: suggestion.description || "High-potential industry with scalable demand",
    minBudget,
    monthlyCostPerPerson: Math.max(300, Math.round(minBudget * 0.08)),
    expenses: expenseTemplate(category, minBudget),
    influencers: influencerTemplate(category),
    materials: materialTemplate(category),
    roadmap: roadmapTemplate(category, minBudget),
    resources: resourceTemplate(category),
  };
}

