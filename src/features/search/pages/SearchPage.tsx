import * as React from "react";
import { Search, Zap, TrendingDown } from "lucide-react";
import { ElectricCard } from "@/features/home";
import { COLORS } from "@/shared/theme";

export function SearchPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-20 py-10">
      <div className="text-center space-y-6">
        <h2 className="text-6xl font-black tracking-tighter text-white">Decision Engine</h2>
        <p className="text-gray-500 text-2xl font-medium max-w-2xl mx-auto">
          Analyze spending decisions before you commit. Access your personalized value data.
        </p>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
          <Search size={40} className="text-gray-800 group-focus-within:text-cyan-400 transition-all drop-shadow-[0_0_20px_#22F0FF20]" />
        </div>
        <input
          type="text"
          placeholder="Search for product or service..."
          className="w-full bg-[#101A2E]/60 backdrop-blur-3xl border-2 border-white/5 rounded-[4rem] pl-28 pr-12 py-14 text-4xl font-black text-white outline-none focus:border-cyan-500/20 focus:shadow-[0_0_100px_rgba(34,240,255,0.05)] transition-all placeholder:text-gray-800"
        />
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <button className="bg-cyan-400 text-[#0B1220] px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all">
            Evaluate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ElectricCard semanticColor={COLORS.electricGreen} className="p-12" elevation={1}>
          <div className="flex items-center gap-5 mb-10">
            <Zap size={32} style={{ color: COLORS.electricGreen }} />
            <h4 className="font-black text-2xl tracking-tight">Predicted Optimal Fit</h4>
          </div>
          <div className="space-y-6">
            {[
              { n: "Mechanical Keyboard", s: 96, c: COLORS.electricGreen },
              { n: "AWS Infrastructure", s: 89, c: COLORS.electricGreen },
              { n: "Productivity Suite", s: 92, c: COLORS.electricGreen },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-electric-green transition-all" style={{ borderColor: `${item.c}10` }}>
                <span className="font-black text-xl text-gray-300">{item.n}</span>
                <span className="font-black text-3xl" style={{ color: item.c, filter: `drop-shadow(0 0 10px ${item.c}60)` }}>
                  {item.s}
                </span>
              </div>
            ))}
          </div>
        </ElectricCard>

        <ElectricCard semanticColor={COLORS.electricRed} className="p-12" elevation={1}>
          <div className="flex items-center gap-5 mb-10">
            <TrendingDown size={32} style={{ color: COLORS.electricRed }} />
            <h4 className="font-black text-2xl tracking-tight">High Regret Risk</h4>
          </div>
          <div className="space-y-6">
            {[
              { n: "Food Delivery", s: 12, c: COLORS.electricRed },
              { n: "Impulse Purchase", s: 31, c: COLORS.electricRed },
              { n: "Micro-subscriptions", s: 24, c: COLORS.electricRed },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-electric-red transition-all" style={{ borderColor: `${item.c}10` }}>
                <span className="font-black text-xl text-gray-300">{item.n}</span>
                <span className="font-black text-3xl" style={{ color: item.c, filter: `drop-shadow(0 0 10px ${item.c}60)` }}>
                  {item.s}
                </span>
              </div>
            ))}
          </div>
        </ElectricCard>
      </div>
    </div>
  );
}
