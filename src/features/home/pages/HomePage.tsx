import * as React from "react";
import { motion } from "motion/react";
import { TrendingUp, AlertCircle, Sparkles, TrendingDown, ChevronRight } from "lucide-react";
import { useMergedTransactions } from "@/features/transactions/hooks/useMergedTransactions";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/components/ui/utils";
import { ElectricCard, ReflectionPulse } from "../components/ElectricCard";
import { COLORS, GLOWS } from "@/shared/theme";

export function HomePage() {
  const [pulseActive, setPulseActive] = React.useState(false);

  const triggerPulse = () => {
    setPulseActive(true);
    setTimeout(() => setPulseActive(false), 1200);
    toast.success("Reflection complete. Streak maintained!", {
      style: { background: COLORS.bgCard, color: COLORS.electricGreen, border: `1px solid ${COLORS.electricGreen}33` },
    });
  };

  const { transactions, loading: txLoading } = useMergedTransactions({ limit: 6 });

  return (
    <div className="space-y-12 pb-32 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <ElectricCard className="md:col-span-8 overflow-hidden" semanticColor={COLORS.electricBlue} elevation={2}>
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_#3B82FF]" style={{ backgroundColor: COLORS.electricBlue }} />
                <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">Financial Health</h2>
              </div>
              <div className="text-6xl font-black tracking-tight text-white">$2,450.00</div>
              <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
                <TrendingUp size={16} className="text-electric-green" style={{ color: COLORS.electricGreen }} />
                <span>Monthly spending is 12% more intentional</span>
              </div>
            </div>
            <div className="relative group/meter">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/[0.03]" />
                <motion.circle
                  cx="80" cy="80" r="72"
                  stroke={COLORS.electricGreen}
                  strokeWidth="12"
                  strokeDasharray={452}
                  initial={{ strokeDashoffset: 452 }}
                  animate={{ strokeDashoffset: 452 * (1 - 0.88) }}
                  transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ filter: `drop-shadow(0 0 12px ${COLORS.electricGreen}80)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">88</span>
                <span className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Value Score</span>
              </div>
              <div className="absolute inset-0 rounded-full bg-electric-green/5 blur-3xl -z-10 group-hover:bg-electric-green/10 transition-colors" />
            </div>
          </div>
          <div className="h-48 mt-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { n: "1", v: 400 }, { n: "2", v: 380 }, { n: "3", v: 520 }, { n: "4", v: 450 }, { n: "5", v: 600 }, { n: "6", v: 580 }, { n: "7", v: 720 }
              ]}>
                <defs>
                  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.electricBlue} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.electricBlue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={COLORS.electricBlue} strokeWidth={4} fill="url(#areaGlow)" animationDuration={2500} />
                <Tooltip contentStyle={{ backgroundColor: COLORS.bgCard, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px" }} itemStyle={{ color: COLORS.electricBlue, fontWeight: "900" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ElectricCard>
        <div className="md:col-span-4 flex flex-col gap-8">
          <ElectricCard className="flex-1 flex flex-col justify-center gap-2" semanticColor={COLORS.electricCyan} glowIntensity="soft" elevation={1}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5" style={{ backgroundColor: `${COLORS.electricCyan}15`, boxShadow: GLOWS.soft(COLORS.electricCyan) }}>
                <TrendingUp size={28} style={{ color: COLORS.electricCyan }} />
              </div>
              <div>
                <div className="text-4xl font-black text-white">12 Days</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Intentional Streak</div>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} className="h-full rounded-full" style={{ backgroundColor: COLORS.electricCyan, boxShadow: `0 0 10px ${COLORS.electricCyan}` }} />
            </div>
          </ElectricCard>
          <ElectricCard className="flex-1 flex flex-col justify-center gap-2" semanticColor={COLORS.electricRed} elevation={1}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5" style={{ backgroundColor: `${COLORS.electricRed}15`, boxShadow: GLOWS.soft(COLORS.electricRed) }}>
                <AlertCircle size={28} style={{ color: COLORS.electricRed }} />
              </div>
              <div>
                <div className="text-4xl font-black text-white">3 Alerts</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Spending Alerts</div>
              </div>
            </div>
          </ElectricCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <ElectricCard className="lg:col-span-4" semanticColor={COLORS.electricTeal} elevation={1}>
          <div className="flex items-center gap-2 mb-10">
            <Sparkles size={16} style={{ color: COLORS.electricTeal }} />
            <h3 className="text-lg font-black text-white">Category Breakdown</h3>
          </div>
          <div className="h-64 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-electric-teal/5 blur-3xl rounded-full" style={{ backgroundColor: `${COLORS.electricTeal}10` }} />
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "High Value", value: 65, color: COLORS.electricGreen },
                    { name: "Regret", value: 15, color: COLORS.electricRed },
                    { name: "Utility", value: 20, color: COLORS.electricBlue },
                  ]}
                  innerRadius={75}
                  outerRadius={95}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {[0, 1, 2].map((i) => (
                    <Cell key={i} fill={[COLORS.electricGreen, COLORS.electricRed, COLORS.electricBlue][i]} style={{ filter: `drop-shadow(0 0 8px ${[COLORS.electricGreen, COLORS.electricRed, COLORS.electricBlue][i]}40)` }} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Status</div>
              <div className="text-xl font-black text-white">Optimized</div>
            </div>
          </div>
          <div className="mt-12 space-y-3">
            {[
              { label: "Intentionality", val: 88, color: COLORS.electricGreen },
              { label: "Regret Risk", val: 12, color: COLORS.electricRed },
              { label: "Utility Focus", val: 74, color: COLORS.electricBlue },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">{stat.label}</span>
                <span className="text-lg font-black" style={{ color: stat.color }}>{stat.val}%</span>
              </div>
            ))}
          </div>
        </ElectricCard>

        <ElectricCard className="lg:col-span-8 overflow-hidden" semanticColor={COLORS.electricGreen} elevation={1}>
          <ReflectionPulse active={pulseActive} />
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black">Recent Spending History</h3>
            <button className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 border-b border-cyan-400/30 pb-1">View Timeline</button>
          </div>
          <div className="space-y-4">
            {txLoading && (
  <div className="text-center py-12 text-gray-600 text-xs font-black uppercase tracking-widest animate-pulse">
    Loading transactions...
  </div>
)}

{!txLoading && transactions.length === 0 && (
  <div className="text-center py-12 space-y-3">
    <div className="text-gray-600 text-xs font-black uppercase tracking-widest">No purchases logged yet</div>
    <div className="text-gray-700 text-xs">Add your first purchase to start tracking your value score.</div>
  </div>
)}

{!txLoading && transactions.map((item) => {
  const score = item.satisfaction_rating != null
    ? item.satisfaction_rating * 10
    : item.impulse_score != null
    ? Math.round((1 - item.impulse_score) * 100)
    : null;

  const isRegret = item.regret_score != null
    ? item.regret_score > 0.5
    : score != null && score < 50;

  const timeAgo = (() => {
    const diff = Date.now() - new Date(item.occurred_at).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  })();

  return (
    <div
      key={item.id}
      onClick={triggerPulse}
      className="group relative flex items-center justify-between p-6 rounded-[2.5rem] bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-8">
        <div
          className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center border transition-all group-hover:scale-110"
          style={{
            color: isRegret ? COLORS.electricRed : COLORS.electricGreen,
            backgroundColor: isRegret ? `${COLORS.electricRed}15` : `${COLORS.electricGreen}15`,
            borderColor: isRegret ? `${COLORS.electricRed}33` : `${COLORS.electricGreen}33`,
            boxShadow: isRegret ? GLOWS.soft(COLORS.electricRed) : GLOWS.soft(COLORS.electricGreen),
          }}
        >
          {isRegret ? <TrendingDown size={32} /> : <TrendingUp size={32} />}
        </div>
        <div>
          <div className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight">
            {item.description_raw || item.category}
          </div>
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-2">
            {timeAgo} • ${Number(item.amount).toFixed(2)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-10">
        <div className="text-right">
          {score != null ? (
            <>
              <div
                className="text-4xl font-black tracking-tighter"
                style={{
                  color: score > 70 ? COLORS.electricGreen : COLORS.electricRed,
                  filter: `drop-shadow(0 0 10px ${score > 70 ? COLORS.electricGreen : COLORS.electricRed}80)`,
                }}
              >
                {score}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-gray-600 font-black">Score</div>
            </>
          ) : (
            <div className="text-[10px] uppercase tracking-widest text-gray-700 font-black">No score</div>
          )}
        </div>
        <ChevronRight size={24} className="text-gray-800 group-hover:text-cyan-400 transition-colors" />
      </div>
    </div>
  );
})}
          </div>
        </ElectricCard>
      </div>
    </div>
  );
}
