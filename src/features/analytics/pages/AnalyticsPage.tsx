import * as React from "react";
import { motion } from "motion/react";
import { BarChart3, ChevronRight, Sparkles, TrendingUp, ZapOff } from "lucide-react";

import { ElectricCard } from "@/features/home";
import { MetricCard, SectionHeader, StatusChip, Surface } from "@/shared/components/system";
import { COLORS } from "@/shared/theme";

const OVERVIEW_BARS = [
  { name: "Development Tools", val: 85, color: COLORS.electricGreen, sub: "Essential Utility" },
  { name: "Content Streaming", val: 32, color: COLORS.electricRed, sub: "High Overlap Risk" },
  { name: "Lifestyle Apps", val: 58, color: COLORS.electricBlue, sub: "Healthy Engagement" },
];

export function AnalyticsPage() {
  return (
    <div className="relative z-10 space-y-12 pb-32">
      <SectionHeader
        eyebrow="Intelligence"
        title="Analytics"
        titleClassName="app-page-title"
        description="A semantic overview of utility overlap, spending patterns, and AI-generated efficiency signals."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <MetricCard label="Tracked Stacks" value="3" detail="Major software and subscription clusters currently analyzed." />
        <MetricCard label="Highest Overlap" value="85%" detail="The strongest duplicate-utility signal in the current sample." />
        <MetricCard label="Watchlist" value="2 items" detail="Subscriptions or tools showing weak recent utility." />
      </div>

      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <ElectricCard semanticColor={COLORS.electricBlue} className="relative z-20">
            <div className="mb-16 flex items-center justify-between">
              <div>
                <h3 className="app-section-title text-[2rem]">Utility Overlap Analysis</h3>
                <div className="mt-2 app-mini-label">
                  Subscription Stacking
                </div>
              </div>
              <StatusChip tone="info">Live Snapshot</StatusChip>
            </div>
            <div className="space-y-14 px-4">
              {OVERVIEW_BARS.map((bar, i) => (
                <div key={i} className="space-y-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-black tracking-tight text-[var(--app-color-text-primary)]">{bar.name}</div>
                      <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-[var(--app-color-text-tertiary)]">
                        {bar.sub}
                      </div>
                    </div>
                    <div
                      className="text-4xl font-black"
                      style={{ color: bar.color }}
                    >
                      {bar.val}%
                    </div>
                  </div>
                  <div className="relative h-5 overflow-hidden rounded-full bg-[var(--app-color-surface-inset)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.val}%` }}
                      transition={{ duration: 2, delay: i * 0.3, ease: [0.23, 1, 0.32, 1] }}
                      className="h-full rounded-full"
                       style={{ backgroundColor: bar.color, boxShadow: `0 0 18px ${bar.color}66` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ElectricCard>

          <div className="relative">
            <ElectricCard semanticColor={COLORS.electricCyan} className="relative z-10 min-h-[400px]">
              <div className="mb-10 flex items-center justify-between">
                <h3 className="app-card-title text-2xl">Transaction History</h3>
                <StatusChip tone="neutral">Sample Feed</StatusChip>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Surface
                    key={i}
                    variant="inset"
                    padding="md"
                    className="flex cursor-pointer items-center justify-between rounded-[2.5rem] border-transparent transition-all hover:border-[var(--app-color-border-strong)]"
                  >
                    <div className="flex items-center gap-8">
                      <div
                        className="h-2 w-2 rounded-full shadow-[0_0_12px_color-mix(in_srgb,var(--app-accent-cyan-soft)_35%,transparent)]"
                        style={{ backgroundColor: COLORS.electricCyan }}
                      />
                      <span className="text-xl font-black tracking-tight text-[var(--app-color-text-primary)]">
                        AWS Infrastructure
                      </span>
                    </div>
                    <div className="flex items-center gap-12">
                      <span className="text-2xl font-black text-[var(--app-color-text-primary)]">$12.45</span>
                      <ChevronRight size={20} className="text-[var(--app-color-text-tertiary)]" />
                    </div>
                  </Surface>
                ))}
              </div>
            </ElectricCard>
          </div>
        </div>

        <div className="space-y-8 lg:col-span-4">
          <div className="flex items-center gap-2 px-6">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--app-accent-purple-soft)" }} />
                <h3 className="app-mini-label tracking-[0.4em]">
                  Zapp CFO Intelligence
                </h3>
          </div>

          <ElectricCard
            className="border-l-4 p-10"
            style={{ borderLeftColor: COLORS.electricGreen }}
            semanticColor={COLORS.electricGreen}
            elevation={1}
          >
            <div className="mb-8 flex items-center gap-5">
              <div className="rounded-2xl p-4" style={{ backgroundColor: `color-mix(in srgb, ${COLORS.electricGreen} 10%, transparent)` }}>
                <TrendingUp size={28} style={{ color: COLORS.electricGreen }} />
              </div>
              <h4 className="text-2xl font-black tracking-tight text-[var(--app-color-text-primary)]">Efficiency Insight</h4>
            </div>
            <p className="text-lg font-medium leading-relaxed text-[var(--app-color-text-secondary)]">
              &quot;Your ChatGPT Plus usage has reached <span className="font-black text-[var(--app-color-text-primary)]">$0.14/query</span>.
              This aligns perfectly with your goals.&quot;
            </p>
          </ElectricCard>

          <ElectricCard
            className="border-l-4 p-10"
            style={{ borderLeftColor: COLORS.electricRed }}
            semanticColor={COLORS.electricRed}
            elevation={1}
          >
            <div className="mb-8 flex items-center gap-5">
              <div className="rounded-2xl p-4" style={{ backgroundColor: `color-mix(in srgb, ${COLORS.electricRed} 10%, transparent)` }}>
                <ZapOff size={28} style={{ color: COLORS.electricRed }} />
              </div>
              <h4 className="text-2xl font-black tracking-tight text-[var(--app-color-text-primary)]">Low Value Item</h4>
            </div>
            <p className="text-lg font-medium leading-relaxed text-[var(--app-color-text-secondary)]">
              &quot;Your Disney+ utility has dropped 80% this month. Cost per hour is now{" "}
              <span className="font-black text-[var(--app-color-text-primary)]">$12.40</span>.&quot;
            </p>
          </ElectricCard>

          <Surface variant="panel" padding="md" className="space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 size={18} className="text-[var(--app-accent-cyan-soft)]" />
              <div className="app-card-title">Signal Summary</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="app-helper">Overlap risk</span>
                <StatusChip tone="warning">Elevated</StatusChip>
              </div>
              <div className="flex items-center justify-between">
                <span className="app-helper">Transaction quality</span>
                <StatusChip tone="success">Healthy</StatusChip>
              </div>
              <div className="flex items-center justify-between">
                <span className="app-helper">Recommendation freshness</span>
                <StatusChip tone="info">This week</StatusChip>
              </div>
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
