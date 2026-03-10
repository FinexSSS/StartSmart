import "jsr:@supabase/functionsjs/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CalculationType = "feasibility" | "swot" | "risk";

interface FeasibilityInput {
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
}

interface SwotInput {
  industryName: string;
  industryId: string;
}

interface RiskInput {
  budget: number;
  industryName: string;
  teamSize: number;
  monthsToRun: number;
  feasibilityScore: number;
  runway: number;
  monthlyBurn: number;
}

function buildFeasibilityPrompt(input: FeasibilityInput): string {
  return `You are a startup feasibility analyst. Based on the following data, provide a brief JSON object with:
- "feasibilityScore" (number 0-100): adjust or confirm the viability score considering market conditions.
- "estimatedProfit" (number): realistic profit estimate in USD.
- "breakEvenMonth" (number): estimated month to break even.
- "riskLevel" ("Low"|"Medium"|"High"): overall risk level.
- "recommendations" (string[]): 2-4 short actionable recommendations.

Data: Budget $${input.budget}, Industry: ${input.industryName}, Team: ${input.teamSize}, Months: ${input.monthsToRun}. Total expenses: $${input.totalExpenses}, One-time: $${input.oneTimeExpenses}, Monthly burn: $${input.monthlyBurn}. Current formula score: ${input.feasibilityScore}%, Runway: ${input.runway} months.
Reply with only valid JSON, no markdown.`;
}

function buildSwotPrompt(input: SwotInput): string {
  return `You are a business strategist. For the "${input.industryName}" industry, provide a SWOT analysis as JSON:
- "strengths" (string[]): 4-5 internal strengths.
- "weaknesses" (string[]): 4-5 internal weaknesses.
- "opportunities" (string[]): 4-5 external opportunities.
- "threats" (string[]): 4-5 external threats.

Reply with only valid JSON, no markdown or code block.`;
}

function buildRiskPrompt(input: RiskInput): string {
  return `You are a startup risk analyst. For a venture with budget $${input.budget}, industry ${input.industryName}, team size ${input.teamSize}, run ${input.monthsToRun} months, feasibility score ${input.feasibilityScore}%, runway ${input.runway} months, monthly burn $${input.monthlyBurn}, provide a JSON array "risks" of 4-6 risk objects, each with:
- "category" (string): e.g. "Capital Limitation", "Market Competition".
- "score" (number 0-100): risk severity.
- "level" ("High"|"Medium"|"Low").
- "description" (string): one sentence.
- "mitigation" (string): one sentence advice.

Reply with only valid JSON: {"risks": [...]}, no markdown.`;
}

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI: ${res.status} ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from OpenAI");
  return content;
}

function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned) as T;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const type = body?.type as CalculationType;
    const input = body?.input ?? {};

    if (!type || !["feasibility", "swot", "risk"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid type. Use feasibility, swot, or risk." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let prompt: string;
    if (type === "feasibility") prompt = buildFeasibilityPrompt(input as FeasibilityInput);
    else if (type === "swot") prompt = buildSwotPrompt(input as SwotInput);
    else prompt = buildRiskPrompt(input as RiskInput);

    const raw = await callOpenAI(prompt);
    const result = parseJson(raw);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "AI calculation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
