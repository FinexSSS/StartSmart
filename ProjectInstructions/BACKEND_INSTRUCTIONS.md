# StartSmart — Backend & AI Implementation Guide

Complete step-by-step plan for converting StartSmart from a frontend-only app to a full-stack AI-powered platform.

> **📂 Location:** `ProjectInstructions/BACKEND_INSTRUCTIONS.md` — root level, same level as `src/`, `public/`, `package.json`. In Lovable's Code tab, scroll above `src/` to find the `ProjectInstructions` folder.

---

## Architecture Overview

**Recommended Stack:**
- **Database**: PostgreSQL (via Supabase or standalone)
- **Auth**: Supabase Auth (email/password + OAuth providers)
- **API**: Supabase Edge Functions (Deno runtime)
- **AI**: Lovable AI Gateway (Google Gemini + OpenAI GPT-5) — or direct OpenAI/Claude
- **Storage**: Supabase Storage (avatars, PDFs, assets)
- **Hosting**: Vercel / Netlify (frontend) + Supabase (backend)

---

## Feature Implementation Plan

### 1. User Authentication & Profiles

**Current State:** In-memory user store + localStorage + simulated password reset + change password in Profile Security tab
**Files to modify:** `AuthContext.tsx`, `SignInPage.tsx`, `SignUpPage.tsx`, `ForgotPasswordPage.tsx`, `ProfilePage.tsx`

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT, last_name TEXT,
  username TEXT UNIQUE, phone TEXT,
  date_of_birth DATE, region TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$ BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, username)
  VALUES (NEW.id, '', '', NEW.email);
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Steps:**
1. Enable Supabase Auth with email/password
2. Create `profiles` table + auto-create trigger
3. Replace `AuthContext.tsx` login/signup/logout with Supabase Auth calls
4. Replace `ForgotPasswordPage.tsx` with Supabase `resetPasswordForEmail()`
5. Replace `changePassword()` in Profile Security tab with Supabase `updateUser({ password })`
6. Upload profile pictures to Supabase Storage `avatars/` bucket

**RLS:**
```sql
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

---

### 2. User Roles & Admin Access (RBAC)

**Current State:** Hardcoded admin credentials + frontend `updateUserRole()` + admin-only sidebar navigation
**Files to modify:** `AuthContext.tsx`, `ProtectedRoute.tsx`, `AdminPage.tsx`, `DashboardLayout.tsx`

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
```

**Steps:**
1. Create `app_role` enum + `user_roles` table + `has_role()` function
2. Remove hardcoded admin credentials from frontend
3. Admin route checks: call `has_role(auth.uid(), 'admin')` server-side
4. Admin "Change Role" button → calls Edge Function `admin-update-role`
5. Seed initial admin: `INSERT INTO user_roles (user_id, role) VALUES ('<admin-uuid>', 'admin');`

**⚠️ CRITICAL:** Never check admin status via localStorage. Always verify server-side.

**Current admin navigation (already implemented):**
- Admins see a separate sidebar: Overview, User Management, Data Management, Admin Settings, Profile
- Users see the full feature sidebar (Budget, Industry, Feasibility, etc.)
- Navigation uses `?tab=` query params to deep-link into admin tabs

---

### 3. Budget & Planning Data Persistence

**Current State:** React state in `AppContext.tsx` (lost on refresh)

```sql
CREATE TABLE public.user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'My Startup',
  budget NUMERIC, team_size INTEGER DEFAULT 1,
  months_to_run INTEGER DEFAULT 6,
  selected_industry_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);
```

**Steps:**
1. Create table with RLS (users read/write own projects)
2. On dashboard load → fetch active project or create one
3. Replace `setBudget()`, `setTeamSize()` etc. with Supabase upsert (debounced 300ms)

---

### 4. Workshop Items Persistence

**Current State:** React state in `AppContext.tsx`

```sql
CREATE TABLE public.workshop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES user_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL, category TEXT,
  estimated_cost NUMERIC DEFAULT 0,
  notes TEXT, priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 5. Industry Data Management (Admin-Managed)

**Current State:** Static `src/data/industries.ts` + admin frontend CRUD (session-only)

```sql
CREATE TABLE public.industries (
  id TEXT PRIMARY KEY, name TEXT, icon TEXT,
  description TEXT, min_budget NUMERIC, monthly_cost_per_person NUMERIC
);

