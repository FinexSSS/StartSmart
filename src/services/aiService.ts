import { supabase } from "@/integrations/supabase/client";
import * as openRouter from "./openrouterService";

export type AIFeatureKey = "feasibility" | "swot" | "risk" | "recommendations" | "breakeven" | "marketing" | "influencer" | "business_plan" | "roadmap";

export interface AIFeaturesConfig {
  feasibility?: boolean;
  swot?: boolean;
  risk?: boolean;
  recommendations?: boolean;
  breakeven?: boolean;
  marketing?: boolean;
  influencer?: boolean;
  business_plan?: boolean;
  roadmap?: boolean;
}

export interface AIFeasibilityResult {
  feasibilityScore?: number;
  estimatedProfit?: number;
  breakEvenMonth?: number;
  riskLevel?: "Low" | "Medium" | "High";
  recommendations?: string[];
}

export interface AISwotResult {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface AIRiskItem {
  category: string;
  score?: number;
  level: "High" | "Medium" | "Low";
  description: string;
  mitigation: string;
}

export interface AIRiskResult {
  risks: AIRiskItem[];
}

export interface AIRoadmapResult {
  roadmap: {
    step: number;
    title: string;
    description: string;
    duration: string;
    cost: number;
  }[];
}

export interface AIBusinessPlanResult {
  executiveSummary: string;
  marketAnalysis: string;
  financialPlan: string;
  marketingStrategy: string;
  operationalPlan: string;
}

// --- Prompt Builders ---

function buildFeasibilityPrompt(input: any, userProfile?: any): string {
  const context = userProfile ? `User is located in ${userProfile.region}. ` : "";
  return `You are a startup feasibility analyst. ${context}${input.industryDescription ? `Market Context: ${input.industryDescription}` : ""} 
  CRITICAL: Use your web search capabilities to find REAL-TIME 2026 data for this industry and region.
  Based on the following data, provide a brief JSON object with:
  - "feasibilityScore" (number 0-100): adjust or confirm the viability score considering current 2026 market conditions.
  - "estimatedProfit" (number): realistic profit estimate in USD.
  - "breakEvenMonth" (number): estimated month to break even.
  - "riskLevel" ("Low"|"Medium"|"High"): overall risk level.
  - "recommendations" (string[]): 2-4 short actionable recommendations.

  Data: Budget $${input.budget}, Industry: ${input.industryName}, Team: ${input.teamSize}, Months: ${input.monthsToRun}. Total expenses: $${input.totalExpenses}, One-time: $${input.oneTimeExpenses}, Monthly burn: $${input.monthlyBurn}. Current formula score: ${input.feasibilityScore}%, Runway: ${input.runway} months.
  Reply with only valid JSON, no markdown.`;
}

function buildSwotPrompt(input: any, userProfile?: any): string {
  const context = userProfile ? `User is located in ${userProfile.region}. ` : "";
  return `You are a business strategist. ${context}${input.industryDescription ? `Market Context: ${input.industryDescription}` : ""} 
  CRITICAL: Use your web search capabilities for REAL-TIME 2026 market intelligence.
  For the "${input.industryName}" industry, provide a SWOT analysis as JSON:
  - "strengths" (string[]): 4-5 internal strengths.
  - "weaknesses" (string[]): 4-5 internal weaknesses.
  - "opportunities" (string[]): 4-5 external opportunities.
  - "threats" (string[]): 4-5 external threats.

  Reply with only valid JSON, no markdown.`;
}

function buildRiskPrompt(input: any, userProfile?: any): string {
  const context = userProfile ? `User is located in ${userProfile.region}. ` : "";
  return `You are a startup risk analyst. ${context}${input.industryDescription ? `Market Context: ${input.industryDescription}` : ""} 
  CRITICAL: Use web search for REAL-TIME 2026 economic and industry risks in this region.
  For a venture with budget $${input.budget}, industry ${input.industryName}, team size ${input.teamSize}, run ${input.monthsToRun} months, feasibility score ${input.feasibilityScore}%, runway ${input.runway} months, monthly burn $${input.monthlyBurn}, provide a JSON array "risks" of 4-6 risk objects, each with:
  - "category" (string): e.g. "Capital Limitation", "Market Competition".
  - "score" (number 0-100): risk severity.
  - "level" ("High"|"Medium"|"Low").
  - "description" (string): one sentence.
  - "mitigation" (string): one sentence advice.

  Reply with only valid JSON: {"risks": [...]}, no markdown.`;
}

function buildRoadmapPrompt(input: any, userProfile?: any): string {
  const context = userProfile ? `User is located in ${userProfile.region}. ` : "";
  return `You are a startup consultant. ${context}${input.industryDescription ? `Market Context: ${input.industryDescription}` : ""} 
  CRITICAL: Use web search for REAL-TIME 2026 startup execution steps and costs.
  For a startup in the "${input.industryName}" industry with a budget of $${input.budget}, create a detailed step-by-step roadmap for the first ${input.monthsToRun} months. Provide a JSON object with a "roadmap" array of 5-8 steps, each with:
  - "step" (number): step number.
  - "title" (string): short title of the step.
  - "description" (string): brief description of what to do.
  - "duration" (string): estimated duration (e.g., "Week 1-2").
  - "cost" (number): estimated cost for this step.

  Reply with only valid JSON: {"roadmap": [...]}, no markdown.`;
}

function buildBusinessPlanPrompt(input: any, userProfile?: any): string {
  const context = userProfile ? `User is located in ${userProfile.region}. ` : "";
  return `You are an expert business plan writer. ${context}${input.industryDescription ? `Market Context: ${input.industryDescription}` : ""} 
  CRITICAL: Use web search for REAL-TIME 2026 market data and competitor landscapes.
  For a startup in the "${input.industryName}" industry with a budget of $${input.budget}, generate a comprehensive business plan executive summary as JSON:
  - "executiveSummary" (string): A short overview of the business.
  - "marketAnalysis" (string): Insights into target market and competition.
  - "financialPlan" (string): Overview of financial strategy and goals.
  - "marketingStrategy" (string): How to acquire customers.
  - "operationalPlan" (string): Daily operations and management structure.

  Reply with only valid JSON, no markdown.`;
}

function buildInfluencerTipsPrompt(industryName: string, userProfile?: any): string {
  const context = userProfile ? `User is located in ${userProfile.region}. ` : "";
  return `You are a startup influencer marketing expert. ${context}
  CRITICAL: Use web search to find REAL-TIME 2026 trending collaboration platforms and strategies in this region and industry.
  For a startup in the "${industryName}" industry, provide a JSON object with:
  - "generalStrategy" (string): 2-3 sentences on the best approach for this niche.
  - "platformFocus" (string[]): Top 2-3 social platforms to focus on.
  - "collaborationIdeas" (string[]): 3-4 creative ways to work with influencers in this niche.
  - "genuineTips" (string[]): 3-4 inside tips for authentic engagement and cost-saving.

  Reply with only valid JSON, no markdown.`;
}

function buildIndustryDataPrompt(industryName: string, budget: number, userProfile?: any): string {
  const context = userProfile ? `The user "${userProfile.firstName} ${userProfile.lastName}" is starting this venture in ${userProfile.region}. ` : "";
  return `You are a market research analyst. ${context}
  CRITICAL: Use your web search capabilities for REAL-TIME 2026 data. 
  Find GENUINE, REAL-WORLD information for the "${industryName}" industry in this region.
  Provide a comprehensive dataset as JSON:
  - "description" (string): Current, realistic market overview for 2026.
  - "minBudget" (number): Realistic minimum budget based on 2026 market rates in this region.
  - "monthlyCostPerPerson" (number): Realistic average monthly salary in this region/niche.
  - "expenses" (array of {category: string, amount: number, description: string, isMonthly: boolean}): 5-8 genuine line items based on 2026 pricing.
  - "resources" (array of {name: string, type: string, monthlyCost: number, oneTimeCost: number, description: string, essential: boolean}): 5-8 REAL tools or services (e.g., specific SaaS names) with 2026 pricing.
  - "materials" (array of {name: string, supplier: string, estimatedCost: number, unit: string, notes: string}): 3-5 key raw materials with REAL supplier categories.
  - "influencers" (array of {name: string, platform: string, followers: string, charge: number, specialty: string}): 3-5 GENUINE, REAL influencers (provide their real names or handles) relevant to this niche and region with their REAL estimated rates.
  - "marketingChannels" (array of {channel: string, percentage: number, description: string}): 4-6 REAL marketing channels with 2026 budget allocations.
  - "roadmap" (array of {step: number, title: string, description: string, duration: string, cost: number}): 5-8 steps for a 12-month timeline.

  Reply with only valid JSON, no markdown.`;
}

function buildIndustrySuggestionsPrompt(budget: number, userProfile?: any): string {
  const profileContext = userProfile
    ? `The user is ${userProfile.firstName} ${userProfile.lastName}, located in the ${userProfile.region || 'unspecified'} region.`
    : "The user's location is unspecified.";

  return `You are a strategic business consultant and market expert.
${profileContext}
The user has a startup budget of $${budget.toLocaleString()}.

Your task is to suggest 5 GENUINE, profitable industry sectors or business ideas that are currently viable in 2026 for this budget and region.
Use your WEB SEARCH capabilities to ensure these are currently trending and realistic.

Return a JSON object with a "suggestions" key containing an array of 5 objects:
{
  "suggestions": [
    {
      "name": "Industry Name",
      "icon": "Emoji",
      "description": "Brief description of why this is viable in 2026",
      "minBudget": 5000
    }
  ]
}
Reply with only valid JSON, no markdown.`;
}

// --- End Prompt Builders ---

let cachedFeatures: AIFeaturesConfig | null = null;

export async function getAIFeatures(): Promise<AIFeaturesConfig> {
  if (cachedFeatures) return cachedFeatures;
  try {
    const { data } = await supabase.from("admin_settings").select("value").eq("key", "ai_features").maybeSingle();
    if (data?.value && typeof data.value === "object") {
      cachedFeatures = data.value as AIFeaturesConfig;
      return cachedFeatures;
    }
  } catch {
    // ignore
  }
  cachedFeatures = {};
  return cachedFeatures;
}

export function clearAIFeaturesCache() {
  cachedFeatures = null;
}

function extractJson(text: string): string {
  try {
    // Try to find JSON block between backticks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      return match[1].trim();
    }

    // Fallback: Find anything that looks like a JSON object or array
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    const start = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;

    if (start !== -1) {
      const lastBrace = text.lastIndexOf('}');
      const lastBracket = text.lastIndexOf(']');
      const end = (lastBrace !== -1 && (lastBracket === -1 || lastBrace > lastBracket)) ? lastBrace : lastBracket;

      if (end !== -1 && end > start) {
        return text.substring(start, end + 1).trim();
      }
    }

    return text.trim();
  } catch {
    return text.trim();
  }
}

