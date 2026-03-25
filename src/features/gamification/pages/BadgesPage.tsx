import * as React from "react";
import { Award } from "lucide-react";

import { GamificationAPI, type UserBadge } from "@/api/gamification.api";
import { BadgeGrid } from "@/features/gamification/components/BadgeDisplay";
import { ElectricCard } from "@/features/home/components/ElectricCard";
import { toast } from "sonner";

export function BadgesPage() {
  const [badges, setBadges] = React.useState<UserBadge[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    GamificationAPI.getUserBadges()
      .then((data) => {
        if (!cancelled) setBadges(data);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) toast.error("Failed to load badges.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8 pb-32">
      <div>
        <h1 className="flex items-center gap-3 text-5xl font-black tracking-tighter text-white">
          <Award size={34} className="text-yellow-400" />
          Badge Cabinet
        </h1>
        <p className="mt-2 text-lg font-medium text-gray-500">
          Earned milestones that reinforce intentional behavior.
        </p>
      </div>

      {loading && (
        <ElectricCard elevation={0}>
          <div className="py-16 text-center text-xs font-black uppercase tracking-[0.3em] text-gray-600">
            Loading badges...
          </div>
        </ElectricCard>
      )}

      {!loading && badges.length === 0 && (
        <ElectricCard elevation={0}>
          <div className="py-16 text-center">
            <Award size={40} className="mx-auto mb-4 text-gray-700" />
            <div className="font-bold text-gray-400">No badges earned yet.</div>
          </div>
        </ElectricCard>
      )}

      {!loading && badges.length > 0 && <BadgeGrid badges={badges} />}
    </div>
  );
}
