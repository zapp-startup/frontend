import * as React from "react";
import { motion } from "motion/react";
import { TrendingUp, ZapOff, ChevronRight, Loader2, Plus } from "lucide-react";
import { ElectricCard } from "@/features/home";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { COLORS } from "@/shared/theme";
import {
  RawInferredAPI,
  ComputedAPI,
  SubscriptionValuationsAPI,
  ItemValuationsAPI,
  type RawInferred,
  type Computed,
  type SubscriptionValuation,
  type ItemValuation,
} from "@/api";
import { toast } from "sonner";

const OVERVIEW_BARS = [
  { name: "Development Tools", val: 85, color: COLORS.electricGreen, sub: "Essential Utility" },
  { name: "Content Streaming", val: 32, color: COLORS.electricRed, sub: "High Overlap Risk" },
  { name: "Lifestyle Apps", val: 58, color: COLORS.electricBlue, sub: "Healthy Engagement" },
];

const RawInferredSection = React.memo(function RawInferredSection() {
  const [data, setData] = React.useState<RawInferred[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    RawInferredAPI.list()
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) toast.error("Failed to load inferred data."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-cyan-400" />
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">
        No inferred insights yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((item) => (
        <ElectricCard key={item.id} semanticColor={COLORS.electricCyan} elevation={1} className="p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
            Inferred #{item.id}
          </div>
          <div className="space-y-2">
            {Object.entries(item)
              .filter(([k]) => k !== "id")
              .map(([key, val]) => (
                <div key={key} className="flex justify-between gap-4">
                  <span className="text-xs text-gray-500">{key}</span>
                  <span className="text-sm font-bold text-white truncate">
                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
          </div>
        </ElectricCard>
      ))}
    </div>
  );
});

const ComputedSection = React.memo(function ComputedSection() {
  const [data, setData] = React.useState<Computed[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    ComputedAPI.list()
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) toast.error("Failed to load computed insights."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-cyan-400" />
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">
        No computed insights yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((item) => (
        <ElectricCard key={item.id} semanticColor={COLORS.electricGreen} elevation={1} className="p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
            Computed #{item.id}
          </div>
          <div className="space-y-2">
            {Object.entries(item)
              .filter(([k]) => k !== "id")
              .map(([key, val]) => (
                <div key={key} className="flex justify-between gap-4">
                  <span className="text-xs text-gray-500">{key}</span>
                  <span className="text-sm font-bold text-white truncate">
                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
          </div>
        </ElectricCard>
      ))}
    </div>
  );
});

const ValuationCard = React.memo(function ValuationCard({
  recommendation,
  confidence,
  evidence,
}: {
  recommendation?: string;
  confidence?: number;
  evidence?: string;
}) {
  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
      {recommendation && (
        <div className="mb-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
            Recommendation
          </div>
          <span
            className="inline-block px-4 py-2 rounded-xl text-sm font-bold"
            style={{
              backgroundColor: `${COLORS.electricCyan}20`,
              color: COLORS.electricCyan,
              border: `1px solid ${COLORS.electricCyan}40`,
            }}
          >
            {recommendation}
          </span>
        </div>
      )}
      {confidence != null && (
        <div className="mb-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
            Confidence
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, confidence))}%`,
                  backgroundColor: COLORS.electricCyan,
                }}
              />
            </div>
            <span className="text-sm font-black text-white">{Math.round(confidence)}%</span>
          </div>
        </div>
      )}
      {evidence && (
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
            Evidence
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{evidence}</p>
        </div>
      )}
    </div>
  );
});

const ValuationsSection = React.memo(function ValuationsSection() {
  const [subVals, setSubVals] = React.useState<SubscriptionValuation[]>([]);
  const [itemVals, setItemVals] = React.useState<ItemValuation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addingItem, setAddingItem] = React.useState(false);
  const [newItem, setNewItem] = React.useState({ description: "", amount: "" });

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([SubscriptionValuationsAPI.list(), ItemValuationsAPI.list()])
      .then(([subs, items]) => {
        if (!cancelled) {
          setSubVals(subs);
          setItemVals(items);
        }
      })
      .catch(() => { if (!cancelled) toast.error("Failed to load valuations."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleAddItem = async () => {
    if (!newItem.description.trim()) {
      toast.error("Description is required.");
      return;
    }
    try {
      const created = await ItemValuationsAPI.create({
        description: newItem.description,
        amount: newItem.amount ? Number(newItem.amount) : undefined,
      });
      setItemVals((prev) => [...prev, created]);
      setNewItem({ description: "", amount: "" });
      setAddingItem(false);
      toast.success("Item valuation added.");
    } catch {
      toast.error("Failed to add item valuation.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  const hasAny = subVals.length > 0 || itemVals.length > 0;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-white">Valuations</h3>
        {!addingItem && (
          <Button
            onClick={() => setAddingItem(true)}
            className="rounded-xl gap-2"
            style={{ backgroundColor: COLORS.electricCyan, color: COLORS.bgPrimary }}
          >
            <Plus size={16} /> New Item Valuation
          </Button>
        )}
      </div>

      {addingItem && (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
          <h4 className="font-black text-white">Add Item Valuation</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-500">Description</Label>
              <Input
                value={newItem.description}
                onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                placeholder="e.g. New laptop"
                className="bg-[#0B1220] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-500">Amount ($)</Label>
              <Input
                type="number"
                value={newItem.amount}
                onChange={(e) => setNewItem((p) => ({ ...p, amount: e.target.value }))}
                placeholder="0"
                className="bg-[#0B1220] border-white/10 text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddItem} style={{ backgroundColor: COLORS.electricCyan, color: COLORS.bgPrimary }}>
              Add
            </Button>
            <Button variant="outline" onClick={() => { setAddingItem(false); setNewItem({ description: "", amount: "" }); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!hasAny && !addingItem && (
        <div className="text-center py-16 text-gray-500 text-sm">
          No valuations yet. Add an item valuation to get started.
        </div>
      )}

      {subVals.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-black text-white">Subscription Valuations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subVals.map((v) => (
              <ValuationCard
                key={v.id}
                recommendation={v.recommendation}
                confidence={v.confidence}
                evidence={v.evidence}
              />
            ))}
          </div>
        </div>
      )}

      {itemVals.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-black text-white">Item Valuations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {itemVals.map((v) => (
              <ValuationCard
                key={v.id}
                recommendation={v.recommendation}
                confidence={v.confidence}
                evidence={v.evidence}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export function AnalyticsPage() {
  return (
    <div className="space-y-12 pb-32 relative z-10">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[#101A2E] border border-white/10 rounded-2xl p-1.5">
          <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white/10">
            Overview
          </TabsTrigger>
          <TabsTrigger value="insights" className="rounded-xl data-[state=active]:bg-white/10">
            Insights
          </TabsTrigger>
          <TabsTrigger value="valuations" className="rounded-xl data-[state=active]:bg-white/10">
            Valuations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-8">
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
                  {OVERVIEW_BARS.map((bar, i) => (
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
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.electricPurple }} />
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
                  &quot;Your ChatGPT Plus usage has reached <span className="text-white font-black">$0.14/query</span>. This aligns perfectly with your goals.&quot;
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
                  &quot;Your Disney+ utility has dropped 80% this month. Cost per hour is now <span className="text-white font-black">$12.40</span>.&quot;
                </p>
              </ElectricCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-8 space-y-12">
          <div>
            <h3 className="text-xl font-black text-white mb-6">Raw Inferred</h3>
            <RawInferredSection />
          </div>
          <div>
            <h3 className="text-xl font-black text-white mb-6">Computed</h3>
            <ComputedSection />
          </div>
        </TabsContent>

        <TabsContent value="valuations" className="mt-8">
          <ValuationsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