async function invokeAI<T>(type: string, input: any, userProfile?: any): Promise<T> {
  let prompt = "";
  switch (type) {
    case "feasibility":
      prompt = buildFeasibilityPrompt(input, userProfile);
      break;
    case "swot":
      prompt = buildSwotPrompt(input, userProfile);
      break;
    case "risk":
      prompt = buildRiskPrompt(input, userProfile);
      break;
    case "roadmap":
      prompt = buildRoadmapPrompt(input, userProfile);
      break;
    case "business_plan":
      prompt = buildBusinessPlanPrompt(input, userProfile);
      break;
    case "influencer_tips":
      prompt = buildInfluencerTipsPrompt(input.industryName, userProfile);
      break;
    case "industry_enhancement":
      prompt = buildIndustryDataPrompt(input.industryName, input.budget, userProfile);
      break;
    case "industry_suggestions":
      prompt = buildIndustrySuggestionsPrompt(input.budget, userProfile);
      break;
    default:
      throw new Error(`Unknown AI type: ${type}`);
  }

  try {
    const raw = await openRouter.callOpenRouter(prompt);
    const clean = extractJson(raw);
    return JSON.parse(clean) as T;
  } catch (error) {
    console.error("OpenRouter AI failed:", error);
    throw error;
  }
}

