-- StartSmart — Run this in Supabase SQL Editor in order (one block at a time if needed).

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
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', ''), COALESCE(NEW.raw_user_meta_data->>'last_name', ''), COALESCE(NEW.raw_user_meta_data->>'username', NEW.email), NEW.email);
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

-- 8. Industries (admin-managed)
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
CREATE POLICY "Admins read all profiles" ON profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

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

-- 14. Resolve username to email for login (SECURITY DEFINER so client can look up email by username)
CREATE OR REPLACE FUNCTION public.get_email_for_login(_username TEXT)
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT email FROM public.profiles WHERE username = _username LIMIT 1
$$;

-- 15. Seed admin: After your first user signs up, run (replace YOUR_USER_UUID with their id from auth.users):
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_UUID', 'admin');
