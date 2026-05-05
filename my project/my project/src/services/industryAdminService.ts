import { supabase } from "@/integrations/supabase/client";
import type { Industry } from "@/data/industries";
import { TOP_INDUSTRY_CATALOG } from "@/data/topIndustriesCatalog";
import { buildIndustryWithDefaults } from "@/data/industryTemplateEngine";

function toErrorMessage(error: unknown): string {
  if (!error) return "Unknown database error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Unknown database error";
}

function isRlsError(message?: string): boolean {
  const m = (message ?? "").toLowerCase();
  return m.includes("row-level security") || m.includes("violates row-level security policy");
}

async function saveIndustryViaEdgeFunction(industry: Industry): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { ok: false, error: "Missing authenticated session for industry save" };
    }
    const response = await fetch(`${supabaseUrl}/functions/v1/save-industry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ industry }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body?.success !== true) {
      return { ok: false, error: body?.error || `save-industry failed (${response.status})` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toErrorMessage(e) };
  }
}

export async function saveIndustryToSupabase(industry: Industry): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error: indError } = await supabase
      .from("industries")
      .upsert(
        {
          id: industry.id,
          name: industry.name,
          icon: industry.icon,
          description: industry.description,
          min_budget: industry.minBudget,
          monthly_cost_per_person: industry.monthlyCostPerPerson,
        },
        { onConflict: "id" }
      );

    if (indError) {
      if (isRlsError(indError.message)) {
        return saveIndustryViaEdgeFunction(industry);
      }
      return { ok: false, error: indError.message };
    }

    const { error: deleteExpensesError } = await supabase.from("industry_expenses").delete().eq("industry_id", industry.id);
    if (deleteExpensesError) {
      if (isRlsError(deleteExpensesError.message)) {
        return saveIndustryViaEdgeFunction(industry);
      }
      return { ok: false, error: deleteExpensesError.message };
    }
    if (industry.expenses.length > 0) {
      const { error: insertExpensesError } = await supabase.from("industry_expenses").insert(
        industry.expenses.map((e) => ({
          industry_id: industry.id,
          category: e.category,
          amount: e.amount,
          description: e.description,
          is_monthly: e.isMonthly ?? false,
        }))
      );
      if (insertExpensesError) {
        if (isRlsError(insertExpensesError.message)) {
          return saveIndustryViaEdgeFunction(industry);
        }
        return { ok: false, error: insertExpensesError.message };
      }
    }

    const { error: deleteInfluencersError } = await supabase.from("industry_influencers").delete().eq("industry_id", industry.id);
    if (deleteInfluencersError) {
      if (isRlsError(deleteInfluencersError.message)) {
        return saveIndustryViaEdgeFunction(industry);
      }
      return { ok: false, error: deleteInfluencersError.message };
    }
    if (industry.influencers.length > 0) {
      const { error: insertInfluencersError } = await supabase.from("industry_influencers").insert(
        industry.influencers.map((e) => ({
          industry_id: industry.id,
          name: e.name,
          platform: e.platform,
          followers: e.followers,
          charge: e.charge,
          specialty: e.specialty,
        }))
      );
      if (insertInfluencersError) {
        if (isRlsError(insertInfluencersError.message)) {
          return saveIndustryViaEdgeFunction(industry);
        }
        return { ok: false, error: insertInfluencersError.message };
      }
    }

    const { error: deleteMaterialsError } = await supabase.from("industry_materials").delete().eq("industry_id", industry.id);
    if (deleteMaterialsError) {
      if (isRlsError(deleteMaterialsError.message)) {
        return saveIndustryViaEdgeFunction(industry);
      }
      return { ok: false, error: deleteMaterialsError.message };
    }
    if (industry.materials.length > 0) {
      const { error: insertMaterialsError } = await supabase.from("industry_materials").insert(
        industry.materials.map((e) => ({
          industry_id: industry.id,
          name: e.name,
          supplier: e.supplier,
          estimated_cost: e.estimatedCost,
          unit: e.unit,
          notes: e.notes,
        }))
      );
      if (insertMaterialsError) {
        if (isRlsError(insertMaterialsError.message)) {
          return saveIndustryViaEdgeFunction(industry);
        }
        return { ok: false, error: insertMaterialsError.message };
      }
    }

    const { error: deleteRoadmapError } = await supabase.from("industry_roadmap").delete().eq("industry_id", industry.id);
    if (deleteRoadmapError) {
      if (isRlsError(deleteRoadmapError.message)) {
        return saveIndustryViaEdgeFunction(industry);
      }
      return { ok: false, error: deleteRoadmapError.message };
    }
    if (industry.roadmap.length > 0) {
      const { error: insertRoadmapError } = await supabase.from("industry_roadmap").insert(
        industry.roadmap.map((e) => ({
          industry_id: industry.id,
          step: e.step,
          title: e.title,
          description: e.description,
          duration: e.duration,
          cost: e.cost,
        }))
      );
      if (insertRoadmapError) {
        if (isRlsError(insertRoadmapError.message)) {
          return saveIndustryViaEdgeFunction(industry);
        }
        return { ok: false, error: insertRoadmapError.message };
      }
    }

    const { error: deleteResourcesError } = await supabase.from("industry_resources").delete().eq("industry_id", industry.id);
    if (deleteResourcesError) {
      if (isRlsError(deleteResourcesError.message)) {
        return saveIndustryViaEdgeFunction(industry);
      }
      return { ok: false, error: deleteResourcesError.message };
    }
    if (industry.resources.length > 0) {
      const { error: insertResourcesError } = await supabase.from("industry_resources").insert(
        industry.resources.map((e) => ({
          industry_id: industry.id,
          name: e.name,
          type: e.type,
          monthly_cost: e.monthlyCost,
          one_time_cost: e.oneTimeCost,
          description: e.description,
          essential: e.essential,
        }))
      );
      if (insertResourcesError) {
        if (isRlsError(insertResourcesError.message)) {
          return saveIndustryViaEdgeFunction(industry);
        }
        return { ok: false, error: insertResourcesError.message };
      }
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: toErrorMessage(e) };
  }
}

export async function deleteIndustryFromSupabase(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error: resourcesDeleteError } = await supabase.from("industry_resources").delete().eq("industry_id", id);
    if (resourcesDeleteError) return { ok: false, error: resourcesDeleteError.message };
    const { error: roadmapDeleteError } = await supabase.from("industry_roadmap").delete().eq("industry_id", id);
    if (roadmapDeleteError) return { ok: false, error: roadmapDeleteError.message };
    const { error: materialsDeleteError } = await supabase.from("industry_materials").delete().eq("industry_id", id);
    if (materialsDeleteError) return { ok: false, error: materialsDeleteError.message };
    const { error: influencersDeleteError } = await supabase.from("industry_influencers").delete().eq("industry_id", id);
    if (influencersDeleteError) return { ok: false, error: influencersDeleteError.message };
    const { error: expensesDeleteError } = await supabase.from("industry_expenses").delete().eq("industry_id", id);
    if (expensesDeleteError) return { ok: false, error: expensesDeleteError.message };
    const { error } = await supabase.from("industries").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toErrorMessage(e) };
  }
}

export async function seedTopIndustriesToSupabase(): Promise<{
  ok: boolean;
  error?: string;
  count?: number;
  failed?: number;
}> {
  try {
    const top100 = TOP_INDUSTRY_CATALOG.slice(0, 100);
    let successCount = 0;
    let failedCount = 0;
    let firstError = "";

    for (const item of top100) {
      const result = await saveIndustryToSupabase(buildIndustryWithDefaults(item));

      if (result.ok) {
        successCount += 1;
      } else {
        failedCount += 1;
        if (!firstError) firstError = result.error || "Unknown save error";
      }
    }

    if (successCount === 0) {
      return { ok: false, error: firstError || "Failed to seed top industries", count: 0, failed: failedCount };
    }

    return { ok: true, count: successCount, failed: failedCount };
  } catch (e) {
    return { ok: false, error: toErrorMessage(e) };
  }
}
