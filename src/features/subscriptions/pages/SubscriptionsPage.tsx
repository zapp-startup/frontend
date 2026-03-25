import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, Filter, TrendingUp, X, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/components/ui/utils";
import { COLORS, GLOWS } from "@/shared/theme";
import {
  SubscriptionsAPI,
  MerchantsAPI,
  SubscriptionValuationsAPI,
  type Subscription,
  type Merchant,
  type SubscriptionValuation,
} from "@/api";
import { ApiError } from "@/api/client";
import { usePanelContext } from "@/features/dashboard/context/PanelContext";
import { toast } from "sonner";

const BILLING_CYCLES = ["weekly", "monthly", "yearly", "other"];

function getStatusColor(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("active") || s.includes("optimal")) return COLORS.electricGreen;
  if (s.includes("underused") || s.includes("cancel")) return COLORS.electricRed;
  return COLORS.electricBlue;
}

function getScoreColor(score: number) {
  if (score >= 80) return COLORS.electricGreen;
  if (score >= 50) return COLORS.electricCyan;
  return COLORS.electricRed;
}

function extractApiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const raw = err.rawBody;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const first = Object.values(parsed)[0];
        if (Array.isArray(first) && typeof first[0] === "string") return first[0];
        if (typeof first === "string") return first;
      } catch {
        // use normalized message below
      }
    }
    return err.message || "Failed to save subscription.";
  }
  if (!(err instanceof Error)) return "Failed to save subscription.";
  return err.message || "Failed to save subscription.";
}

type AddSubscriptionForm = {
  merchantName: string;
  amount: string;
  billing_cycle: string;
  status: string;
  started_at: string;
  notes: string;
};

function createEmptySubscriptionForm(): AddSubscriptionForm {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return {
    merchantName: "",
    amount: "",
    billing_cycle: "monthly",
    status: "active",
    started_at: `${y}-${m}-${day}`,
    notes: "",
  };
}

