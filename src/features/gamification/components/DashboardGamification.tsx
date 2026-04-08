import * as React from "react";
import { Link } from "react-router-dom";
import { Award, Calendar, Flame, Target, Trophy, Users } from "lucide-react";

import {
  GamificationAPI,
  type Group,
  type ReviewNudges,
  type StreakData,
  type UserBadge,
} from "@/api/gamification.api";
import { BadgeDisplay } from "@/features/gamification/components/BadgeDisplay";
import { MonthlyTargetsWidget } from "@/features/gamification/components/MonthlyTargetsWidget";
import { ElectricCard } from "@/features/home/components/ElectricCard";
import { AppButton, IconBadge, LoadingState, Surface } from "@/shared/components/system";
import { COLORS } from "@/shared/theme";
import { toast } from "sonner";

export function DashboardGamification() {
  const [streak, setStreak] = React.useState<StreakData | null>(null);
  const [badges, setBadges] = React.useState<UserBadge[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [currentRank, setCurrentRank] = React.useState<number | null>(null);
  const [reviewNudges, setReviewNudges] = React.useState<ReviewNudges | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [streakResult, badgesResult, groupsResult, nudgesResult] = await Promise.allSettled([
        GamificationAPI.getMyStreak(),
        GamificationAPI.getUserBadges(),
        GamificationAPI.getGroups(),
        GamificationAPI.getReviewNudges(),
      ]);

      const streakData = streakResult.status === "fulfilled" ? streakResult.value : null;
      const badgeData = badgesResult.status === "fulfilled" ? badgesResult.value : [];
      const groupData = groupsResult.status === "fulfilled" ? groupsResult.value : [];
      const nudgeData = nudgesResult.status === "fulfilled" ? nudgesResult.value : null;

      setStreak(streakData);
      setBadges(badgeData);
      setGroups(groupData);
      setReviewNudges(nudgeData);

      if (!streakData) {
        setLoadError("Streak data is not loading from the backend yet.");
      }

      if (groupData[0]) {
        try {
          const leaderboard = await GamificationAPI.getLeaderboard(groupData[0].id, 7, 1, 10);
          setCurrentRank(leaderboard.current_user_rank);
        } catch (error) {
          console.error(error);
          setCurrentRank(null);
        }
      } else {
        setCurrentRank(null);
      }
    } catch (error) {
      console.error(error);
      setLoadError("Gamification data failed to load.");
      toast.error("Failed to load gamification overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return (
      <LoadingState label="Loading momentum systems..." lines={3} />
    );
  }

  if (!streak) {
    return (
      <ElectricCard semanticColor={COLORS.electricYellow} elevation={1}>
        <div className="space-y-3 py-2">
          <div className="app-eyebrow">Gamification</div>
          <div className="app-section-title text-[1.75rem]">Waiting on backend data</div>
          <div className="app-helper max-w-2xl">
            {loadError ?? "The dashboard could not fetch streak and level data yet."}
          </div>
        </div>
      </ElectricCard>
    );
  }

  const levelProgress = streak.next_level_points > streak.level_floor_points
    ? (streak.points_into_level / (streak.next_level_points - streak.level_floor_points)) * 100
    : 0;
  const weeklyNudge = reviewNudges?.weekly ?? null;
  const monthlyNudge = reviewNudges?.monthly ?? null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
        <ElectricCard semanticColor={COLORS.electricCyan} elevation={1} className="h-full">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <IconBadge tone="yellow" size="sm">
                  <Flame size={18} />
                </IconBadge>
                <div className="app-eyebrow">Streak</div>
              </div>
              <div className="text-5xl font-black text-[var(--app-color-text-primary)]">
                {streak.current_streak_days}
                <span className="ml-2 text-2xl text-[var(--app-color-text-tertiary)]">days</span>
              </div>
              <div className="mt-2 text-xs font-bold text-[var(--app-color-text-tertiary)]">
                Best: {streak.best_streak_days} days
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-[var(--app-accent-cyan-soft)]">Lv {streak.level}</div>
              <div className="app-eyebrow">Level</div>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--app-color-text-secondary)]">
            <span>Progress to next level</span>
            <span className="text-[var(--app-color-text-primary)]">
              {streak.points_into_level} / {streak.next_level_points - streak.level_floor_points}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--app-color-surface-inset)]">
            <div
              className="h-full rounded-full bg-[var(--app-accent-cyan-soft)]"
              style={{ width: `${Math.min(100, Math.max(0, levelProgress))}%` }}
            />
          </div>
        </ElectricCard>

        <ElectricCard semanticColor={COLORS.electricYellow} elevation={1} className="h-full">
          <div className="mb-2 flex items-center gap-2">
            <IconBadge tone="yellow" size="sm">
              <Trophy size={18} />
            </IconBadge>
            <div className="app-eyebrow">Lifetime Points</div>
          </div>
          <div className="text-5xl font-black text-[var(--app-color-text-primary)]">
            {streak.total_points_earned.toLocaleString()}
          </div>
          <div className="mt-2 text-xs font-bold text-[var(--app-color-text-tertiary)]">
            Total points earned from meaningful actions
          </div>
        </ElectricCard>

        <Link to="/circles" className="block h-full">
          <ElectricCard semanticColor={COLORS.electricPurple} elevation={1} className="h-full cursor-pointer">
            <div className="mb-2 flex items-center gap-2">
              <IconBadge tone="purple" size="sm">
                <Users size={18} />
              </IconBadge>
              <div className="app-eyebrow">Circles</div>
            </div>
            <div className="text-3xl font-black text-[var(--app-color-text-primary)]">
              {groups.length > 0 ? `${groups.length} joined` : "No circles"}
            </div>
            <div className="mt-2 text-xs font-bold text-[var(--app-color-text-tertiary)]">
              {currentRank ? `Current weekly rank: #${currentRank}` : "Join a circle to unlock leaderboards"}
            </div>
          </ElectricCard>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <ElectricCard semanticColor={COLORS.electricGreen} elevation={1} className="xl:col-span-1">
          <div className="mb-6 flex items-center gap-2">
            <IconBadge tone="green" size="sm">
              <Calendar size={18} />
            </IconBadge>
            <h3 className="app-card-title">Review Actions</h3>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-gray-400">
            Weekly and monthly reviews now open guided flows that collect purchase feedback before points are awarded.
          </p>
          <div className="space-y-3">
            <div className="rounded-[1.8rem] border border-white/[0.05] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-white">Weekly review</div>
                  <div className="mt-1 text-xs font-bold text-gray-500">
                    {weeklyNudge
                      ? `${weeklyNudge.reviewed_transaction_count} reviewed · ${weeklyNudge.pending_transaction_feedback_count} still worth revisiting`
                      : "Review last week’s purchases and reflections."}
                  </div>
                </div>
                <AppButton asChild className="rounded-2xl bg-green-500 text-white hover:bg-green-400">
                  <Link to="/reviews/weekly">
                    {weeklyNudge?.status === "completed" ? "View review" : "Start weekly"}
                  </Link>
                </AppButton>
              </div>
            </div>
            <div className="rounded-[1.8rem] border border-white/[0.05] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-white">Monthly review</div>
                  <div className="mt-1 text-xs font-bold text-gray-500">
                    {monthlyNudge
                      ? `${monthlyNudge.reviewed_transaction_count} reviewed · ${monthlyNudge.upcoming_subscription_renewals_count ?? 0} renewals to inspect`
                      : "Review bigger purchases, subscriptions, and next-month focus."}
                  </div>
                </div>
                <AppButton asChild className="rounded-2xl bg-blue-500 text-white hover:bg-blue-400">
                  <Link to="/reviews/monthly">
                    {monthlyNudge?.status === "completed" ? "View review" : "Start monthly"}
                  </Link>
                </AppButton>
              </div>
            </div>
          </div>
        </ElectricCard>

        <ElectricCard semanticColor={COLORS.electricYellow} elevation={1} className="self-start xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBadge tone="yellow" size="sm">
                <Award size={18} />
              </IconBadge>
              <h3 className="app-card-title">Recent Badges</h3>
            </div>
            <Link to="/badges">
              <AppButton variant="outline" size="sm">
                View all
              </AppButton>
            </Link>
          </div>
          {badges.length > 0 ? (
            <BadgeDisplay badges={badges} maxDisplay={6} size="lg" />
          ) : (
            <Surface
              variant="panel"
              padding="md"
              className="flex min-h-[7.5rem] flex-col items-center justify-center rounded-[2.5rem] px-6 py-5 text-center"
            >
              <div className="mb-2 flex justify-center text-[var(--app-color-text-tertiary)]">
                <Award size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="app-card-title">No badges unlocked yet.</h4>
                <p className="app-helper mx-auto max-w-2xl">Logging purchases and reflections will start the cabinet.</p>
              </div>
            </Surface>
          )}
        </ElectricCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <MonthlyTargetsWidget compact />
        <ElectricCard semanticColor={COLORS.electricBlue} elevation={1}>
          <div className="mb-3 flex items-center gap-2">
            <Target size={18} className="text-blue-400" />
            <h3 className="text-lg font-black text-white">Monthly Focus</h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            Use monthly targets to set the habit you want to reinforce most this cycle.
          </p>
          {monthlyNudge ? (
            <div className="mt-4 rounded-[1.5rem] border border-white/[0.05] bg-white/[0.02] p-4 text-xs font-bold text-gray-500">
              {monthlyNudge.low_value_subscriptions_count ?? 0} low-value subscriptions and{" "}
              {monthlyNudge.pending_transaction_feedback_count} pending transaction reviews are feeding this month’s reflection flow.
            </div>
          ) : null}
          <AppButton asChild variant="outline" className="mt-5 rounded-2xl border-white/10">
            <Link to="/targets">
              Open targets
            </Link>
          </AppButton>
        </ElectricCard>
      </div>
    </div>
  );
}
