import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Routes, Route, NavLink, useLocation, Navigate } from "react-router-dom";
import { Home, CreditCard, BarChart2, Search, User, Camera, List, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/features/auth";
import { AppLogo } from "@/shared/components/brand/AppLogo";
import { ThemeModeToggle } from "@/shared/components/layout/theme-mode-toggle";
import { AppButton, IconBadge } from "@/shared/components/system";
import { cn } from "@/shared/components/ui/utils";
import { COLORS, PAGE_ACCENTS } from "@/shared/theme";
import { ZappBot } from "../components/ZappBot";
import { BuyAdvisorModal } from "../components/BuyAdvisorModal";
import { PanelProvider } from "../context/PanelContext";
import { PrivacyPolicyLink } from "@/shared/components/PrivacyPolicyLink";
import { ApiConfigBanner } from "@/shared/components/ApiConfigBanner";
import { usePrivacyPolicyMeta } from "@/config/privacy";

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
const WeeklyReviewPage = React.lazy(() =>
  import("@/features/gamification").then((module) => ({ default: module.WeeklyReviewPage }))
);
const MonthlyReviewPage = React.lazy(() =>
  import("@/features/gamification").then((module) => ({ default: module.MonthlyReviewPage }))
);
const SpotifyCallbackPage = React.lazy(() =>
  import("@/features/integrations/pages/SpotifyCallbackPage").then((m) => ({ default: m.SpotifyCallbackPage }))
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
  { id: "subscriptions", path: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "circles", path: "/circles", label: "Circles", icon: Users },
];

function getInitials(name: string | null | undefined) {
  const parts = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "G";

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function pathToPage(pathname: string): PageId {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/integrations")) return "subscriptions";
  if (pathname.startsWith("/valuations")) return "analytics";
  if (pathname.startsWith("/reviews")) return "home";

  const segment = pathname.replace(/^\//, "").split("/")[0] || "home";
  if (segment === "badges" || segment === "targets") return "circles";

  return (NAV_ITEMS.some((item) => item.id === segment) ? segment : "home") as PageId;
}

const ROUTES: { path: string; match?: (pathname: string) => boolean; element: React.ReactNode }[] = [
  { path: "/", match: (pathname) => pathname === "/", element: <HomePage /> },
  {
    path: "/transactions",
    match: (pathname) => pathname === "/transactions" || pathname === "/transactions/new",
    element: <TransactionsPage />,
  },
  { path: "/circles", element: <CirclesPage /> },
  { path: "/badges", element: <BadgesPage /> },
  { path: "/targets", element: <TargetsPage /> },
  { path: "/reviews/weekly", element: <WeeklyReviewPage /> },
  { path: "/reviews/monthly", element: <MonthlyReviewPage /> },
  {
    path: "/subscriptions",
    match: (pathname) => pathname === "/subscriptions" || pathname === "/subscriptions/new",
    element: <SubscriptionsPage />,
  },
  { path: "/analytics", element: <AnalyticsPage /> },
  { path: "/search", element: <SearchPage /> },
  {
    path: "/integrations/spotify/callback",
    match: (pathname) => pathname.startsWith("/integrations/spotify"),
    element: <SpotifyCallbackPage />,
  },
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
          <div className="min-h-[40vh] flex items-center justify-center text-xs font-black uppercase tracking-widest text-[var(--app-color-text-tertiary)]">
            Loading...
          </div>
        }
      >
        {content}
      </React.Suspense>
      </motion.div>
  );
});

