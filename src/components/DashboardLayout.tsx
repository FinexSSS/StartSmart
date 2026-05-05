import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  DollarSign, Store, Gauge, Wallet, Megaphone, Box,
  Brain, Route, Activity, Wrench, Home, Lightbulb, User, Users, LogOut,
  ShieldAlert, Target, Landmark, Crosshair, TrendingUp, FileText,
} from "lucide-react";
import DashboardScene from "@/components/DashboardScene";
import Logo3D from "@/components/Logo3D";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

const userNavItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Budget", url: "/dashboard/budget", icon: DollarSign },
  { title: "Industries", url: "/dashboard/industry", icon: Store },
  { title: "Feasibility", url: "/dashboard/feasibility", icon: Gauge },
  { title: "Expenses", url: "/dashboard/expenses", icon: Wallet },
  { title: "Break-Even", url: "/dashboard/breakeven", icon: Target },
  { title: "Risk Assessment", url: "/dashboard/risk", icon: ShieldAlert },
  { title: "SWOT Analysis", url: "/dashboard/swot", icon: Crosshair },
  { title: "Influencers", url: "/dashboard/influencers", icon: Megaphone },
  { title: "Resources", url: "/dashboard/materials", icon: Box },
  { title: "Marketing", url: "/dashboard/marketing", icon: TrendingUp },
  { title: "Funding", url: "/dashboard/funding", icon: Landmark },
  { title: "Suggestions", url: "/dashboard/recommendations", icon: Brain },
  { title: "Roadmap", url: "/dashboard/roadmap", icon: Route },
  { title: "Analytics", url: "/dashboard/analytics", icon: Activity },
  { title: "Business Plan", url: "/dashboard/export", icon: FileText },
  { title: "My Workshop", url: "/dashboard/workshop", icon: Lightbulb },
  { title: "Profile", url: "/dashboard/profile", icon: User },
];

const adminNavItems = [
  { title: "Admin Overview", url: "/dashboard/admin?tab=overview", icon: Home },
  { title: "User Management", url: "/dashboard/admin?tab=users", icon: Users },
  { title: "Data Management", url: "/dashboard/admin?tab=industries", icon: Box },
  { title: "Admin Settings", url: "/dashboard/admin?tab=settings", icon: Wrench },
  { title: "Profile", url: "/dashboard/profile", icon: User },
];

function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Use a ref or state to keep track of the last known role to avoid flickering
  const [lastKnownRole, setLastKnownRole] = useState<string | null>(user?.role || null);
  
  useEffect(() => {
    if (user?.role) {
      setLastKnownRole(user.role);
    }
  }, [user?.role]);

  const navItems = (user?.role || lastKnownRole) === "admin"
    ? adminNavItems
    : userNavItems;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3">
            {!collapsed ? (
              <span className="flex items-center gap-2">
                <Logo3D size={30} />
                <span className="text-sm font-bold gradient-text tracking-wide">StartSmart</span>
              </span>
            ) : (
              <Logo3D size={26} />
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const currentRoute = `${location.pathname}${location.search}`;
                const isActive = item.url.includes("?")
                  ? currentRoute === item.url
                  : location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${isActive ? "nav-active" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}
                        activeClassName=""
                      >
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User section at bottom */}
        {user && !collapsed && (
          <div className="mt-auto p-4 border-t border-border">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-muted-foreground truncate">@{user.username}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

export default function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        <DashboardScene />
        <DashboardSidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <header className="h-12 flex items-center justify-between border-b border-border px-4 glass-strong">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="flex items-center gap-2">
                <Logo3D size={24} />
                <h2 className="text-sm tracking-wide gradient-text font-bold">StartSmart</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={() => navigate("/dashboard/profile")}
                  className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all"
                  aria-label="Open profile"
                  title="Open profile"
                >
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              )}
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
