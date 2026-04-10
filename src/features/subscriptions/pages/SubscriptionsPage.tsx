import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, X, Calendar, Loader2, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/components/ui/utils";
import { COLORS, GLOWS } from "@/shared/theme";
import { getValueMeterWidth, getValuePresentation } from "@/shared/valuation";
import {
  SubscriptionsAPI,
  MerchantsAPI,
  SubscriptionValuationsAPI,
  type Subscription,
  type Merchant,
  type SubscriptionValuation,
} from "@/api";
import { ApiError } from "@/api/client";
import { usePanelActions } from "@/features/dashboard/context/PanelContext";
import { toast } from "sonner";

const BILLING_CYCLES = ["weekly", "monthly", "yearly", "other"];
const INITIAL_VISIBLE_SUBSCRIPTIONS = 12;

function formatConfidencePercent(confidence?: number | null) {
  if (confidence == null) return null;
  return Math.round(Math.min(1, Math.max(0, confidence)) * 100);
}

function formatValuationJson(value?: Record<string, unknown>) {
  if (!value || Object.keys(value).length === 0) return null;
  return JSON.stringify(value, null, 2);
}

function getStatusColor(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("active") || s.includes("optimal")) return COLORS.electricGreen;
  if (s.includes("underused") || s.includes("cancel")) return COLORS.electricRed;
  return COLORS.electricBlue;
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
      merchants.find(
        (m) =>
          m.name.toLowerCase().includes(normalized) ||
          normalized.includes(m.name.toLowerCase())
      );

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
        merchant: match.id,
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
            <h2 className="text-4xl font-black text-white tracking-tighter">
              Add Subscription
            </h2>
            <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 font-black mt-1">
              Manual Entry
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all">
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
              <Calendar
                size={18}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500"
              />
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

