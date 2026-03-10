# StartSmart — Frontend Code Documentation

A comprehensive frontend application that helps aspiring entrepreneurs evaluate startup ideas, plan budgets, assess feasibility, and generate complete business plans.

> **📂 Location:** `ProjectInstructions/FRONTEND_README.md` — root level of the project, same level as `src/`, `public/`, `package.json`. In Lovable's Code tab, scroll above `src/` to find the `ProjectInstructions` folder.

---

## 🚀 All 20 Features (Per SRS Document)

| # | Feature (SRS) | Route / Component | Status |
|---|--------------|-------------------|--------|
| 1 | **Budget Input Module** | `/dashboard/budget` → `BudgetPage.tsx` | ✅ |
| 2 | **Industry Selection Module** | `/dashboard/industry` → `IndustryPage.tsx` | ✅ |
| 3 | **Startup Feasibility Calculator** | `/dashboard/feasibility` → `FeasibilityPage.tsx` | ✅ |
| 4 | **Expense Breakdown Engine** | `/dashboard/expenses` → `ExpensesPage.tsx` | ✅ |
| 5 | **Influencer Recommendation System** | `/dashboard/influencers` → `InfluencersPage.tsx` | ✅ |
| 6 | **Raw Material Information Module** | `/dashboard/materials` → `MaterialsPage.tsx` | ✅ |
| 7 | **Profit Estimation System** | Integrated in `FeasibilityPage.tsx` | ✅ |
| 8 | **Startup Recommendation Engine** | `/dashboard/recommendations` → `RecommendationsPage.tsx` | ✅ |
| 9 | **Feasibility Result Dashboard** | `/dashboard/feasibility` → `FeasibilityPage.tsx` | ✅ |
| 10 | **Startup Roadmap Generator** | `/dashboard/roadmap` → `RoadmapPage.tsx` | ✅ |
| 11 | **Admin Dashboard** | `/dashboard/admin` → `AdminPage.tsx` | ✅ |
| 12 | **Analytics Module** | `/dashboard/analytics` → `AnalyticsPage.tsx` | ✅ |
| 13 | **Resource Requirement Module** | `/dashboard/materials` → `MaterialsPage.tsx` | ✅ |
| 14 | **Database Management System** | `AppContext.tsx` + `AuthContext.tsx` (frontend state) | ✅ (Backend-ready) |
| 15 | **Risk Assessment Module** | `/dashboard/risk` → `RiskAssessmentPage.tsx` | ✅ |
| 16 | **Break-Even Analysis Module** | `/dashboard/breakeven` → `BreakEvenPage.tsx` | ✅ |
| 17 | **Funding Recommendation Module** | `/dashboard/funding` → `FundingPage.tsx` | ✅ |
| 18 | **SWOT Analysis Tool** | `/dashboard/swot` → `SwotPage.tsx` | ✅ |
| 19 | **Marketing Budget Planner** | `/dashboard/marketing` → `MarketingBudgetPage.tsx` | ✅ |
| 20 | **Business Plan Export Module** | `/dashboard/export` → `BusinessPlanPage.tsx` | ✅ |

### Additional Features (Beyond SRS)
- **User Workshop** — Custom item tracker shared across all tabs (`/dashboard/workshop`)
- **Profile Management** — 3-tab profile: General, Security (change password), Preferences (`/dashboard/profile`)
- **Forgot Password** — Standalone reset page (`/forgot-password`)
- **Dark/Light Theme** — Full dual-mode with HSL design tokens
- **3D Scenes** — Three.js hero & dashboard ambient backgrounds
- **Auth System** — Signup, signin, forgot password, dev login, protected/admin routes

---

## 🔐 Authentication & User Management

### User Features
- **Sign Up / Sign In** — Full profile (name, email, username, phone, DOB, region)
- **Forgot Password** — Reset via email at `/forgot-password`
- **Profile Page** (3 tabs):
  - **General** — Edit name, phone, DOB, region, profile picture; view account details & setup summary
  - **Security** — Change password (current → new → confirm); security status panel; danger zone (deactivate/delete — backend-ready)
  - **Preferences** — Toggle dark/light theme; notification preferences (email, weekly reports, alerts, tips)
- **Dev Login** — Admin access at `/dev-login` (credentials: `admin` / `startsmart2024`)

### Role-Based Navigation

Admins and users see **completely different sidebar navigation**:

| Role | Sidebar Items |
|------|--------------|
| **User** | Home, Budget, Industries, Feasibility, Expenses, Break-Even, Risk, SWOT, Influencers, Resources, Marketing, Funding, Suggestions, Roadmap, Analytics, Business Plan, Workshop, Profile |
| **Admin** | Admin Overview, User Management, Data Management, Admin Settings, Profile |

