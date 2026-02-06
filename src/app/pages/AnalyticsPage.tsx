import { motion } from "motion/react";
import { TrendingUp, ZapOff, ChevronRight } from "lucide-react";
import { ElectricCard } from "../components/ElectricCard";
import { COLORS } from "../theme";

export function AnalyticsPage() {
  return (
    <div className="space-y-12 pb-32 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        <div className="lg:col-span-8 space-y-8">
          <ElectricCard semanticColor={COLORS.electricBlue} className="relative z-20">
            <div className="flex items-center justify-between mb-16">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">Utility Overlap Analysis</h3>
                <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black mt-2">Subscription Stacking</div>
              </div>
            </div>
            <div className="space-y-14 px-4">
              {[
                { name: "Development Tools", val: 85, color: COLORS.electricGreen, sub: "Essential Utility" },
                { name: "Content Streaming", val: 32, color: COLORS.electricRed, sub: "High Overlap Risk" },
                { name: "Lifestyle Apps", val: 58, color: COLORS.electricBlue, sub: "Healthy Engagement" },
              ].map((bar, i) => (
                <div key={i} className="space-y-5">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-2xl font-black text-white tracking-tight">{bar.name}</div>
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{bar.sub}</div>
                    </div>
                    <div className="text-4xl font-black" style={{ color: bar.color, filter: `drop-shadow(0 0 10px ${bar.color}60)` }}>
                      {bar.val}%
                    </div>
                  </div>
                  <div className="h-5 bg-white/[0.03] rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.val}%` }}
                      transition={{ duration: 2, delay: i * 0.3, ease: [0.23, 1, 0.32, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: bar.color, boxShadow: `0 0 25px ${bar.color}` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ElectricCard>

          <div className="relative h-[400px]">
            <ElectricCard semanticColor={COLORS.electricCyan} className="absolute inset-0 z-10 translate-y-8 translate-x-4 opacity-40 grayscale pointer-events-none" elevation={0}>
              <div className="h-40" />
            </ElectricCard>
            <ElectricCard semanticColor={COLORS.electricCyan} className="absolute inset-0 z-30">
              <h3 className="text-2xl font-black mb-10 tracking-tight">Transaction History</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="group flex items-center justify-between p-6 hover:bg-white/[0.02] rounded-[2.5rem] transition-all cursor-pointer border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-8">
                      <div className="w-2 h-2 rounded-full shadow-[0_0_12px_#22F0FF]" style={{ backgroundColor: COLORS.electricCyan }} />
                      <span className="text-xl font-black text-gray-200 group-hover:text-cyan-400 transition-colors tracking-tight">AWS Infrastructure</span>
                    </div>
                    <div className="flex items-center gap-12">
                      <span className="text-2xl font-black text-white">$12.45</span>
                      <ChevronRight size={20} className="text-gray-800" />
                    </div>
                  </div>
                ))}
              </div>
            </ElectricCard>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="flex items-center gap-2 px-6">
            <div className="w-1.5 h-1.5 bg-electric-purple rounded-full" style={{ backgroundColor: COLORS.electricPurple }} />
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-600 font-black">Zapp CFO Intelligence</h3>
          </div>

          <ElectricCard className="p-10 border-l-4" style={{ borderLeftColor: COLORS.electricGreen }} semanticColor={COLORS.electricGreen} elevation={1}>
            <div className="flex items-center gap-5 mb-8">
              <div className="p-4 rounded-2xl" style={{ backgroundColor: `${COLORS.electricGreen}10` }}>
                <TrendingUp size={28} style={{ color: COLORS.electricGreen }} />
              </div>
              <h4 className="font-black text-2xl tracking-tight">Efficiency Insight</h4>
            </div>
            <p className="text-lg text-gray-400 leading-relaxed font-medium">
              "Your ChatGPT Plus usage has reached <span className="text-white font-black">$0.14/query</span>. This aligns perfectly with your goals."
            </p>
          </ElectricCard>

          <ElectricCard className="p-10 border-l-4" style={{ borderLeftColor: COLORS.electricRed }} semanticColor={COLORS.electricRed} elevation={1}>
            <div className="flex items-center gap-5 mb-8">
              <div className="p-4 rounded-2xl" style={{ backgroundColor: `${COLORS.electricRed}10` }}>
                <ZapOff size={28} style={{ color: COLORS.electricRed }} />
              </div>
              <h4 className="font-black text-2xl tracking-tight">Low Value Item</h4>
            </div>
            <p className="text-lg text-gray-400 leading-relaxed font-medium">
              "Your Disney+ utility has dropped 80% this month. Cost per hour is now <span className="text-white font-black">$12.40</span>."
            </p>
          </ElectricCard>
        </div>
      </div>
    </div>
  );
}