export function DashboardLayout() {
  const { isAuthenticated, isAuthReady, user, nextStep, nextRoute } = useAuth();
  const privacyPolicyMeta = usePrivacyPolicyMeta();
  const { pathname } = useLocation();
  const activePage = pathToPage(pathname);
  const [isBuyAdvisorOpen, setIsBuyAdvisorOpen] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();
  const userInitials = getInitials(user?.name);

  if (!isAuthReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (nextStep && nextStep !== "dashboard") {
    return <Navigate to={nextRoute} replace />;
  }

  const activeColor = PAGE_ACCENTS[activePage];

  return (
    <PanelProvider>
        <motion.div
          animate={shouldReduceMotion ? undefined : { backgroundColor: activeColor }}
          transition={{ duration: 0.9 }}
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 blur-[100px] opacity-20 pointer-events-none z-0"
          style={shouldReduceMotion ? { backgroundColor: activeColor } : undefined}
        />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--app-color-border-subtle)] bg-[var(--app-color-background-canvas)]/72 backdrop-blur-3xl">
        <div className="mx-auto grid h-24 w-full max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-6 px-4 sm:px-6 lg:px-8">
          <div className="justify-self-start">
            <NavLink to="/" className="inline-flex items-center">
              <AppLogo
                showWordmark
                size={52}
                wordmarkClassName="text-[2rem] sm:text-[2.35rem]"
              />
            </NavLink>
          </div>

          <div className="hidden min-w-0 items-center justify-center gap-2 justify-self-center lg:flex xl:gap-3">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] transition-all 2xl:px-6",
                    isActive
                      ? "text-[var(--app-color-text-primary)]"
                      : "text-[var(--app-color-text-tertiary)] hover:text-[var(--app-color-text-secondary)]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="nav-bg"
                        className="absolute inset-0 rounded-2xl border border-[var(--app-color-border-strong)] bg-[var(--app-color-surface-overlay)]"
                      />
                    )}
                        <item.icon
                          className={cn(
                            "relative z-10 h-4 w-4 transition-colors",
                            isActive
                              ? "text-[var(--app-accent-cyan-soft)] drop-shadow-[0_0_12px_color-mix(in_srgb,var(--app-accent-cyan-soft)_45%,transparent)]"
                              : "text-[var(--app-color-text-tertiary)]"
                          )}
                        />
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex shrink-0 items-center justify-self-end gap-4 sm:gap-6">
            <ThemeModeToggle />
            <div className="flex items-center gap-3 border-l border-[var(--app-color-border-subtle)] pl-3 sm:pl-4">
              <NavLink to="/profile" className="group/avatar flex items-center">
                <IconBadge
                  tone="cyan"
                  size="md"
                  className="h-12 w-12 border-[var(--app-color-border-strong)] text-sm font-black uppercase tracking-[0.12em] leading-none text-[var(--app-color-text-inverse)] shadow-2xl transition-all group-hover/avatar:scale-105 sm:h-14 sm:w-14 sm:text-base"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${COLORS.electricCyan}, ${COLORS.electricBlue})`,
                  }}
                >
                  <span className="inline-flex h-full w-full items-center justify-center leading-none">
                    {userInitials}
                  </span>
                </IconBadge>
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto min-h-screen max-w-[1440px] px-4 pt-40 sm:px-6 lg:px-8 lg:pt-44">
        <Routes>
          <Route path="*" element={<PageContent />} />
        </Routes>
        <footer className="mt-16 border-t border-white/[0.06] py-8 text-center text-[10px] text-gray-600">
          <PrivacyPolicyLink className="text-gray-500 hover:text-gray-400" />
          <span className="mx-2 text-gray-700">·</span>
          <span className="text-gray-600">
            Policy v{privacyPolicyMeta.version} · {privacyPolicyMeta.effectiveDate}
          </span>
        </footer>
      </main>

      <ApiConfigBanner />

      <div className="fixed bottom-10 left-10 z-[100]">
        <AppButton
          onClick={() => setIsBuyAdvisorOpen(true)}
          variant="floating"
          size="icon"
          className="h-14 w-14 rounded-full shadow-2xl"
        >
          <Camera size={24} />
        </AppButton>
      </div>

      <ZappBot />
      <BuyAdvisorModal isOpen={isBuyAdvisorOpen} onClose={() => setIsBuyAdvisorOpen(false)} />
    </PanelProvider>
  );
}

