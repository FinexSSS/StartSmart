-- AI cache and settings (run after initial_schema.sql)

-- Cache for AI calculation results (keyed by input hash to avoid repeated API calls)
CREATE TABLE IF NOT EXISTS public.ai_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_hash TEXT NOT NULL UNIQUE,
  calculation_type TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_calculations ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read/write their own cache (we use a simple policy: any authenticated user can read/write for now; optional: add user_id column and restrict)
CREATE POLICY "Authenticated users can read ai_calculations" ON ai_calculations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert ai_calculations" ON ai_calculations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update ai_calculations" ON ai_calculations FOR UPDATE TO authenticated USING (true);

-- Seed default AI feature flags in admin_settings (admins can override via UI)
INSERT INTO public.admin_settings (key, value) VALUES
  ('ai_features', '{"feasibility": false, "swot": false, "risk": false, "recommendations": false, "breakeven": false, "marketing": false, "influencer": false, "business_plan": false}'::jsonb),
  ('ai_model_default', '"gpt-4o-mini"'::jsonb)
ON CONFLICT (key) DO NOTHING;
