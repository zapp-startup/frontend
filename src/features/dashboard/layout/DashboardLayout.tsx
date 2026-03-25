import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Routes, Route, NavLink, useLocation, Navigate } from "react-router-dom";
import { Home, CreditCard, BarChart2, Search, User, Camera, List, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/features/auth";
import { cn } from "@/shared/components/ui/utils";
import { COLORS, GLOWS } from "@/shared/theme";
import { ZappBot } from "../components/ZappBot";
import { BuyAdvisorModal } from "../components/BuyAdvisorModal";
import { PanelProvider } from "../context/PanelContext";

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
const CirclesPage = React.lazy(() =>
  import("@/features/gamification").then((module) => ({ default: module.CirclesPage }))
);
const BadgesPage = React.lazy(() =>
  import("@/features/gamification").then((module) => ({ default: module.BadgesPage }))
);
const TargetsPage = React.lazy(() =>
  import("@/features/gamification").then((module) => ({ default: module.TargetsPage }))
);

type PageId =
  | "home"
  | "transactions"
  | "circles"
  | "subscriptions"
  | "analytics"
  | "search"
  | "profile";

const NAV_ITEMS: { id: Exclude<PageId, "profile">; path: string; label: string; icon: LucideIcon }[] = [
  { id: "home", path: "/", label: "Dashboard", icon: Home },
  { id: "transactions", path: "/transactions", label: "Transactions", icon: List },
  { id: "circles", path: "/circles", label: "Circles", icon: Users },
  { id: "subscriptions", path: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "analytics", path: "/analytics", label: "Analytics", icon: BarChart2 },
  { id: "search", path: "/search", label: "Search", icon: Search },
];

const PAGE_COLORS: Record<PageId, string> = {
  home: COLORS.electricGreen,
  transactions: COLORS.electricCyan,
  circles: COLORS.electricYellow,
  subscriptions: COLORS.electricBlue,
  analytics: COLORS.electricCyan,
  search: COLORS.electricTeal,
  profile: COLORS.electricPurple,
};

function pathToPage(pathname: string): PageId {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/profile")) return "profile";

  const segment = pathname.replace(/^\//, "").split("/")[0] || "home";
  if (segment === "badges" || segment === "targets") return "circles";

  return (NAV_ITEMS.some((item) => item.id === segment) ? segment : "home") as PageId;
}

const ROUTES: { path: string; match?: (pathname: string) => boolean; element: React.ReactNode }[] = [
  { path: "/", element: <HomePage /> },
  { path: "/transactions", element: <TransactionsPage /> },
  { path: "/circles", element: <CirclesPage /> },
  { path: "/badges", element: <BadgesPage /> },
  { path: "/targets", element: <TargetsPage /> },
  { path: "/subscriptions", element: <SubscriptionsPage /> },
  { path: "/analytics", element: <AnalyticsPage /> },
  { path: "/search", element: <SearchPage /> },
  { path: "/profile", match: (pathname) => pathname.startsWith("/profile"), element: <ProfilePage /> },
];

const PageContent = React.memo(function PageContent() {
  const { pathname } = useLocation();
  const route = ROUTES.find((item) => (item.match ? item.match(pathname) : item.path === pathname));
  const content = route ? route.element : <HomePage />;
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0.92, y: 8 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <React.Suspense
        fallback={
          <div className="min-h-[40vh] flex items-center justify-center text-xs font-black uppercase tracking-widest text-gray-500">
            Loading...
          </div>
        }
      >
        <React.Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center text-xs font-black uppercase tracking-widest text-gray-500">
              Loading...
            </div>
          }
        >
          {content}
        </React.Suspense>
      </motion.div>
    </AnimatePresence>
  );
});

export function DashboardLayout() {
  const { isAuthenticated, isAuthReady, user } = useAuth();
  const { pathname } = useLocation();
  const activePage = pathToPage(pathname);
  const [isBuyAdvisorOpen, setIsBuyAdvisorOpen] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  if (!isAuthReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const activeColor = PAGE_COLORS[activePage];

  return (
    <PanelProvider>
      <motion.div
        animate={shouldReduceMotion ? undefined : { backgroundColor: activeColor }}
        transition={{ duration: 0.9 }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 blur-[100px] opacity-20 pointer-events-none z-0"
        style={shouldReduceMotion ? { backgroundColor: activeColor } : undefined}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.03] bg-[#0B1220]/60 backdrop-blur-3xl">
        <div className="mx-auto flex h-24 w-full max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-6 lg:gap-10">
            <NavLink to="/" className="group flex items-center gap-4">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-20 transition-all group-hover:opacity-60"
                  style={{ backgroundColor: COLORS.electricCyan }}
                />
                <div
                  className="relative h-5 w-5 rounded-full shadow-[0_0_20px_#22F0FF]"
                  style={{ backgroundColor: COLORS.electricCyan }}
                />
              </div>
              <span className="text-3xl font-black uppercase italic tracking-tighter text-white transition-colors group-hover:text-cyan-400 sm:text-4xl">
                Zapp
              </span>
            </NavLink>

            <div className="hidden min-w-0 items-center gap-2 lg:flex xl:gap-3">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    cn(
                      "relative flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] transition-all 2xl:px-6",
                      isActive ? "text-white" : "text-gray-600 hover:text-gray-300"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="nav-bg"
                          className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.05]"
                        />
                      )}
                      <item.icon
                        className={cn(
                          "relative z-10 h-4 w-4 transition-colors",
                          isActive ? "text-cyan-400 drop-shadow-[0_0_12px_#22F0FF]" : "text-gray-600"
                        )}
                      />
                      <span className="relative z-10">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 border-l border-white/5 pl-3 sm:pl-4">
              <NavLink to="/profile" className="group/avatar flex items-center gap-4">
                <div className="hidden text-right md:block">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors group-hover/avatar:text-cyan-400">
                    {user?.name ?? "Guest"}
                  </div>
                  <div className="text-[9px] font-black uppercase text-cyan-500">
                    {user?.tier ?? "Intentional Tier"}
                  </div>
                </div>
                <div
                  className="h-12 w-12 rounded-[1.25rem] border border-white/20 shadow-2xl transition-all group-hover/avatar:scale-105 sm:h-14 sm:w-14"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${COLORS.electricCyan}, ${COLORS.electricBlue})`,
                  }}
                />
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto min-h-screen max-w-[1440px] px-4 pt-40 sm:px-6 lg:px-8 lg:pt-44">
        <Routes>
          <Route path="*" element={<PageContent />} />
        </Routes>
      </main>

      <div className="fixed bottom-10 left-10 z-[100]">
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: GLOWS.soft(COLORS.electricCyan) }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsBuyAdvisorOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#101A2E] text-gray-400 shadow-2xl transition-all hover:text-white"
        >
          <Camera size={24} />
        </motion.button>
      </div>

      <ZappBot />
      <BuyAdvisorModal isOpen={isBuyAdvisorOpen} onClose={() => setIsBuyAdvisorOpen(false)} />
    </PanelProvider>
  );
}