const SubscriptionCard = React.memo(function SubscriptionCard({
  sub,
  valuations,
  index,
  expanded,
  name,
  onToggle,
  onDelete,
}: {
  sub: Subscription;
  valuations: SubscriptionValuation[];
  index: number;
  expanded: boolean;
  name: string;
  onToggle: (id: number) => void;
  onDelete: (sub: Subscription, e: React.MouseEvent) => void;
}) {
  const cost = Number(sub.amount) || 0;
  const statusColor = getStatusColor(sub.status);
  const value = getValuePresentation(sub.value_score);
  const meterWidth = getValueMeterWidth(sub.value_score);
  const primaryValuation = valuations[0];
  const recommendation = primaryValuation?.recommendation?.trim() || value.tone;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index, 6) * 0.03, duration: 0.18, ease: "easeOut" }}
      whileHover={{ zIndex: 50, rotateX: 0 }}
      onClick={() => onToggle(sub.id)}
      className={cn(
        "relative group cursor-pointer transition-all duration-500",
        expanded && "z-[60] !translate-y-[-100px]"
      )}
      style={expanded ? undefined : { zIndex: 10 - (index % 10) }}
    >
      <div
        className="bg-[#101A2E] rounded-[2rem] border border-white/5 p-8 shadow-2xl flex items-center justify-between gap-6"
        style={{
          boxShadow: `${GLOWS.ambient(0.4)}, ${GLOWS.inner}, ${GLOWS.soft(statusColor)}`,
          borderColor: `${statusColor}20`,
        }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/[0.02] border border-white/5">
            <CreditCard size={32} style={{ color: statusColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="text-2xl font-black text-white">{name}</h4>
              <span
                className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em]"
                style={{
                  color: value.accentColor,
                  borderColor: `${value.accentColor}40`,
                  backgroundColor: value.trackColor,
                }}
              >
                {value.label}
              </span>
            </div>
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: statusColor }}
            >
              {sub.status || "Active"}
            </span>
            <p className="mt-3 max-w-xl truncate text-sm font-medium text-gray-400">
              {recommendation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="text-center">
            <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
              Cost
            </div>
            <div className="text-2xl font-black text-white">${cost.toFixed(2)}</div>
          </div>

          <div className="min-w-[170px]">
            <div className="mb-2 flex items-center justify-between gap-4">
              <div className="text-xs font-black text-gray-500 uppercase tracking-widest">
                Value
              </div>
              <div
                className="text-3xl font-black"
                style={{
                  color: value.accentColor,
                  filter: `drop-shadow(0 0 8px ${value.accentColor}60)`,
                }}
              >
                {value.scoreText}
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${meterWidth}%`, backgroundColor: value.accentColor }}
              />
            </div>
            <div
              className="mt-2 text-right text-[10px] font-black uppercase tracking-widest"
              style={{ color: value.accentColor }}
            >
              {value.label}
            </div>
          </div>

          <button
            onClick={(e) => onDelete(sub, e)}
            className="p-2 hover:bg-red-500/10 rounded-xl text-gray-500 hover:text-red-400 transition-colors"
            aria-label={`Delete ${name}`}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8"
          >
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">
                    Billing
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">
                    {sub.billing_cycle} · Started{" "}
                    {sub.started_at ? new Date(sub.started_at).toLocaleDateString("en-US") : "—"}
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

                <div className="md:col-span-2 rounded-[1.5rem] border border-white/5 bg-[#0B1220]/70 p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Value score
                      </div>
                      <div className="mt-2 flex items-end gap-3">
                        <div
                          className="text-4xl font-black"
                          style={{
                            color: value.accentColor,
                            filter: `drop-shadow(0 0 12px ${value.accentColor}50)`,
                          }}
                        >
                          {value.scoreText}
                        </div>
                        <div className="pb-1 text-sm font-bold text-gray-400">out of 150</div>
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.24em]"
                      style={{
                        color: value.accentColor,
                        borderColor: `${value.accentColor}40`,
                        backgroundColor: value.trackColor,
                      }}
                    >
                      {value.label}
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${meterWidth}%`, backgroundColor: value.accentColor }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-400">{value.tone}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    Recommendation & Evidence
                  </div>
                  <Button
                    onClick={(e) => onDelete(sub, e)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest"
                  >
                    Cancel Service
                  </Button>
                </div>

                {valuations.length === 0 && (
                  <div className="rounded-[1.5rem] border border-white/5 bg-[#0B1220]/70 p-6 text-sm text-gray-500">
                    No valuation evidence yet for this subscription.
                  </div>
                )}

                {valuations.map((valuation) => (
                  <div
                    key={valuation.id}
                    className="rounded-[1.5rem] border border-white/5 bg-[#0B1220]/70 p-6"
                  >
                    {valuation.recommendation && (
                      <div className="mb-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                          Recommendation
                        </div>
                        <p className="text-sm font-bold text-white">
                          {valuation.recommendation}
                        </p>
                      </div>
                    )}

                    {formatConfidencePercent(valuation.confidence) != null && (
                      <div className="mb-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                          Confidence
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${formatConfidencePercent(valuation.confidence)}%`,
                                backgroundColor: COLORS.electricCyan,
                              }}
                            />
                          </div>
                          <span className="text-sm font-black text-white">
                            {formatConfidencePercent(valuation.confidence)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {valuation.personal_value_score != null && (
                      <div className="mb-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                          Personal Value Score
                        </div>
                        <p className="text-sm font-bold text-white">
                          {valuation.personal_value_score}/150
                        </p>
                      </div>
                    )}

                    {formatValuationJson(valuation.evidence_json as Record<string, unknown> | undefined) && (
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                          Evidence
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">
                          {formatValuationJson(valuation.evidence_json as Record<string, unknown> | undefined)}
                        </pre>
                      </div>
                    )}

                    {formatValuationJson(valuation.explanation_json as Record<string, unknown> | undefined) && (
                      <div className="mt-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                          Explanation
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">
                          {formatValuationJson(valuation.explanation_json as Record<string, unknown> | undefined)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export function SubscriptionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setRightPanelOpen } = usePanelActions();

  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [merchants, setMerchants] = React.useState<Merchant[]>([]);
  const [subscriptionValuations, setSubscriptionValuations] = React.useState<
    SubscriptionValuation[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<number | null>(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_VISIBLE_SUBSCRIPTIONS);

  React.useEffect(() => {
    setRightPanelOpen(isAddPanelOpen);
    return () => setRightPanelOpen(false);
  }, [isAddPanelOpen, setRightPanelOpen]);

  React.useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.all([
      SubscriptionsAPI.list({ signal: ac.signal }),
      MerchantsAPI.list({ signal: ac.signal }),
    ])
      .then(([subs, mchs]) => {
        if (!cancelled) {
          setSubscriptions(subs);
          setMerchants(mchs);
        }

        return SubscriptionValuationsAPI.list()
          .then((valuations) => {
            if (!cancelled) {
              setSubscriptionValuations(valuations);
            }
          })
          .catch(() => {
            if (!cancelled) {
              setSubscriptionValuations([]);
            }
          });
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

  React.useEffect(() => {
    if (location.pathname === "/subscriptions/new") {
      setIsAddPanelOpen(true);
    }
  }, [location.pathname]);

  const closeAddPanel = React.useCallback(() => {
    setIsAddPanelOpen(false);
    if (location.pathname === "/subscriptions/new") {
      navigate("/subscriptions", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleDelete = async (sub: Subscription, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Cancel "${sub.merchant_name || "this subscription"}"?`)) return;

    try {
      await SubscriptionsAPI.remove(sub.id);
      setSubscriptions((prev) => prev.filter((s) => s.id !== sub.id));
      setSubscriptionValuations((prev) =>
        prev.filter((valuation) => valuation.subscription !== sub.id)
      );
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

  const valuationsBySubscription = React.useMemo(
    () =>
      subscriptionValuations.reduce<Record<number, SubscriptionValuation[]>>((acc, valuation) => {
        if (valuation.subscription == null) return acc;
        const key = valuation.subscription;
        acc[key] = acc[key] ? [...acc[key], valuation] : [valuation];
        return acc;
      }, {}),
    [subscriptionValuations]
  );

  const subscriptionCards = React.useMemo(
    () =>
      subscriptions.map((sub) => ({
        sub,
        name: sub.merchant_name || merchantMap[sub.merchant]?.name || `Subscription #${sub.id}`,
        valuations: valuationsBySubscription[sub.id] ?? [],
      })),
    [subscriptions, merchantMap, valuationsBySubscription]
  );

  React.useEffect(() => {
    setVisibleCount((prev) =>
      Math.min(
        Math.max(prev, INITIAL_VISIBLE_SUBSCRIPTIONS),
        subscriptionCards.length || INITIAL_VISIBLE_SUBSCRIPTIONS
      )
    );
  }, [subscriptionCards.length]);

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
        <Button onClick={() => window.location.reload()} variant="outline" className="border-white/10">
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

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: GLOWS.strong(COLORS.electricCyan) }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddPanelOpen(true)}
          className="flex h-12 flex-shrink-0 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0B1220] shadow-[0_0_20px_rgba(34,240,255,0.3)]"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Add Subscription</span>
        </motion.button>
      </div>

      {subscriptions.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="text-gray-500 font-bold uppercase text-sm tracking-widest">
            No subscriptions yet
          </div>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Add your first subscription to track recurring costs and value scores.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: GLOWS.strong(COLORS.electricCyan) }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddPanelOpen(true)}
            className="mx-auto flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0B1220] shadow-[0_0_20px_rgba(34,240,255,0.3)]"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Add Subscription</span>
          </motion.button>
        </div>
      )}

      <div className="relative perspective-[2000px] py-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto space-y-[-40px]"
        >
          {subscriptionCards.slice(0, visibleCount).map(({ sub, name, valuations }, index) => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              valuations={valuations}
              index={index}
              expanded={expandedId === sub.id}
              name={name}
              onToggle={(id) => setExpandedId((current) => (current === id ? null : id))}
              onDelete={handleDelete}
            />
          ))}
        </motion.div>
      </div>

      {visibleCount < subscriptionCards.length && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() =>
              setVisibleCount((prev) =>
                Math.min(prev + INITIAL_VISIBLE_SUBSCRIPTIONS, subscriptionCards.length)
              )
            }
            className="rounded-2xl border-white/10"
          >
            Load More Subscriptions
          </Button>
        </div>
      )}

      <AnimatePresence>
        {isAddPanelOpen && (
          <AddPanel onClose={closeAddPanel} onAdded={handleAdded} merchants={merchants} />
        )}
      </AnimatePresence>
    </div>
  );
}