CREATE TABLE public.industry_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), industry_id TEXT REFERENCES industries(id) ON DELETE CASCADE,
  category TEXT, amount NUMERIC, description TEXT, is_monthly BOOLEAN DEFAULT false
);

CREATE TABLE public.industry_influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), industry_id TEXT REFERENCES industries(id) ON DELETE CASCADE,
  name TEXT, platform TEXT, followers TEXT, charge NUMERIC, specialty TEXT
);

CREATE TABLE public.industry_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), industry_id TEXT REFERENCES industries(id) ON DELETE CASCADE,
  name TEXT, supplier TEXT, estimated_cost NUMERIC, unit TEXT, notes TEXT
);

CREATE TABLE public.industry_roadmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), industry_id TEXT REFERENCES industries(id) ON DELETE CASCADE,
  step INTEGER, title TEXT, description TEXT, duration TEXT, cost NUMERIC
);

CREATE TABLE public.industry_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), industry_id TEXT REFERENCES industries(id) ON DELETE CASCADE,
  name TEXT, type TEXT, monthly_cost NUMERIC, one_time_cost NUMERIC, description TEXT, essential BOOLEAN
);
```

**Admin CRUD already implemented in frontend:**
- ✅ Add/delete entire industries
- ✅ Edit industry metadata (name, icon, min budget, monthly cost per person)
- ✅ Full inline CRUD for expenses, influencers, materials, resources, roadmap
- 🔲 Just needs database connection instead of local state

---

### 6. AI-Powered Features

**Admin AI Configuration (already built in frontend — Admin Settings tab):**
- API key management slots (Lovable AI Gateway, OpenAI, Google Gemini)
- Model preference settings per feature (feasibility, SWOT, business plan, etc.)
- 8 AI feature toggles with enable/disable capability

**a) AI Feasibility Calculator**
- Edge Function `ai-feasibility-calculate`
- Input: `{ budget, industry, teamSize, months, workshopItems }`
- Output: `{ feasibilityScore, estimatedProfit, breakEvenMonth, riskLevel, recommendations[] }`
- Cache results in `ai_calculations` table (keyed by input hash)
- Fallback: current formula if AI unavailable
- **Pages affected:** `FeasibilityPage.tsx`, `BreakEvenPage.tsx`, `RiskAssessmentPage.tsx`

**b) AI Startup Recommendations**
- Edge Function `ai-recommendations`
- Input: budget, industry, team size, region, workshop items
- Output: `{ recommendations: [{ industry, score, reasoning }] }`

**c) AI SWOT & Risk Analysis**
- Edge Function `ai-swot-analysis` → `{ strengths[], weaknesses[], opportunities[], threats[] }`
- Edge Function `ai-risk-assessment` → `{ risks: [{ category, score, description, mitigation }] }`

**d) AI Influencer Matching**
- Edge Function `ai-influencer-match` — match businesses with optimal influencers using AI scoring

**e) AI Marketing Budget Optimizer**
- Edge Function `ai-marketing-optimize` — optimize spend allocation across channels

**f) AI Break-Even Forecasting**
- Edge Function `ai-breakeven-forecast` — predict timelines using historical data

**g) AI Business Plan Writer**
- Edge Function `generate-business-plan` — generate PDF with AI-assisted executive summary
- Store in Supabase Storage `business-plans/`

---

### 7. Business Plan Export (PDF)

**Current State:** Downloads `.txt` from browser

**Steps:**
1. Edge Function `generate-business-plan` generates styled PDF
2. Add format selector in `BusinessPlanPage.tsx`: PDF (backend) vs TXT (instant)
3. Include AI-generated executive summary in PDF

---

### 8. Analytics & Activity Tracking

```sql
CREATE TABLE public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 9. Email Notifications

1. Integrate Resend/SendGrid with Supabase secrets
2. Edge Function `send-email` with templates: welcome, plan ready, weekly summary
3. Connect to notification preferences from Profile Preferences tab

---

### 10. Payment Integration (Stripe)

1. Edge Functions: `create-checkout-session`, `stripe-webhook`
2. `subscriptions` table with user_id, plan, status, expiry
3. Feature gates: Free (basic), Pro (AI + PDF), Enterprise (teams)

---

### 11. File Storage

1. Supabase Storage buckets: `avatars/`, `business-plans/`, `project-assets/`
2. Replace base64 profile pictures with storage URLs
3. Client-side compression (max 500KB)

---

### 12. Admin Dashboard Backend

