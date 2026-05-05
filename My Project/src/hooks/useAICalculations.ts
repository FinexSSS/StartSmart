import { useState, useCallback, useEffect } from "react";
import { calculateFeasibility } from "@/data/industries";
import type { Industry } from "@/data/industries";
import { useAuth } from "@/context/AuthContext";
import {
  getAIFeatures,
  fetchAIFeasibility,
  fetchAISwot,
  fetchAIRisk,
  type AIFeasibilityResult,
  type AISwotResult,
  type AIRiskResult,
  type AIRiskItem,
} from "@/services/aiService";

export interface FeasibilityResult {
  totalExpenses: number;
  oneTimeExpenses: number;
  monthlyBurn: number;
  totalMonthly: number;
  isFeasible: boolean;
  budgetGap: number;
  surplus: number;
  estimatedProfit: number;
  feasibilityScore: number;
  runway: number;
  riskLevel?: "Low" | "Medium" | "High";
  aiRecommendations?: string[];
}

export function useFeasibilityWithAI(
  budget: number,
  selectedIndustry: Industry | null,
  teamSize: number,
  monthsToRun: number
) {
  const { user } = useAuth();
  const formulaResult = selectedIndustry && budget > 0
    ? calculateFeasibility(budget, selectedIndustry, teamSize, monthsToRun)
    : null;

  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOverrides, setAiOverrides] = useState<Partial<AIFeasibilityResult> | null>(null);

  useEffect(() => {
    getAIFeatures().then((f) => setAiEnabled(!!f.feasibility));
  }, []);

  const fetchAI = useCallback(async () => {
    if (!formulaResult || !selectedIndustry || !aiEnabled) return;
    setAiLoading(true);
    setAiOverrides(null);
    try {
      const result = await fetchAIFeasibility({
        budget,
        industryName: selectedIndustry.name,
        industryId: selectedIndustry.id,
        teamSize,
        monthsToRun,
        totalExpenses: formulaResult.totalExpenses,
        oneTimeExpenses: formulaResult.oneTimeExpenses,
        monthlyBurn: formulaResult.monthlyBurn,
        feasibilityScore: formulaResult.feasibilityScore,
        runway: formulaResult.runway,
        industryDescription: selectedIndustry.description,
      }, user);
      setAiOverrides(result);
    } catch {
      setAiOverrides(null);
    } finally {
      setAiLoading(false);
    }
  }, [aiEnabled, budget, selectedIndustry, teamSize, monthsToRun, formulaResult, user]);

  useEffect(() => {
    if (aiEnabled && formulaResult && selectedIndustry) fetchAI();
  }, [aiEnabled, selectedIndustry?.id, budget, teamSize, monthsToRun, fetchAI]);

  const result: FeasibilityResult | null = formulaResult
    ? {
      ...formulaResult,
      ...(aiOverrides?.feasibilityScore !== undefined && { feasibilityScore: aiOverrides.feasibilityScore }),
      ...(aiOverrides?.estimatedProfit !== undefined && { estimatedProfit: aiOverrides.estimatedProfit }),
      riskLevel: aiOverrides?.riskLevel,
      aiRecommendations: aiOverrides?.recommendations,
    }
    : null;

  return { result, aiLoading, aiEnabled, refetchAI: fetchAI };
}

export interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

