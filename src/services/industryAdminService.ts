import { supabase } from "@/integrations/supabase/client";
import type { Industry } from "@/data/industries";

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

    if (indError) return { ok: false, error: indError.message };

    await supabase.from("industry_expenses").delete().eq("industry_id", industry.id);
    if (industry.expenses.length > 0) {
      await supabase.from("industry_expenses").insert(
        industry.expenses.map((e) => ({
          industry_id: industry.id,
          category: e.category,
          amount: e.amount,
          description: e.description,
          is_monthly: e.isMonthly ?? false,
        }))
      );
    }

    await supabase.from("industry_influencers").delete().eq("industry_id", industry.id);
    if (industry.influencers.length > 0) {
      await supabase.from("industry_influencers").insert(
        industry.influencers.map((e) => ({
          industry_id: industry.id,
          name: e.name,
          platform: e.platform,
          followers: e.followers,
          charge: e.charge,
          specialty: e.specialty,
        }))
      );
    }

    await supabase.from("industry_materials").delete().eq("industry_id", industry.id);
    if (industry.materials.length > 0) {
      await supabase.from("industry_materials").insert(
        industry.materials.map((e) => ({
          industry_id: industry.id,
          name: e.name,
          supplier: e.supplier,
          estimated_cost: e.estimatedCost,
          unit: e.unit,
          notes: e.notes,
        }))
      );
    }

    await supabase.from("industry_roadmap").delete().eq("industry_id", industry.id);
    if (industry.roadmap.length > 0) {
      await supabase.from("industry_roadmap").insert(
        industry.roadmap.map((e) => ({
          industry_id: industry.id,
          step: e.step,
          title: e.title,
          description: e.description,
          duration: e.duration,
          cost: e.cost,
        }))
      );
    }

    await supabase.from("industry_resources").delete().eq("industry_id", industry.id);
    if (industry.resources.length > 0) {
      await supabase.from("industry_resources").insert(
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
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function deleteIndustryFromSupabase(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await supabase.from("industry_resources").delete().eq("industry_id", id);
    await supabase.from("industry_roadmap").delete().eq("industry_id", id);
    await supabase.from("industry_materials").delete().eq("industry_id", id);
    await supabase.from("industry_influencers").delete().eq("industry_id", id);
    await supabase.from("industry_expenses").delete().eq("industry_id", id);
    const { error } = await supabase.from("industries").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
