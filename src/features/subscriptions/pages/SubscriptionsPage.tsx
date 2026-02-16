import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, Filter, TrendingUp, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/components/ui/utils";
import { COLORS, GLOWS } from "@/shared/theme";

export function SubscriptionsPage() {
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  const subs = [
    { id: 1, name: "Netflix", cost: 15.99, score: 42, status: "Underused", color: COLORS.electricRed },
    { id: 2, name: "ChatGPT Plus", cost: 20.0, score: 95, status: "Active", color: COLORS.electricGreen },
    { id: 3, name: "Spotify", cost: 9.99, score: 88, status: "Active", color: COLORS.electricGreen },
    { id: 4, name: "AWS Infrastructure", cost: 52.99, score: 91, status: "Optimal", color: COLORS.electricBlue },
  ];

  return (
    <div className="space-y-12 pb-32 relative z-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight">Active Subscriptions</h2>
          <div className="text-gray-500 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" style={{ backgroundColor: COLORS.electricGreen }} />
            Monitoring 12 active connections
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-2xl h-14 px-8 border-white/10 hover:bg-white/5 gap-3 font-black uppercase tracking-widest text-xs">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button className="bg-cyan-500 text-[#0B1220] rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/20" style={{ backgroundColor: COLORS.electricCyan }}>
            Add Subscription
          </Button>
        </div>
      </div>

      <div className="relative perspective-[2000px] py-10">
        <motion.div
          initial={{ rotateX: 20, opacity: 0 }}
          animate={{ rotateX: 5, opacity: 1 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="relative max-w-4xl mx-auto space-y-[-40px]"
        >
          {subs.map((sub, index) => (
            <motion.div
              key={sub.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ y: -60, zIndex: 50, rotateX: 0, scale: 1.02 }}
              onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
              className={cn("relative group cursor-pointer transition-all duration-500", expandedId === sub.id ? "z-[60] !translate-y-[-100px]" : `z-[${10 - index}]`)}
            >
              <div
                className="bg-[#101A2E] rounded-[2rem] border border-white/5 p-8 shadow-2xl flex items-center justify-between"
                style={{
                  boxShadow: `${GLOWS.ambient(0.4)}, ${GLOWS.inner}, ${GLOWS.soft(sub.color)}`,
                  borderColor: `${sub.color}20`,
                }}
              >
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/[0.02] border border-white/5">
                    <CreditCard size={32} style={{ color: sub.color }} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white">{sub.name}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{sub.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-16">
                  <div className="text-center">
                    <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Cost</div>
                    <div className="text-2xl font-black text-white">${sub.cost.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Value</div>
                    <div className="text-3xl font-black" style={{ color: sub.color, filter: `drop-shadow(0 0 8px ${sub.color}60)` }}>
                      {sub.score}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
                      <TrendingUp size={20} />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded-xl text-gray-500 hover:text-red-400 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
              <AnimatePresence>
                {expandedId === sub.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8"
                  >
                    <div className="grid grid-cols-3 gap-8">
                      <div>
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Usage Insight</div>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium">
                          You've accessed this service 4 times this month. Cost per use: ${(sub.cost / 4).toFixed(2)}.
                        </p>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Value Trend</div>
                        <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
                      </div>
                      <div className="flex items-center justify-end">
                        <Button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl px-8 py-4 text-xs font-black uppercase tracking-widest">
                          Cancel Service
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
