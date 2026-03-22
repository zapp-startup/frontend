import * as React from "react";
import { Link } from "react-router-dom";
import { Award, Calendar, Flame, Target, Trophy, Users } from "lucide-react";

import { GamificationAPI, type Group, type StreakData, type UserBadge } from "@/api/gamification.api";
import { BadgeDisplay } from "@/features/gamification/components/BadgeDisplay";
import { MonthlyTargetsWidget } from "@/features/gamification/components/MonthlyTargetsWidget";
import { ElectricCard } from "@/features/home/components/ElectricCard";
import { Button } from "@/shared/components/ui/button";
import { COLORS } from "@/shared/theme";
import { toast } from "sonner";

export function DashboardGamification() {
  const [streak, setStreak] = React.useState<StreakData | null>(null);
  const [badges, setBadges] = React.useState<UserBadge[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [currentRank, setCurrentRank] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submittingReview, setSubmittingReview] = React.useState<"weekly" | "monthly" | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [streakData, badgeData, groupData] = await Promise.all([
        GamificationAPI.getMyStreak(),
        GamificationAPI.getUserBadges(),
        GamificationAPI.getGroups(),
      ]);

      setStreak(streakData);
      setBadges(badgeData);
      setGroups(groupData);

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
      <ElectricCard semanticColor={COLORS.electricCyan} elevation={1}>
        <div className="py-10 text-center text-xs font-black uppercase tracking-[0.3em] text-gray-600">
          Loading momentum systems...
        </div>
      </ElectricCard>
    );
  }

  if (!streak) {
    return null;
  }

  const levelProgress = streak.next_level_points > streak.level_floor_points
    ? (streak.points_into_level / (streak.next_level_points - streak.level_floor_points)) * 100
    : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ElectricCard semanticColor={COLORS.electricCyan} elevation={2}>
          <div className="mb-5 flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Flame size={18} className="text-orange-400" />
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Streak</div>
              </div>
              <div className="text-5xl font-black text-white">
                {streak.current_streak_days}
                <span className="ml-2 text-2xl text-gray-500">days</span>
              </div>
              <div className="mt-2 text-xs font-bold text-gray-500">Best: {streak.best_streak_days} days</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-cyan-300">Lv {streak.level}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-600">Level</div>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-gray-400">
            <span>Progress to next level</span>
            <span className="text-white">{streak.points_into_level} / {streak.next_level_points - streak.level_floor_points}</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full bg-cyan-500"
              style={{ width: `${Math.min(100, Math.max(0, levelProgress))}%` }}
            />
          </div>
        </ElectricCard>

        <ElectricCard semanticColor={COLORS.electricYellow} elevation={1}>
          <div className="mb-2 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" />
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Lifetime Points</div>
          </div>
          <div className="text-5xl font-black text-white">{streak.total_points_earned.toLocaleString()}</div>
          <div className="mt-2 text-xs font-bold text-gray-500">Total points earned from meaningful actions</div>
        </ElectricCard>

        <Link to="/circles">
          <ElectricCard semanticColor={COLORS.electricPurple} elevation={1} className="h-full cursor-pointer">
            <div className="mb-2 flex items-center gap-2">
              <Users size={18} className="text-purple-400" />
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Circles</div>
            </div>
            <div className="text-3xl font-black text-white">
              {groups.length > 0 ? `${groups.length} joined` : "No circles"}
            </div>
            <div className="mt-2 text-xs font-bold text-gray-500">
              {currentRank ? `Current weekly rank: #${currentRank}` : "Join a circle to unlock leaderboards"}
            </div>
          </ElectricCard>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ElectricCard semanticColor={COLORS.electricGreen} elevation={1} className="xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-green-400" />
            <h3 className="text-lg font-black text-white">Review Actions</h3>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-gray-400">
            Lock in weekly and monthly reflection habits to keep momentum compounding.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => handleReview("weekly")}
              disabled={submittingReview !== null}
              className="w-full rounded-2xl bg-green-500 text-white hover:bg-green-400"
            >
              {submittingReview === "weekly" ? "Completing..." : "Complete Weekly Review"}
            </Button>
            <Button
              onClick={() => handleReview("monthly")}
              disabled={submittingReview !== null}
              className="w-full rounded-2xl bg-blue-500 text-white hover:bg-blue-400"
            >
              {submittingReview === "monthly" ? "Completing..." : "Complete Monthly Review"}
            </Button>
          </div>
        </ElectricCard>

        <ElectricCard semanticColor={COLORS.electricYellow} elevation={1} className="xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-yellow-400" />
              <h3 className="text-lg font-black text-white">Recent Badges</h3>
            </div>
            <Link to="/badges">
              <Button variant="outline" className="rounded-2xl border-white/10">
                View all
              </Button>
            </Link>
          </div>
          {badges.length > 0 ? (
            <BadgeDisplay badges={badges} maxDisplay={6} size="lg" />
          ) : (
            <div className="rounded-[1.8rem] border border-white/[0.05] bg-white/[0.02] p-8 text-sm font-bold text-gray-500">
              No badges unlocked yet. Logging purchases and reflections will start the cabinet.
            </div>
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
          <Link to="/targets" className="mt-5 inline-flex">
            <Button variant="outline" className="rounded-2xl border-white/10">
              Open targets
            </Button>
          </Link>
        </ElectricCard>
      </div>
    </div>
  );
}