Admin sidebar items link directly to `AdminPage.tsx` with `?tab=` query params for each section.

### Admin Dashboard (4 Tabs)

| Tab | Purpose |
|-----|---------|
| **Overview** | Platform-wide stats (users, admins, industries, total data points); quick-access cards to other admin tabs; recent users list; data summary grid; user demographics by region |
| **User Management** | Search/filter users; view full profile details (email, phone, DOB, region, join date); **change user roles** (user ↔ admin); delete users; admin count badge |
| **Data Management** | Full CRUD for industries + all sub-entities (expenses, influencers, materials, resources, roadmap); add new industries; edit industry metadata; export all data as JSON |
| **Admin Settings** | Platform config (version, tech stack, auth, credentials); AI configuration (API keys, model preferences, feature toggles); security & access control status; backend features roadmap; data export/import |

**Key admin capabilities:**
- Add/delete entire industries with all sub-data
- Inline edit every data field (expenses, influencers, materials, resources, roadmap steps)
- Promote/demote users between user and admin roles
- View all user credentials and profile information
- Export complete platform data as JSON
- Configure AI API keys, model preferences, and feature toggles (backend-ready)
- Monitor backend readiness and security posture

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling with custom HSL design tokens |
| **shadcn/ui** | Accessible component library (40+ components) |
| **Framer Motion** | Animations & transitions |
| **Recharts** | Data visualizations (Pie, Bar, Area, Radar, Scatter) |
| **React Three Fiber + Drei** | 3D scenes and animated logo |
| **React Router v6** | Client-side routing with nested layouts + query params |
| **React Query** | Server state management (ready for backend) |
| **React Hook Form + Zod** | Form validation |

---

## 📁 Project Structure

```
ProjectInstructions/           ← 📌 YOU ARE HERE
├── FRONTEND_README.md         # This file
└── BACKEND_INSTRUCTIONS.md    # Backend + AI implementation guide

src/
├── assets/              # Static assets (logo.png)
├── components/
│   ├── ui/              # shadcn/ui components (40+ files)
│   ├── ChartTooltip.tsx # Custom Recharts tooltips
│   ├── DashboardLayout.tsx # Sidebar + header + outlet (role-based nav)
│   ├── DashboardScene.tsx  # 3D ambient background
│   ├── HeroScene.tsx    # Landing page 3D scene
│   ├── Logo3D.tsx       # Animated 3D dodecahedron logo
│   ├── NavLink.tsx      # Active-aware nav link
│   ├── ProtectedRoute.tsx # Auth guard (ProtectedRoute + AdminRoute)
│   └── ThemeToggle.tsx  # Dark/light mode switch
├── context/
│   ├── AppContext.tsx    # Global state: budget, industry, workshop items
│   ├── AuthContext.tsx   # Auth: profiles, login/signup/logout, changePassword, resetPassword, role management
│   └── ThemeContext.tsx  # Theme preference (dark/light)
├── data/
│   └── industries.ts    # 5 industries with full data + calculation functions
├── pages/
│   ├── AdminPage.tsx        # Admin panel (4 tabs: Overview, Users, Data, Settings + AI Config)
│   ├── ForgotPasswordPage.tsx # Password reset page
│   ├── ProfilePage.tsx      # User profile (3 tabs: General, Security, Preferences)
│   └── ... (18 more pages)
├── lib/
│   └── utils.ts         # Tailwind merge utility
```

---

## 🏃 Getting Started

```bash
npm install
npm run dev        # Dev server at localhost:5173
npm run build      # Production build
npm run test       # Run tests
```

---

## 🎨 Design System

All colors use HSL via CSS variables in `index.css`. Key tokens:
- `--primary` (teal), `--accent` (pink), `--success` (green), `--destructive` (red)
- Dark mode overrides in `.dark` class
- Custom classes: `.neo-card`, `.glass`, `.gradient-text`, `.neon-glow`, `.chip`, `.icon-box`
- Fonts: Sora (display/body) + JetBrains Mono (data/numbers)

---

## 🔄 Cross-Tab Data Sharing

Workshop items added in "My Workshop" automatically appear in:
- **Expenses Page** — Listed + aggregated in charts
- **Business Plan Export** — Dedicated section in `.txt` export
- **Dashboard Home** — Workshop count and total cost in quick stats

---

## 📝 Current Limitations

- **No backend** — Data lives in React state + localStorage (lost on clear)
- **Auth is simulated** — In-memory store with localStorage session
- **Admin edits are session-only** — Industry changes reset on refresh
- **Password reset is frontend-only** — No email sent (simulated)
- **AI config is display-only** — API keys, models, toggles await backend connection
- **Business plan exports as .txt** — Backend will enable PDF
- **See `BACKEND_INSTRUCTIONS.md`** for the complete migration guide
