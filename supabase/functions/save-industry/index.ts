import "jsr:@supabase/functionsjs/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type IndustryPayload = {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  minBudget?: number;
  monthlyCostPerPerson?: number;
  expenses?: Array<{
    category?: string;
    amount?: number;
    description?: string;
    isMonthly?: boolean;
  }>;
  influencers?: Array<{
    name?: string;
    platform?: string;
    followers?: string;
    charge?: number;
    specialty?: string;
  }>;
  materials?: Array<{
    name?: string;
    supplier?: string;
    estimatedCost?: number;
    unit?: string;
    notes?: string;
  }>;
  roadmap?: Array<{
    step?: number;
    title?: string;
    description?: string;
    duration?: string;
    cost?: number;
  }>;
  resources?: Array<{
    name?: string;
    type?: string;
    monthlyCost?: number;
    oneTimeCost?: number;
    description?: string;
    essential?: boolean;
  }>;
};

function toNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toBool(v: unknown): boolean {
  return Boolean(v);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const industry = body?.industry as IndustryPayload | undefined;
    if (!industry?.id || !industry?.name) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid industry payload: id and name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Server misconfiguration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceKey
    );

    const { error: indError } = await supabaseAdmin
      .from("industries")
      .upsert(
        {
          id: industry.id,
          name: industry.name,
          icon: industry.icon ?? "🏢",
          description: industry.description ?? "",
          min_budget: toNum(industry.minBudget),
          monthly_cost_per_person: toNum(industry.monthlyCostPerPerson),
        },
        { onConflict: "id" }
      );
    if (indError) throw indError;

    await supabaseAdmin.from("industry_expenses").delete().eq("industry_id", industry.id);
    if ((industry.expenses ?? []).length > 0) {
      const { error } = await supabaseAdmin.from("industry_expenses").insert(
        (industry.expenses ?? []).map((e) => ({
          industry_id: industry.id,
          category: e.category ?? "",
          amount: toNum(e.amount),
          description: e.description ?? "",
          is_monthly: toBool(e.isMonthly),
        }))
      );
      if (error) throw error;
    }

    await supabaseAdmin.from("industry_influencers").delete().eq("industry_id", industry.id);
    if ((industry.influencers ?? []).length > 0) {
      const { error } = await supabaseAdmin.from("industry_influencers").insert(
        (industry.influencers ?? []).map((e) => ({
          industry_id: industry.id,
          name: e.name ?? "",
          platform: e.platform ?? "",
          followers: e.followers ?? "",
          charge: toNum(e.charge),
          specialty: e.specialty ?? "",
        }))
      );
      if (error) throw error;
    }

    await supabaseAdmin.from("industry_materials").delete().eq("industry_id", industry.id);
    if ((industry.materials ?? []).length > 0) {
      const { error } = await supabaseAdmin.from("industry_materials").insert(
        (industry.materials ?? []).map((e) => ({
          industry_id: industry.id,
          name: e.name ?? "",
          supplier: e.supplier ?? "",
          estimated_cost: toNum(e.estimatedCost),
          unit: e.unit ?? "",
          notes: e.notes ?? "",
        }))
      );
      if (error) throw error;
    }

    await supabaseAdmin.from("industry_roadmap").delete().eq("industry_id", industry.id);
    if ((industry.roadmap ?? []).length > 0) {
      const { error } = await supabaseAdmin.from("industry_roadmap").insert(
        (industry.roadmap ?? []).map((e, idx) => ({
          industry_id: industry.id,
          step: Number.isFinite(Number(e.step)) ? Number(e.step) : idx + 1,
          title: e.title ?? "",
          description: e.description ?? "",
          duration: e.duration ?? "",
          cost: toNum(e.cost),
        }))
      );
      if (error) throw error;
    }

    await supabaseAdmin.from("industry_resources").delete().eq("industry_id", industry.id);
    if ((industry.resources ?? []).length > 0) {
      const { error } = await supabaseAdmin.from("industry_resources").insert(
        (industry.resources ?? []).map((e) => ({
          industry_id: industry.id,
          name: e.name ?? "",
          type: e.type ?? "equipment",
          monthly_cost: toNum(e.monthlyCost),
          one_time_cost: toNum(e.oneTimeCost),
          description: e.description ?? "",
          essential: toBool(e.essential),
        }))
      );
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

