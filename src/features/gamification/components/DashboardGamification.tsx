import * as React from "react";
import { Link } from "react-router-dom";
import { Award, Calendar, Flame, Trophy, Users } from "lucide-react";

import { GamificationAPI, type Group, type StreakData, type UserBadge } from "@/api/gamification.api";
import { BadgeDisplay } from "@/features/gamification/components/BadgeDisplay";
import { MonthlyTargetsWidget } from "@/features/gamification/components/MonthlyTargetsWidget";
import { ElectricCard } from "@/features/home/components/ElectricCard";
import { AppButton, EmptyState, IconBadge, LoadingState } from "@/shared/components/system";
import { COLORS } from "@/shared/theme";
import { toast } from "sonner";

export function DashboardGamification() {
  const [streak, setStreak] = React.useState<StreakData | null>(null);
  const [badges, setBadges] = React.useState<UserBadge[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [currentRank, setCurrentRank] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submittingReview, setSubmittingReview] = React.useState<"weekly" | "monthly" | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [streakResult, badgesResult, groupsResult] = await Promise.allSettled([
        GamificationAPI.getMyStreak(),
        GamificationAPI.getUserBadges(),
        GamificationAPI.getGroups(),
      ]);

      const streakData = streakResult.status === "fulfilled" ? streakResult.value : null;
      const badgeData = badgesResult.status === "fulfilled" ? badgesResult.value : [];
      const groupData = groupsResult.status === "fulfilled" ? groupsResult.value : [];

      setStreak(streakData);
      setBadges(badgeData);
      setGroups(groupData);

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

  const handleReview = async (kind: "weekly" | "monthly") => {
    try {
      setSubmittingReview(kind);
      if (kind === "weekly") {
        await GamificationAPI.completeWeeklyReview();
        toast.success("Weekly review completed. +20 points");
      } else {
        await GamificationAPI.completeMonthlyReview();
        toast.success("Monthly review completed. +35 points");
      }
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to complete ${kind} review.`);
    } finally {
      setSubmittingReview(null);
    }
  };

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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ElectricCard semanticColor={COLORS.electricGreen} elevation={1} className="xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <IconBadge tone="green" size="sm">
              <Calendar size={18} />
            </IconBadge>
            <h3 className="app-card-title">Review Actions</h3>
          </div>
          <p className="app-helper mb-6 leading-relaxed">
            Keep your weekly and monthly reviews current so your progress stays visible.
          </p>
          <div className="space-y-3">
              <AppButton
                onClick={() => handleReview("weekly")}
                disabled={submittingReview !== null}
                variant="success"
                className="w-full"
              >
              {submittingReview === "weekly" ? "Completing..." : "Complete Weekly Review"}
            </AppButton>
              <AppButton
                onClick={() => handleReview("monthly")}
                disabled={submittingReview !== null}
                variant="info"
                className="w-full"
              >
              {submittingReview === "monthly" ? "Completing..." : "Complete Monthly Review"}
            </AppButton>
          </div>
        </ElectricCard>

        <ElectricCard semanticColor={COLORS.electricYellow} elevation={1} className="xl:col-span-2">
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
            <EmptyState
              icon={<Award size={28} />}
              title="No badges unlocked yet."
              description="Logging purchases and reflections will start the cabinet."
            />
          )}
        </ElectricCard>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <MonthlyTargetsWidget />
      </div>
    </div>
  );
}
