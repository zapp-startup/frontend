import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Routes, Route, NavLink, useLocation, Navigate } from "react-router-dom";
import { Home, CreditCard, BarChart2, Search, User, Camera, List, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/features/auth";
import { cn } from "@/shared/components/ui/utils";
import { COLORS, GLOWS } from "@/shared/theme";
import { ZappBot } from "../components/ZappBot";
import { BuyAdvisorModal } from "../components/BuyAdvisorModal";

const HomePage = React.lazy(() =>
  import("@/features/home").then((module) => ({ default: module.HomePage }))
);
const TransactionsPage = React.lazy(() =>
  import("@/features/transactions").then((module) => ({ default: module.TransactionsPage }))
);
const SubscriptionsPage = React.lazy(() =>
  import("@/features/subscriptions/pages/SubscriptionsPage").then((module) => ({ default: module.SubscriptionsPage }))
);
const AnalyticsPage = React.lazy(() =>
  import("@/features/analytics/pages/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage }))
);
const SearchPage = React.lazy(() =>
  import("@/features/search/pages/SearchPage").then((module) => ({ default: module.SearchPage }))
);
const ProfilePage = React.lazy(() =>
  import("@/features/profile/pages/ProfilePage").then((module) => ({ default: module.ProfilePage }))
);

type PageId = "home" | "transactions" | "subscriptions" | "analytics" | "search" | "profile";

const NAV_ITEMS: { id: PageId; path: string; label: string; icon: LucideIcon }[] = [
  { id: "home", path: "/", label: "Dashboard", icon: Home },
  { id: "transactions", path: "/transactions", label: "Transactions", icon: List },
  { id: "subscriptions", path: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "analytics", path: "/analytics", label: "Analytics", icon: BarChart2 },
  { id: "search", path: "/search", label: "Search", icon: Search },
  { id: "profile", path: "/profile", label: "Profile", icon: User },
];

const PAGE_COLORS: Record<PageId, string> = {
  home: COLORS.electricGreen,
  transactions: COLORS.electricCyan,
  subscriptions: COLORS.electricBlue,
  analytics: COLORS.electricCyan,
  search: COLORS.electricTeal,
  profile: COLORS.electricPurple,
};

function pathToPage(pathname: string): PageId {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/profile")) return "profile";
  const segment = pathname.replace(/^\//, "").split("/")[0] || "home";
  return (NAV_ITEMS.some((n) => n.id === segment) ? segment : "home") as PageId;
}

const ROUTES: { path: string; match?: (p: string) => boolean; element: React.ReactNode }[] = [
  { path: "/", element: <HomePage /> },
  { path: "/transactions", element: <TransactionsPage /> },
  { path: "/subscriptions", element: <SubscriptionsPage /> },
  { path: "/analytics", element: <AnalyticsPage /> },
  { path: "/search", element: <SearchPage /> },
  { path: "/profile", element: <ProfilePage /> },
];

function PageContent() {
  const { pathname } = useLocation();
  const route = ROUTES.find((r) => r.match ? r.match(pathname) : r.path === pathname);
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
        <React.Suspense
          fallback={
            <div className="min-h-[40vh] flex items-center justify-center text-xs font-black uppercase tracking-widest text-gray-500">
              Loading...
            </div>
          }
        >
          {content}
        </React.Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export function DashboardLayout() {
  const { isAuthenticated, isAuthReady } = useAuth();
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
        <div className="absolute left-4 sm:left-8 lg:left-12 top-1/2 -translate-y-1/2">
          <span className="text-4xl font-black tracking-tighter uppercase italic text-white shrink-0 -ml-1">Zapp</span>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-24 flex items-center justify-center">
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
