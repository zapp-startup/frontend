import { MonthlyTargetsWidget } from "@/features/gamification/components/MonthlyTargetsWidget";

export function TargetsPage() {
  return (
    <div className="space-y-8 pb-32">
      <div>
        <h1 className="text-5xl font-black tracking-tighter text-white">Monthly Targets</h1>
        <p className="mt-2 text-lg font-medium text-gray-500">
          Set habit goals and track progress against the month in flight.
        </p>
      </div>
      <MonthlyTargetsWidget />
    </div>
  );
}