const fallbackSwot: Record<string, SwotData> = {
  clothing: {
    strengths: ["Low barrier to entry", "High creative expression", "Scalable e-commerce model", "Strong social media marketing potential"],
    weaknesses: ["High competition", "Seasonal demand fluctuation", "Inventory management complexity", "Thin profit margins initially"],
    opportunities: ["Sustainable fashion trend", "Direct-to-consumer growth", "International market access", "Influencer collaboration potential"],
    threats: ["Fast fashion dominance", "Supply chain disruptions", "Changing consumer preferences", "Economic downturn impact"],
  },
  food: {
    strengths: ["Essential industry (constant demand)", "Multiple revenue streams", "High customer loyalty potential", "Local community engagement"],
    weaknesses: ["High operational costs", "Perishable inventory", "Strict regulatory requirements", "Labor-intensive operations"],
    opportunities: ["Health-conscious food trends", "Delivery platform growth", "Ghost kitchen model", "Specialty/niche cuisine markets"],
    threats: ["Food safety incidents", "Rising ingredient costs", "Intense local competition", "Changing dietary trends"],
  },
  youtube: {
    strengths: ["Very low startup costs", "Global audience reach", "Multiple monetization options", "Flexible work schedule"],
    weaknesses: ["Unpredictable income", "Algorithm dependency", "Content burnout risk", "Long time to monetization"],
    opportunities: ["Growing video consumption", "Brand sponsorship market", "Course/merchandise sales", "Cross-platform expansion"],
    threats: ["Platform policy changes", "Copyright issues", "Market saturation", "Ad revenue fluctuation"],
  },
  cosmetics: {
    strengths: ["High profit margins", "Strong brand loyalty", "Recurring purchase behavior", "Social media driven sales"],
    weaknesses: ["Regulatory compliance costs", "Long development cycles", "Product liability risks", "High marketing spend required"],
    opportunities: ["Clean beauty movement", "Men's grooming market growth", "Personalization trends", "Subscription box models"],
    threats: ["Counterfeit products", "Ingredient regulation changes", "Large competitor dominance", "Allergic reaction liability"],
  },
  tech: {
    strengths: ["Highly scalable", "Recurring revenue (SaaS)", "Low marginal cost", "Remote team capability"],
    weaknesses: ["High development costs", "Long sales cycles", "Technical talent scarcity", "Customer acquisition cost"],
    opportunities: ["AI/ML integration", "Enterprise digitization", "API economy growth", "Global market access"],
    threats: ["Rapid technology changes", "Cybersecurity risks", "Large tech company competition", "Regulatory compliance (GDPR, etc.)"],
  },
};

export function useSwotWithAI(selectedIndustry: Industry | null) {
  const { user } = useAuth();
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSwot, setAiSwot] = useState<AISwotResult | null>(null);

  useEffect(() => {
    getAIFeatures().then((f) => setAiEnabled(!!f.swot));
  }, []);

  useEffect(() => {
    if (!selectedIndustry || !aiEnabled) {
      setAiSwot(null);
      return;
    }
    setAiLoading(true);
    setAiSwot(null);
    fetchAISwot({
      industryName: selectedIndustry.name,
      industryId: selectedIndustry.id,
      industryDescription: selectedIndustry.description
    }, user)
      .then(setAiSwot)
      .catch(() => setAiSwot(null))
      .finally(() => setAiLoading(false));
  }, [aiEnabled, selectedIndustry?.id, selectedIndustry?.name, user]);

  const swot: SwotData = selectedIndustry
    ? (aiSwot ?? fallbackSwot[selectedIndustry.id] ?? fallbackSwot.tech)
    : { strengths: [], weaknesses: [], opportunities: [], threats: [] };

  return { swot, aiLoading, aiEnabled };
}

export interface RiskItem {
  category: string;
  icon?: React.ComponentType<{ className?: string }>;
  level: "High" | "Medium" | "Low";
  description: string;
  mitigation: string;
}

export function useRiskWithAI(
  budget: number,
  selectedIndustry: Industry | null,
  teamSize: number,
  monthsToRun: number
) {
  const { user } = useAuth();
  const formulaResult = selectedIndustry && budget > 0
    ? calculateFeasibility(budget, selectedIndustry, teamSize, monthsToRun)
    : null;

  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRisks, setAiRisks] = useState<AIRiskItem[] | null>(null);

  useEffect(() => {
    getAIFeatures().then((f) => setAiEnabled(!!f.risk));
  }, []);

  useEffect(() => {
    if (!formulaResult || !selectedIndustry || !aiEnabled) {
      setAiRisks(null);
      return;
    }
    setAiLoading(true);
    setAiRisks(null);
    fetchAIRisk({
      budget,
      industryName: selectedIndustry.name,
      teamSize,
      monthsToRun,
      feasibilityScore: formulaResult.feasibilityScore,
      runway: formulaResult.runway,
      monthlyBurn: formulaResult.monthlyBurn,
      industryDescription: selectedIndustry.description,
    }, user)
      .then((r) => setAiRisks(r.risks || []))
      .catch(() => setAiRisks(null))
      .finally(() => setAiLoading(false));
  }, [aiEnabled, budget, selectedIndustry?.id, selectedIndustry?.name, teamSize, monthsToRun, user, formulaResult]);

  const risks: RiskItem[] | null = formulaResult && selectedIndustry ? (aiRisks ?? null) : null;

  return { formulaResult, risks: aiRisks ? aiRisks.map((r) => ({ category: r.category, level: r.level, description: r.description, mitigation: r.mitigation })) : null, aiLoading, aiEnabled };
}
