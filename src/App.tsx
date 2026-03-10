import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DevLoginPage from "./pages/DevLoginPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import BudgetPage from "./pages/BudgetPage";
import IndustryPage from "./pages/IndustryPage";
import FeasibilityPage from "./pages/FeasibilityPage";
import ExpensesPage from "./pages/ExpensesPage";
import InfluencersPage from "./pages/InfluencersPage";
import MaterialsPage from "./pages/MaterialsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import RoadmapPage from "./pages/RoadmapPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import RiskAssessmentPage from "./pages/RiskAssessmentPage";
import BreakEvenPage from "./pages/BreakEvenPage";
import FundingPage from "./pages/FundingPage";
import SwotPage from "./pages/SwotPage";
import MarketingBudgetPage from "./pages/MarketingBudgetPage";
import BusinessPlanPage from "./pages/BusinessPlanPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import UserWorkshopPage from "./pages/UserWorkshopPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/dev-login" element={<DevLoginPage />} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardHome />} />
                  <Route path="budget" element={<BudgetPage />} />
                  <Route path="industry" element={<IndustryPage />} />
                  <Route path="feasibility" element={<FeasibilityPage />} />
                  <Route path="expenses" element={<ExpensesPage />} />
                  <Route path="influencers" element={<InfluencersPage />} />
                  <Route path="materials" element={<MaterialsPage />} />
                  <Route path="recommendations" element={<RecommendationsPage />} />
                  <Route path="roadmap" element={<RoadmapPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="risk" element={<RiskAssessmentPage />} />
                  <Route path="breakeven" element={<BreakEvenPage />} />
                  <Route path="funding" element={<FundingPage />} />
                  <Route path="swot" element={<SwotPage />} />
                  <Route path="marketing" element={<MarketingBudgetPage />} />
                  <Route path="export" element={<BusinessPlanPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="workshop" element={<UserWorkshopPage />} />
                  <Route
                    path="admin"
                    element={
                      <AdminRoute>
                        <AdminPage />
                      </AdminRoute>
                    }
                  />
                </Route>






                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
