import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Routes, Route, NavLink, useLocation, Navigate } from "react-router-dom";
import { Home, CreditCard, BarChart2, Search, User, Camera, List } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/features/auth";
import { cn } from "@/shared/components/ui/utils";
import { COLORS, GLOWS } from "@/shared/theme";
import { ZappBot } from "../components/ZappBot";
import { BuyAdvisorModal } from "../components/BuyAdvisorModal";
import { HomePage } from "@/features/home";
import { SubscriptionsPage } from "@/features/subscriptions/pages/SubscriptionsPage";
import { AnalyticsPage } from "@/features/analytics/pages/AnalyticsPage";
import { SearchPage } from "@/features/search/pages/SearchPage";
import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import { TransactionsPage } from "@/features/transactions";

type PageId = "home" | "transactions" | "subscriptions" | "analytics" | "search";

const NAV_ITEMS: { id: PageId; path: string; label: string; icon: LucideIcon }[] = [
  { id: "home", path: "/", label: "Dashboard", icon: Home },
  { id: "transactions", path: "/transactions", label: "Transactions", icon: List },
  { id: "subscriptions", path: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "analytics", path: "/analytics", label: "Analytics", icon: BarChart2 },
  { id: "search", path: "/search", label: "Search", icon: Search },
  //{ id: "profile", path: "/profile", label: "Profile", icon: User },
];

const PAGE_COLORS: Record<PageId, string> = {
  home: COLORS.electricGreen,
  transactions: COLORS.electricCyan,
  subscriptions: COLORS.electricBlue,
  analytics: COLORS.electricCyan,
  search: COLORS.electricTeal,
  //profile: COLORS.electricPurple,
};

function pathToPage(pathname: string): PageId {
  if (pathname === "/") return "home";
  const segment = pathname.replace(/^\//, "") || "home";
  return (NAV_ITEMS.some((n) => n.id === segment) ? segment : "home") as PageId;
}

const ROUTES: { path: string; element: React.ReactNode }[] = [
  { path: "/", element: <HomePage /> },
  { path: "/transactions", element: <TransactionsPage /> },
  { path: "/subscriptions", element: <SubscriptionsPage /> },
  { path: "/analytics", element: <AnalyticsPage /> },
  { path: "/search", element: <SearchPage /> },
  //{ path: "/profile", element: <ProfilePage /> },
];

function PageContent() {
  const { pathname } = useLocation();
  const route = ROUTES.find((r) => r.path === pathname);
  const content = route ? route.element : <HomePage />;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -15 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

export function DashboardLayout() {
  const { isAuthenticated, isAuthReady, user } = useAuth();
  const { pathname } = useLocation();
  const activePage = pathToPage(pathname);
  const [isBuyAdvisorOpen, setIsBuyAdvisorOpen] = React.useState(false);

  if (!isAuthReady) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const activeColor = PAGE_COLORS[activePage];

  return (
    <>
      <motion.div
        animate={{ backgroundColor: activeColor }}
        transition={{ duration: 1.5 }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 blur-[100px] opacity-20 pointer-events-none z-0"
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1220]/60 backdrop-blur-3xl border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-12 h-24 flex items-center justify-between">
          <div className="flex items-center gap-16">
            <NavLink to="/" className="flex items-center gap-4 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-60 transition-all" style={{ backgroundColor: COLORS.electricCyan }} />
                <div className="relative w-5 h-5 rounded-full shadow-[0_0_20px_#22F0FF]" style={{ backgroundColor: COLORS.electricCyan }} />
              </div>
              <span className="text-4xl font-black tracking-tighter uppercase italic group-hover:text-cyan-400 transition-colors">Zapp</span>
            </NavLink>
            <div className="hidden lg:flex items-center gap-4">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    cn(
                      "relative flex items-center gap-3 px-8 py-3 rounded-2xl transition-all font-black uppercase tracking-[0.3em] text-[10px]",
                      isActive ? "text-white" : "text-gray-600 hover:text-gray-300"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div layoutId="nav-bg" className="absolute inset-0 bg-white/[0.05] rounded-2xl border border-white/10" />
                      )}
                      <item.icon className={cn("w-4 h-4 transition-colors relative z-10", isActive ? "text-cyan-400 drop-shadow-[0_0_12px_#22F0FF]" : "text-gray-600")} />
                      <span className="relative z-10">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 pl-4 border-l border-white/5">
              <NavLink to="/profile" className="flex items-center gap-4 cursor-pointer group/avatar">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white group-hover/avatar:text-cyan-400 transition-colors">{user?.name ?? "Guest"}</div>
                  <div className="text-[9px] font-black text-cyan-500 uppercase">{user?.tier ?? "Intentional Tier"}</div>
                </div>
                <div
                  className="w-14 h-14 rounded-[1.25rem] border border-white/20 group-hover/avatar:scale-105 transition-all shadow-2xl"
                  style={{ backgroundImage: `linear-gradient(to bottom right, ${COLORS.electricCyan}, ${COLORS.electricBlue})` }}
                />
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-12 pt-44 min-h-screen relative z-10">
        <Routes>
          <Route path="*" element={<PageContent />} />
        </Routes>
      </main>

      <div className="fixed bottom-10 left-10 z-[100]">
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: GLOWS.soft(COLORS.electricCyan) }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsBuyAdvisorOpen(true)}
          className="w-14 h-14 bg-[#101A2E] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-2xl"
        >
          <Camera size={24} />
        </motion.button>
      </div>

      <ZappBot />
      <BuyAdvisorModal isOpen={isBuyAdvisorOpen} onClose={() => setIsBuyAdvisorOpen(false)} />
    </>
  );
}