function AddPanel({
  onClose,
  onAdded,
  merchants,
}: {
  onClose: () => void;
  onAdded: (s: Subscription) => void;
  merchants: Merchant[];
}) {
  const [form, setForm] = React.useState<AddSubscriptionForm>(() => createEmptySubscriptionForm());
  const [submitting, setSubmitting] = React.useState(false);

  const set = <K extends keyof AddSubscriptionForm>(key: K, val: AddSubscriptionForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    const merchantName = (form.merchantName || "").trim();
    if (!merchantName) {
      toast.error("Please enter a merchant name.");
      return;
    }
    const normalized = merchantName.toLowerCase();
    const match =
      merchants.find((m) => m.name.toLowerCase() === normalized) ??
      merchants.find((m) => m.name.toLowerCase().includes(normalized) || normalized.includes(m.name.toLowerCase()));
    if (!match) {
      toast.error("Merchant not found in catalog. Pick an existing merchant name.");
      return;
    }
    const amt = Number(form.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!form.started_at) {
      toast.error("Please enter a start date.");
      return;
    }
    setSubmitting(true);
    try {
      const sub = await SubscriptionsAPI.create({
        ...(match ? { merchant: match.id } : {}),
        merchant_name: merchantName,
        amount: amt,
        billing_cycle: form.billing_cycle,
        status: form.status,
        started_at: `${form.started_at}T00:00:00Z`,
        notes: form.notes,
      });
      toast.success("Subscription added!");
      onAdded(sub);
      onClose();
    } catch (err) {
      toast.error(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#0B1220]/80 backdrop-blur-md z-[110]"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#101A2E] border-l border-white/5 z-[120] p-12 shadow-2xl flex flex-col"
        style={{ boxShadow: "-20px 0 60px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">Add Subscription</h2>
            <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 font-black mt-1">
              Manual Entry
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/5 rounded-2xl transition-all"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto pr-2">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Merchant
            </label>
            <input
              type="text"
              placeholder="e.g. Netflix, Spotify"
              value={form.merchantName}
              onChange={(e) => set("merchantName", e.target.value)}
              list="merchant-options"
              className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600"
            />
            <datalist id="merchant-options">
              {merchants.map((m) => (
                <option key={m.id} value={m.name} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Billing Cycle
              </label>
              <select
                value={form.billing_cycle}
                onChange={(e) => set("billing_cycle", e.target.value)}
                className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-cyan-500/50 transition-all"
              >
                {BILLING_CYCLES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Start Date
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="date"
                value={form.started_at}
                onChange={(e) => set("started_at", e.target.value)}
                className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Notes <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              placeholder="e.g. Premium plan, shared with family"
              value={form.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
              className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-cyan-500/50 transition-all h-24 resize-none placeholder:text-gray-700"
            />
          </div>
        </div>

        <div className="pt-8 mt-auto">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-[#0B1220] rounded-[2rem] py-10 text-xl font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Add Subscription"}
          </Button>
        </div>
      </motion.div>
    </>
  );
}

function ValuationDetailPanel({
  subscriptionId,
  subscriptionName,
  onClose,
}: {
  subscriptionId: number;
  subscriptionName: string;
  onClose: () => void;
}) {
  const [valuations, setValuations] = React.useState<SubscriptionValuation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    SubscriptionValuationsAPI.list({ subscription: subscriptionId })
      .then((data) => {
        if (!cancelled) setValuations(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load valuations.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subscriptionId]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#0B1220]/80 backdrop-blur-md z-[110]"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#101A2E] border-l border-white/5 z-[120] p-12 shadow-2xl flex flex-col overflow-y-auto"
        style={{ boxShadow: "-20px 0 60px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter">
              Valuations: {subscriptionName}
            </h2>
            <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 font-black mt-1">
              Recommendation & Evidence
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/5 rounded-2xl transition-all"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-cyan-400" />
          </div>
        )}
        {!loading && valuations.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-sm">
            No valuations yet for this subscription.
          </div>
        )}
        {!loading &&
          valuations.map((v) => (
            <div
              key={v.id}
              className="mb-8 p-6 rounded-2xl border border-white/5 bg-white/[0.02]"
            >
              {v.recommendation && (
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
                    {v.recommendation}
                  </span>
                </div>
              )}
              {v.confidence != null && (
                <div className="mb-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Confidence
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(0, v.confidence))}%`,
                          backgroundColor: COLORS.electricCyan,
                        }}
                      />
                    </div>
                    <span className="text-sm font-black text-white">
                      {Math.round(v.confidence)}%
                    </span>
                  </div>
                </div>
              )}
              {v.evidence && (
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Evidence
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{v.evidence}</p>
                </div>
              )}
            </div>
          ))}
      </motion.div>
    </>
  );
}

export function SubscriptionsPage() {
  const { setRightPanelOpen } = usePanelContext();
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [merchants, setMerchants] = React.useState<Merchant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<number | null>(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = React.useState(false);
  const [valuationPanel, setValuationPanel] = React.useState<{
    id: number;
    name: string;
  } | null>(null);

  React.useEffect(() => {
    const rightOpen = isAddPanelOpen || valuationPanel != null;
    setRightPanelOpen(rightOpen);
    return () => setRightPanelOpen(false);
  }, [isAddPanelOpen, valuationPanel, setRightPanelOpen]);

  React.useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([SubscriptionsAPI.list({ signal: ac.signal }), MerchantsAPI.list({ signal: ac.signal })])
      .then(([subs, mchs]) => {
        if (!cancelled) {
          setSubscriptions(subs);
          setMerchants(mchs);
        }
      })
      .catch((err) => {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load subscriptions.";
        setError(msg);
        toast.error("Failed to load subscriptions.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, []);

  const handleDelete = async (sub: Subscription, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Cancel "${sub.merchant_name || "this subscription"}"?`)) return;
    try {
      await SubscriptionsAPI.remove(sub.id);
      setSubscriptions((prev) => prev.filter((s) => s.id !== sub.id));
      setExpandedId((id) => (id === sub.id ? null : id));
      toast.success("Subscription removed.");
    } catch {
      toast.error("Failed to remove subscription.");
    }
  };

  const handleAdded = (sub: Subscription) => {
    setSubscriptions((prev) => [sub, ...prev]);
  };

  const merchantMap = React.useMemo(
    () => Object.fromEntries(merchants.map((m) => [m.id, m])),
    [merchants]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={48} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-red-400 font-bold">{error}</div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-white/10"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-32 relative z-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight">Active Subscriptions</h2>
          <div className="text-gray-500 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: COLORS.electricGreen,
                boxShadow: `0 0 8px ${COLORS.electricGreen}`,
              }}
            />
            Monitoring {subscriptions.length} active connection{subscriptions.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="rounded-2xl h-14 px-8 border-white/10 hover:bg-white/5 gap-3 font-black uppercase tracking-widest text-xs"
          >
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button
            onClick={() => setIsAddPanelOpen(true)}
            className="bg-cyan-500 text-[#0B1220] rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/20"
            style={{ backgroundColor: COLORS.electricCyan }}
          >
            Add Subscription
          </Button>
        </div>
      </div>

      {subscriptions.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="text-gray-500 font-bold uppercase text-sm tracking-widest">
            No subscriptions yet
          </div>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Add your first subscription to track recurring costs and value scores.
          </p>
          <Button
            onClick={() => setIsAddPanelOpen(true)}
            style={{ backgroundColor: COLORS.electricCyan }}
            className="text-[#0B1220] rounded-2xl px-8"
          >
            Add Subscription
          </Button>
        </div>
      )}

      <div className="relative perspective-[2000px] py-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="relative max-w-4xl mx-auto space-y-[-40px]"
        >
          {subscriptions.map((sub, index) => {
            const name = sub.merchant_name || merchantMap[sub.merchant]?.name || `Subscription #${sub.id}`;
            const cost = Number(sub.amount) || 0;
            const score = sub.value_score ?? 0;
            const statusColor = getStatusColor(sub.status);
            const scoreColor = getScoreColor(score);

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.04, duration: 0.2, ease: "easeOut" }}
                whileHover={{ zIndex: 50, rotateX: 0 }}
                onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                className={cn(
                  "relative group cursor-pointer transition-all duration-500",
                  expandedId === sub.id && "z-[60] !translate-y-[-100px]"
                )}
                style={expandedId === sub.id ? undefined : { zIndex: 10 - index }}
              >
                <div
                  className="bg-[#101A2E] rounded-[2rem] border border-white/5 p-8 shadow-2xl flex items-center justify-between"
                  style={{
                    boxShadow: `${GLOWS.ambient(0.4)}, ${GLOWS.inner}, ${GLOWS.soft(statusColor)}`,
                    borderColor: `${statusColor}20`,
                  }}
                >
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/[0.02] border border-white/5">
                      <CreditCard size={32} style={{ color: statusColor }} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white">{name}</h4>
                      <span
                        className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: statusColor }}
                      >
                        {sub.status || "Active"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-16">
                    <div className="text-center">
                      <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                        Cost
                      </div>
                      <div className="text-2xl font-black text-white">
                        ${cost.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                        Value
                      </div>
                      <div
                        className="text-3xl font-black"
                        style={{
                          color: scoreColor,
                          filter: `drop-shadow(0 0 8px ${scoreColor}60)`,
                        }}
                      >
                        {score || "—"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setValuationPanel({ id: sub.id, name });
                        }}
                        className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors"
                      >
                        <TrendingUp size={20} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(sub, e)}
                        className="p-2 hover:bg-red-500/10 rounded-xl text-gray-500 hover:text-red-400 transition-colors"
                      >
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
                          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">
                            Billing
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed font-medium">
                            {sub.billing_cycle} · Started{" "}
                            {sub.started_at
                              ? new Date(sub.started_at).toLocaleDateString("en-US")
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">
                            Notes
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed font-medium">
                            {sub.notes || "—"}
                          </p>
                        </div>
                        <div className="flex items-center justify-end">
                          <Button
                            onClick={(e) => handleDelete(sub, e)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl px-8 py-4 text-xs font-black uppercase tracking-widest"
                          >
                            Cancel Service
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {isAddPanelOpen && (
          <AddPanel
            onClose={() => setIsAddPanelOpen(false)}
            onAdded={handleAdded}
            merchants={merchants}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {valuationPanel && (
          <ValuationDetailPanel
            subscriptionId={valuationPanel.id}
            subscriptionName={valuationPanel.name}
            onClose={() => setValuationPanel(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
