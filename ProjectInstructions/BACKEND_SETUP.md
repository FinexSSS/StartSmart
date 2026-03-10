# StartSmart Backend Setup

Follow these steps to connect the frontend to Supabase.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Settings → API**, copy the **Project URL** and **anon public** key.

## 2. Environment variables

1. Copy `.env.example` to `.env` in the project root.
2. Set:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key

## 3. Database schema

1. In Supabase, open **SQL Editor**.
2. Run the contents of `supabase/migrations/20250307000000_initial_schema.sql` (in order; you can run the whole file).
3. Run `supabase/migrations/20250307100000_ai_calculations.sql` (adds AI cache table and default AI settings).
4. Run `supabase/seed_industries.sql` to load the 5 industries and their data.

## 4. Storage bucket (for profile pictures)

1. In Supabase, go to **Storage**.
2. Create a new bucket named **avatars**.
3. Set it to **Public** so profile picture URLs work.

## 5. Admin user

After your first user signs up:

1. In **SQL Editor**, run (replace `YOUR_USER_UUID` with the user’s id from **Authentication → Users**):

```sql
INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_UUID', 'admin');
```

That user can then use **Dev Login** (`/dev-login`) to access the admin dashboard.

## 6. Edge Functions (optional)

To allow admins to delete users from the dashboard:

1. Install [Supabase CLI](https://supabase.com/docs/guides/cli) and link your project.
2. Deploy the function:  
   `supabase functions deploy admin-delete-user`
3. Set the secret:  
   `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`  
   (Service role key is under **Settings → API**.)

If you skip this, the “Delete user” action in Admin will fail; other admin features still work.

## 7. Run the app

```bash
npm install
npm run dev
```

Sign up with a new account, then assign yourself the admin role (step 5) to use the admin panel.
