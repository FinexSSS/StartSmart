import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  industries as staticIndustries,
  type Industry,
  type ExpenseItem,
  type Influencer,
  type Material,
  type RoadmapStep,
  type ResourceItem,
} from "@/data/industries";

function mapResourceType(
  t: string | null
): "equipment" | "service" | "software" | "personnel" {
  const v = (t ?? "").toLowerCase();
  if (v === "equipment" || v === "service" || v === "software" || v === "personnel")
    return v;
  return "equipment";
}

async function fetchIndustries(): Promise<Industry[]> {
  try {
    const { data: industriesRows, error: indError } = await supabase
      .from("industries")
      .select("*")
      .order("id");

    if (indError || !industriesRows?.length) return staticIndustries;

  const ids = industriesRows.map((r) => r.id);

  const [expRes, infRes, matRes, roadRes, resRes] = await Promise.all([
    supabase.from("industry_expenses").select("*").in("industry_id", ids),
    supabase.from("industry_influencers").select("*").in("industry_id", ids),
    supabase.from("industry_materials").select("*").in("industry_id", ids),
    supabase.from("industry_roadmap").select("*").in("industry_id", ids),
    supabase.from("industry_resources").select("*").in("industry_id", ids),
  ]);

  const expensesByIndustry = (expRes.data ?? []).reduce(
    (acc, row) => {
      const id = row.industry_id;
      if (!acc[id]) acc[id] = [];
      acc[id].push({
        category: row.category ?? "",
        amount: Number(row.amount ?? 0),
        description: row.description ?? "",
        isMonthly: row.is_monthly ?? false,
      });
      return acc;
    },
    {} as Record<string, ExpenseItem[]>
  );

  const influencersByIndustry = (infRes.data ?? []).reduce(
    (acc, row) => {
      const id = row.industry_id;
      if (!acc[id]) acc[id] = [];
      acc[id].push({
        name: row.name ?? "",
        platform: row.platform ?? "",
        followers: row.followers ?? "",
        charge: Number(row.charge ?? 0),
        specialty: row.specialty ?? "",
      });
      return acc;
    },
    {} as Record<string, Influencer[]>
  );

  const materialsByIndustry = (matRes.data ?? []).reduce(
    (acc, row) => {
      const id = row.industry_id;
      if (!acc[id]) acc[id] = [];
      acc[id].push({
        name: row.name ?? "",
        supplier: row.supplier ?? "",
        estimatedCost: Number(row.estimated_cost ?? 0),
        unit: row.unit ?? "",
        notes: row.notes ?? "",
      });
      return acc;
    },
    {} as Record<string, Material[]>
  );

  const roadmapByIndustry = (roadRes.data ?? []).reduce(
    (acc, row) => {
      const id = row.industry_id;
      if (!acc[id]) acc[id] = [];
      acc[id].push({
        step: row.step ?? 0,
        title: row.title ?? "",
        description: row.description ?? "",
        duration: row.duration ?? "",
        cost: Number(row.cost ?? 0),
      });
      return acc;
    },
    {} as Record<string, RoadmapStep[]>
  );

  const resourcesByIndustry = (resRes.data ?? []).reduce(
    (acc, row) => {
      const id = row.industry_id;
      if (!acc[id]) acc[id] = [];
      acc[id].push({
        name: row.name ?? "",
        type: mapResourceType(row.type),
        monthlyCost: Number(row.monthly_cost ?? 0),
        oneTimeCost: Number(row.one_time_cost ?? 0),
        description: row.description ?? "",
        essential: row.essential ?? false,
      });
      return acc;
    },
    {} as Record<string, ResourceItem[]>
  );

  return industriesRows.map((r) => ({
    id: r.id,
    name: r.name ?? "",
    icon: r.icon ?? "🏢",
    description: r.description ?? "",
    minBudget: Number(r.min_budget ?? 0),
    monthlyCostPerPerson: Number(r.monthly_cost_per_person ?? 0),
    expenses: expensesByIndustry[r.id] ?? [],
    influencers: influencersByIndustry[r.id] ?? [],
    materials: materialsByIndustry[r.id] ?? [],
    roadmap: (roadmapByIndustry[r.id] ?? []).sort((a, b) => a.step - b.step),
    resources: resourcesByIndustry[r.id] ?? [],
  }));
  } catch {
    return staticIndustries;
  }
}

export function useIndustries() {
  return useQuery({
    queryKey: ["industries"],
    queryFn: fetchIndustries,
    staleTime: 60 * 1000,
  });
}