**Current State:** Frontend admin with full CRUD + user management + AI config UI — all in local state

**Steps:**
1. Admin-only Edge Functions:
   - `admin-list-users` — paginated user list
   - `admin-delete-user` — soft-delete accounts
   - `admin-update-role` — change user roles
   - `admin-crud-industry` — CRUD on all industry tables
   - `admin-analytics` — aggregated stats
   - `admin-ai-config` — store/retrieve AI settings (API keys, model prefs, feature toggles)
2. All verify `has_role(auth.uid(), 'admin')` server-side
3. Connect existing frontend CRUD to database
4. AI config stored in `admin_settings` table:

```sql
CREATE TABLE public.admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
-- Example rows:
-- ('ai_model_default', '"google/gemini-3-flash-preview"')
-- ('ai_features', '{"feasibility": true, "swot": false, ...}')
-- ('ai_api_keys', '{"lovable": "configured", "openai": "not_configured"}')
```

---

## Database Migration Order

```
1.  CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
2.  CREATE TABLE profiles (...) + auto-create trigger
3.  CREATE TABLE user_roles (...) + has_role() function
4.  CREATE TABLE user_projects (...)
5.  CREATE TABLE workshop_items (...)
6.  CREATE TABLE industries (...)
7.  CREATE TABLE industry_expenses (...)
8.  CREATE TABLE industry_influencers (...)
9.  CREATE TABLE industry_materials (...)
10. CREATE TABLE industry_roadmap (...)
11. CREATE TABLE industry_resources (...)
12. SEED industry data from industries.ts
13. CREATE TABLE user_activity_log (...)
14. CREATE TABLE ai_calculations (...)
15. CREATE TABLE admin_settings (...)
16. CREATE TABLE subscriptions (...)
17. ENABLE RLS ON ALL TABLES
18. CREATE Storage buckets
```

---

## Environment Variables

```env
# Frontend (publishable — safe to expose)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Backend Secrets (NEVER in frontend code)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
LOVABLE_API_KEY=auto-provisioned
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

---

## AI Integration Flow

```
User clicks "Check Feasibility"
  → Frontend POST to Edge Function
  → Edge Function checks admin_settings for enabled features
  → Edge Function checks cache (ai_calculations table)
  → Cache hit? Return cached result
  → Cache miss? Call Lovable AI Gateway (or configured provider)
  → Parse structured JSON response
  → Store in cache
  → Return to frontend
  → Log action to user_activity_log
```

---

## Priority Matrix

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 🔴 P0 | Auth + Profiles + Password Reset | 1 day | Core |
| 🔴 P0 | User Roles (RBAC) | 0.5 day | Security |
| 🔴 P0 | Project Persistence | 1 day | Data retention |
| 🟡 P1 | Workshop Persistence | 0.5 day | Feature completeness |
| 🟡 P1 | Industry DB Migration | 1 day | Admin data management |
| 🟡 P1 | File Storage | 0.5 day | Profile pictures |
| 🟢 P2 | AI Feasibility | 1 day | Core AI feature |
| 🟢 P2 | AI Recommendations | 0.5 day | AI feature |
| 🟢 P2 | AI SWOT + Risk | 0.5 day | AI feature |
| 🟢 P2 | AI Influencer Matching | 0.5 day | AI feature |
| 🟢 P2 | AI Marketing Optimizer | 0.5 day | AI feature |
| 🟢 P2 | PDF Export | 1 day | Professional output |
| 🔵 P3 | Email Notifications | 0.5 day | Engagement |
| 🔵 P3 | Activity Logging | 0.5 day | Analytics |
| 🔵 P3 | Stripe Payments | 1 day | Revenue |
| 🔵 P3 | Admin AI Config Persistence | 0.5 day | Admin control |

**Total: ~11–13 days**

---

## Security Checklist

- ✅ RLS on ALL tables
- ✅ `has_role()` SECURITY DEFINER for admin
- ✅ Zod validation on Edge Functions
- ✅ Rate limiting on AI endpoints
- ✅ CORS (allow only your domains)
- ✅ No secrets in frontend
- ✅ Audit logging for admin actions
- ✅ HTTPS enforced
- ✅ Password reset via Supabase Auth (not frontend simulation)
- ✅ AI API keys stored as backend secrets, managed via admin UI

---

*StartSmart Platform · © 2026*
*Prepared by: Sadia Sunjana Shashee, Shahariar Akram, Sinthia Selim Shoily, Raiyanul Haque*
