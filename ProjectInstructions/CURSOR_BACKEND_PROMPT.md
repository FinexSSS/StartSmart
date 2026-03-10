# StartSmart — Backend Implementation Prompt for Cursor/Antigravity

> **Copy this entire file and paste it as a prompt in Cursor or Antigravity. It contains everything needed to implement the full Supabase backend for this project.**

---

## PROJECT CONTEXT

StartSmart is a React 18 + TypeScript + Vite startup planning platform. The **frontend is 100% complete** with 20 features (budget, industry selection, feasibility calculator, expenses, influencers, materials, recommendations, roadmap, analytics, risk assessment, break-even, funding, SWOT, marketing budget, business plan export, admin dashboard, workshop, profile, auth, and 3D scenes).

**Current state:** All data lives in React state (`AppContext.tsx`, `AuthContext.tsx`) and localStorage. Nothing persists across sessions. Your job is to add a Supabase backend.

### Key Files to Understand
- `ProjectInstructions/FRONTEND_README.md` — Maps all 20 SRS features to components
- `ProjectInstructions/BACKEND_INSTRUCTIONS.md` — Full database schemas, migration order, and architecture
- `src/context/AuthContext.tsx` — Current in-memory auth (hardcoded admin: `admin`/`startsmart2024`, 3 demo users)
- `src/context/AppContext.tsx` — Current in-memory app state (budget, teamSize, monthsToRun, selectedIndustry, workshopItems)
- `src/App.tsx` — All routes defined here
- `src/data/industries.ts` — Static industry data to migrate to database
- `src/components/ProtectedRoute.tsx` — Route guards (ProtectedRoute + AdminRoute)
- `src/components/DashboardLayout.tsx` — Role-based sidebar (admins vs users see different navigation)
- `src/pages/ProfilePage.tsx` — 3-tab profile (General, Security, Preferences)
- `src/pages/AdminPage.tsx` — 4-tab admin (Overview, User Management, Data Management, AI Settings)

---

## WHAT TO IMPLEMENT

### Step 1: Set Up Supabase Project

1. Create a new Supabase project at https://supabase.com
2. Get your project URL and anon key
3. Install Supabase client:
   ```bash
   npm install @supabase/supabase-js
   ```
4. Create `src/integrations/supabase/client.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```
5. Create `.env` at project root:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
   ```

---

### Step 2: Database Schema (Run in Supabase SQL Editor — IN THIS EXACT ORDER)

```sql
-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  username TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  region TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- 3. Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, username, email)
  VALUES (NEW.id, '', '', NEW.email, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 5. Role check function (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 6. User projects
CREATE TABLE public.user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'My Startup',
  budget NUMERIC DEFAULT 0,
  team_size INTEGER DEFAULT 1,
  months_to_run INTEGER DEFAULT 6,
  selected_industry_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- 7. Workshop items
CREATE TABLE public.workshop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES user_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category TEXT,
  estimated_cost NUMERIC DEFAULT 0,
  notes TEXT,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Industries (admin-managed, replaces src/data/industries.ts)
CREATE TABLE public.industries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  min_budget NUMERIC,
  monthly_cost_per_person NUMERIC
);

-- 9. Industry sub-tables
CREATE TABLE public.industry_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id TEXT REFERENCES industries(id) ON DELETE CASCADE,
  category TEXT, amount NUMERIC, description TEXT, is_monthly BOOLEAN DEFAULT false
);

CREATE TABLE public.industry_influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id TEXT REFERENCES industries(id) ON DELETE CASCADE,
  name TEXT, platform TEXT, followers TEXT, charge NUMERIC, specialty TEXT
);

CREATE TABLE public.industry_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id TEXT REFERENCES industries(id) ON DELETE CASCADE,
  name TEXT, supplier TEXT, estimated_cost NUMERIC, unit TEXT, notes TEXT
);

CREATE TABLE public.industry_roadmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id TEXT REFERENCES industries(id) ON DELETE CASCADE,
  step INTEGER, title TEXT, description TEXT, duration TEXT, cost NUMERIC
);

CREATE TABLE public.industry_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id TEXT REFERENCES industries(id) ON DELETE CASCADE,
  name TEXT, type TEXT, monthly_cost NUMERIC, one_time_cost NUMERIC, description TEXT, essential BOOLEAN
);

-- 10. Activity log
CREATE TABLE public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Admin settings (AI config, feature flags)
CREATE TABLE public.admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 12. Enable RLS on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_roadmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 13. RLS Policies
-- Profiles
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- User roles (only admins can manage, users can read own)
CREATE POLICY "Users read own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Projects
CREATE POLICY "Users CRUD own projects" ON user_projects FOR ALL USING (auth.uid() = user_id);

-- Workshop items
CREATE POLICY "Users CRUD own items" ON workshop_items FOR ALL USING (auth.uid() = user_id);

