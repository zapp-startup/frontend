import * as React from "react";
import { motion } from "motion/react";
import {
  Award,
  Brain,
  CalendarCheck2,
  Crown,
  Medal,
  Receipt,
  Search,
  Shield,
  Target,
  Trophy,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import type { Badge, UserBadge } from "@/api/gamification.api";
import { COLORS, GLOWS } from "@/shared/theme";
import { cn } from "@/shared/components/ui/utils";

type BadgeDisplayProps = {
  badges: UserBadge[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
};

const ICON_MAP: Record<string, LucideIcon> = {
  advisor: Zap,
  anvil: Trophy,
  archive: Award,
  arrow_up: Trophy,
  brain: Brain,
  broom: Shield,
  calendar_check: CalendarCheck2,
  calendar_star: CalendarCheck2,
  calendar: CalendarCheck2,
  card_plus: Wallet,
  cards: Wallet,
  clipboard: Award,
  compass: Search,
  crown: Crown,
  gem: Trophy,
  hourglass: Target,
  journal: Receipt,
  medal: Medal,
  pause: Shield,
  receipt: Receipt,
  search: Search,
  shield: Shield,
  shuffle: Search,
  spark: Zap,
  strategy: Target,
  target: Target,
  trophy: Trophy,
  users: Users,
  wallet: Wallet,
};

const CATEGORY_COLORS: Record<string, string> = {
  onboarding: COLORS.electricYellow,
  transactions: COLORS.electricBlue,
  reflections: COLORS.electricGreen,
  advisor: COLORS.electricCyan,
  subscriptions: COLORS.electricRed,
  social: COLORS.electricPurple,
  streaks: COLORS.electricTeal,
  monthly_goals: COLORS.electricYellow,
  improvement: COLORS.electricGreen,
};

function normalizeIconName(icon: string | undefined) {
  return (icon ?? "award").replace(/-/g, "_");
}

function getBadgeColor(badge: Badge) {
  return CATEGORY_COLORS[badge.category] ?? COLORS.electricYellow;
}

function getBadgeIcon(badge: Badge) {
  return ICON_MAP[normalizeIconName(badge.icon)] ?? Award;
}

export function BadgeDisplay({ badges, maxDisplay, size = "md" }: BadgeDisplayProps) {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remaining = maxDisplay && badges.length > maxDisplay ? badges.length - maxDisplay : 0;
  const [activeBadgeId, setActiveBadgeId] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: "h-10 w-10 rounded-2xl",
    md: "h-14 w-14 rounded-[1.2rem]",
    lg: "h-[4.5rem] w-[4.5rem] rounded-[1.4rem]",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 28,
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {displayBadges.map((userBadge, idx) => {
        const badge = userBadge.badge;
        const Icon = getBadgeIcon(badge);
        const color = getBadgeColor(badge);

        return (
          <motion.div
            key={userBadge.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.05, duration: 0.25 }}
            className="relative"
          >
            <button
              type="button"
              aria-label={`${badge.name} badge details`}
              aria-expanded={activeBadgeId === userBadge.id}
              className={cn(
                "peer flex items-center justify-center border-2 transition-transform hover:scale-105 focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70",
                sizeClasses[size],
              )}
              onMouseEnter={() => setActiveBadgeId(userBadge.id)}
              onMouseLeave={() => setActiveBadgeId((current) => (current === userBadge.id ? null : current))}
              onFocus={() => setActiveBadgeId(userBadge.id)}
              onBlur={() => setActiveBadgeId((current) => (current === userBadge.id ? null : current))}
              style={{
                backgroundColor: `${color}12`,
                borderColor: `${color}35`,
                boxShadow: GLOWS.soft(color),
              }}
            >
              <Icon size={iconSizes[size]} style={{ color }} />
            </button>
            <div
              data-testid={`badge-tooltip-${userBadge.id}`}
              className={cn(
                "pointer-events-none absolute bottom-full left-1/2 z-30 mb-3 min-w-[220px] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#101A2E] p-4 shadow-2xl transition-opacity",
                activeBadgeId === userBadge.id ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="mb-1 flex items-center gap-2">
                <Icon size={14} style={{ color }} />
                <span className="text-sm font-black text-white">{badge.name}</span>
              </div>
              <p className="text-xs leading-relaxed text-gray-400">{badge.description}</p>
              <div className="mt-3 text-[9px] font-black uppercase tracking-[0.25em] text-gray-600">
                Earned {new Date(userBadge.awarded_at).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        );
      })}

      {remaining > 0 && (
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-white/10 bg-white/[0.04] text-xs font-black text-gray-500">
          +{remaining}
        </div>
      )}
    </div>
  );
}

export function BadgeGrid({ badges }: { badges: UserBadge[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {badges.map((userBadge, idx) => {
        const badge = userBadge.badge;
        const Icon = getBadgeIcon(badge);
        const color = getBadgeColor(badge);

        return (
          <motion.div
            key={userBadge.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.03, duration: 0.35 }}
            className="rounded-[2rem] border border-white/[0.05] bg-[#101A2E] p-6"
            style={{ boxShadow: `${GLOWS.ambient(0.5)}, ${GLOWS.soft(color)}` }}
          >
            <div
              className="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] border-2"
              style={{
                backgroundColor: `${color}12`,
                borderColor: `${color}35`,
              }}
            >
              <Icon size={28} style={{ color }} />
            </div>
            <h3 className="mb-2 text-lg font-black text-white">{badge.name}</h3>
            <p className="min-h-12 text-sm leading-relaxed text-gray-400">{badge.description}</p>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-gray-600">
              {badge.category.replaceAll("_", " ")}
            </div>
            <div className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-400">
              {new Date(userBadge.awarded_at).toLocaleDateString()}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