export interface AIIndustrySuggestion {
  name: string;
  icon: string;
  description: string;
  minBudget: number;
}

export async function fetchAIIndustrySuggestions(budget: number, userProfile?: any): Promise<AIIndustrySuggestion[]> {
  const result = await invokeAI<{ suggestions: AIIndustrySuggestion[] }>("industry_suggestions", { budget }, userProfile);
  return result.suggestions;
}

export async function fetchAIFeasibility(input: {
  budget: number;
  industryName: string;
  industryId: string;
  teamSize: number;
  monthsToRun: number;
  totalExpenses: number;
  oneTimeExpenses: number;
  monthlyBurn: number;
  feasibilityScore: number;
  runway: number;
  industryDescription?: string;
}, userProfile?: any): Promise<AIFeasibilityResult> {
  return invokeAI<AIFeasibilityResult>("feasibility", input, userProfile);
}

export async function fetchAISwot(input: { industryName: string; industryId: string; industryDescription?: string }, userProfile?: any): Promise<AISwotResult> {
  return invokeAI<AISwotResult>("swot", input, userProfile);
}

export async function fetchAIRisk(input: {
  budget: number;
  industryName: string;
  teamSize: number;
  monthsToRun: number;
  feasibilityScore: number;
  runway: number;
  monthlyBurn: number;
  industryDescription?: string;
}, userProfile?: any): Promise<AIRiskResult> {
  return invokeAI<AIRiskResult>("risk", input, userProfile);
}

export async function fetchAIRoadmap(input: {
  industryName: string;
  budget: number;
  monthsToRun: number;
  industryDescription?: string;
}, userProfile?: any): Promise<AIRoadmapResult> {
  return invokeAI<AIRoadmapResult>("roadmap", input, userProfile);
}

export async function fetchAIBusinessPlan(input: {
  industryName: string;
  budget: number;
  industryDescription?: string;
}, userProfile?: any): Promise<AIBusinessPlanResult> {
  return invokeAI<AIBusinessPlanResult>("business_plan", input, userProfile);
}

export interface AIInfluencerTipsResult {
  generalStrategy: string;
  platformFocus: string[];
  collaborationIdeas: string[];
  genuineTips: string[];
}

export async function fetchAIInfluencerTips(industryName: string, userProfile?: any): Promise<AIInfluencerTipsResult> {
  return invokeAI<AIInfluencerTipsResult>("influencer_tips", { industryName }, userProfile);
}

export interface AIIndustryEnhancementResult {
  description: string;
  minBudget: number;
  monthlyCostPerPerson: number;
  expenses: any[];
  resources: any[];
  materials: any[];
  influencers: any[];
  marketingChannels: { channel: string; percentage: number; description: string }[];
  roadmap: { step: number; title: string; description: string; duration: string; cost: number }[];
}

export async function fetchAIIndustryEnhancement(industryName: string, budget: number, userProfile?: any): Promise<AIIndustryEnhancementResult> {
  return invokeAI<AIIndustryEnhancementResult>("industry_enhancement", { industryName, budget }, userProfile);
}