-- Industries (public read, admin write)
CREATE POLICY "Anyone can read industries" ON industries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage industries" ON industries FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Industry sub-tables (same pattern)
CREATE POLICY "Read industry_expenses" ON industry_expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin industry_expenses" ON industry_expenses FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Read industry_influencers" ON industry_influencers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin industry_influencers" ON industry_influencers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Read industry_materials" ON industry_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin industry_materials" ON industry_materials FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Read industry_roadmap" ON industry_roadmap FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin industry_roadmap" ON industry_roadmap FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Read industry_resources" ON industry_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin industry_resources" ON industry_resources FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Activity log
CREATE POLICY "Users read own activity" ON user_activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own activity" ON user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all activity" ON user_activity_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admin settings
CREATE POLICY "Admins manage settings" ON admin_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Auth users read settings" ON admin_settings FOR SELECT TO authenticated USING (true);
```

---

### Step 3: Seed Industry Data

After creating the tables, read `src/data/industries.ts` and generate INSERT statements for each industry and its sub-data (expenses, influencers, materials, roadmap, resources). Insert them into the corresponding tables.

---

### Step 4: Replace AuthContext.tsx

Replace the entire `src/context/AuthContext.tsx` with a Supabase-powered version:

**Requirements:**
- Use `supabase.auth.signUp()` for signup (pass first_name, last_name as metadata)
- Use `supabase.auth.signInWithPassword()` for login
- Use `supabase.auth.signOut()` for logout
- Use `supabase.auth.resetPasswordForEmail()` for forgot password (redirect to `/reset-password`)
- Use `supabase.auth.updateUser({ password })` for change password
- Use `supabase.auth.onAuthStateChange()` to track session — set up BEFORE `getSession()`
- Fetch profile from `profiles` table after auth
- Check admin role via `has_role()` RPC call: `supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })`
- Keep the same `UserProfile` interface shape so no other components break
- `getAllUsers()` → admin-only: query `profiles` table (requires admin RLS or edge function)
- `deleteUser()` → admin-only: needs a Supabase Edge Function with service role key
- `updateUserRole()` → admin-only: insert/update `user_roles` table

**Create a new page** `/reset-password` → `src/pages/ResetPasswordPage.tsx`:
- Check URL hash for `type=recovery`
- Show new password form
- Call `supabase.auth.updateUser({ password })`
- Add route in `App.tsx`

---

### Step 5: Replace AppContext.tsx

Replace in-memory state with Supabase persistence:

- On dashboard load → fetch or create a `user_projects` row for the current user
- `setBudget()`, `setTeamSize()`, `setMonthsToRun()`, `setSelectedIndustry()` → debounced (300ms) upsert to `user_projects`
- Workshop items → CRUD against `workshop_items` table
- Keep the same interface so all page components work without changes

---

### Step 6: Replace Static Industry Data

- Create `src/hooks/useIndustries.ts` that fetches from the `industries` table + sub-tables
- Replace all imports of `src/data/industries.ts` with the hook
- Admin CRUD in `AdminPage.tsx` → connect to Supabase instead of local state

---

### Step 7: Update ProtectedRoute.tsx

- Replace `useAuth()` role check with Supabase session + `has_role()` RPC
- `AdminRoute` should verify admin role server-side, not from localStorage

---

### Step 8: Profile Picture Upload

- Create a Supabase Storage bucket called `avatars` (public)
- In `ProfilePage.tsx`, upload to `avatars/{user_id}.jpg`
- Store the public URL in `profiles.profile_picture_url`

---

### Step 9: Admin Edge Functions (Optional but Recommended)

Create Supabase Edge Functions for admin operations that need service role:

1. `supabase/functions/admin-list-users/index.ts` — List all users with profiles
2. `supabase/functions/admin-delete-user/index.ts` — Delete a user account
3. `supabase/functions/admin-update-role/index.ts` — Change user role

Each must:
- Verify the caller is admin: `has_role(auth.uid(), 'admin')`
- Use `createClient()` with service role key
- Return JSON responses
- Include CORS headers

---

## IMPORTANT RULES

1. **Do NOT modify any page component UI** — only change data sources (context providers, hooks)
2. **Keep all TypeScript interfaces identical** — components expect the same shape
3. **Every Supabase call needs error handling** — use try/catch, show toast on error
4. **Never store secrets in frontend code** — only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are safe
5. **Test auth flow:** signup → login → logout → forgot password → reset password → change password
6. **Test admin flow:** dev login should be replaced with real admin role check
7. **Remove the hardcoded admin credentials** (`admin`/`startsmart2024`) — seed a real admin via SQL instead

---

## FILE CHANGE SUMMARY

| File | Action |
|------|--------|
| `src/integrations/supabase/client.ts` | **CREATE** — Supabase client |
| `.env` | **CREATE** — Supabase URL + anon key |
| `src/context/AuthContext.tsx` | **REWRITE** — Supabase Auth |
| `src/context/AppContext.tsx` | **REWRITE** — Supabase persistence |
| `src/pages/ResetPasswordPage.tsx` | **CREATE** — Password reset page |
| `src/hooks/useIndustries.ts` | **CREATE** — Fetch industries from DB |
| `src/components/ProtectedRoute.tsx` | **MODIFY** — Use Supabase session |
| `src/App.tsx` | **MODIFY** — Add `/reset-password` route |
| `src/pages/ProfilePage.tsx` | **MODIFY** — Storage upload for avatar |
| `src/pages/AdminPage.tsx` | **MODIFY** — Connect CRUD to Supabase |
| `src/data/industries.ts` | **KEEP** as fallback, but primary source is DB |
| `supabase/functions/admin-*/index.ts` | **CREATE** — Admin edge functions |

---

## TECH STACK

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Recharts, React Three Fiber
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Package manager:** npm
- **Port:** 8080 (configured in vite.config.ts)

---

*Read `ProjectInstructions/BACKEND_INSTRUCTIONS.md` for complete database schemas and `ProjectInstructions/FRONTEND_README.md` for the full feature map before starting.*
