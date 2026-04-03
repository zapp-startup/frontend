import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock3, FileText, RefreshCw, Sparkles, Target, Wallet } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/api/client";
import {
  GamificationAPI,
  type PeriodicReview,
  type ReviewOverview,
  type ReviewSubscription,
} from "@/api/gamification.api";
import type { Transaction } from "@/api/transactions.api";
import { ElectricCard } from "@/features/home/components/ElectricCard";
import { TransactionFeedbackModal } from "@/features/transactions/components/TransactionFeedbackModal";
import type { DisplayTransaction } from "@/features/transactions/utils/normalizeBankTransaction";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/components/ui/utils";
import { COLORS } from "@/shared/theme";

type ReviewKind = "weekly" | "monthly";

const FIELD_COPY: Record<string, { label: string; placeholder: string }> = {
  wins: {
    label: "What went well this week?",
    placeholder: "Call out one spending decision or pattern you want to keep.",
  },
  regrets: {
    label: "What would you rethink?",
    placeholder: "Name the purchase, habit, or moment that felt off.",
  },
  adjustment: {
    label: "What will you change next week?",
    placeholder: "Describe one concrete adjustment you want to make.",
  },
  best_purchase: {
    label: "Best purchase this month",
    placeholder: "What delivered the most value and why?",
  },
  most_regretted_purchase: {
    label: "Most regretted purchase",
    placeholder: "What missed the mark, and what did you learn from it?",
  },
  next_month_focus: {
    label: "Focus for next month",
    placeholder: "What habit or spending area deserves your attention next month?",
  },
};

const MISSING_COPY: Record<string, string> = {
  reviewed_transactions: "Review the required number of transactions before completing this review.",
  wins: "Add your biggest win for this period.",
  regrets: "Add at least one regret or miss worth learning from.",
  adjustment: "Describe one next-step adjustment.",
  best_purchase: "Choose your best purchase of the month.",
  most_regretted_purchase: "Choose the purchase you most regret this month.",
  next_month_focus: "Describe your focus for next month.",
};

function formatMissingRequirement(code: string) {
  return MISSING_COPY[code] ?? code.replace(/_/g, " ");
}

function toDisplayTransaction(transaction: Transaction): DisplayTransaction {
  return {
    ...transaction,
    source: "manual",
  };
}

function parseApiErrorResponse(error: unknown): { detail?: string; missing_requirements?: string[] } | null {
  if (!(error instanceof ApiError) || !error.rawBody) return null;
  try {
    return JSON.parse(error.rawBody) as { detail?: string; missing_requirements?: string[] };
  } catch {
    return null;
  }
}

function currencyAmount(value: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function statusTone(review: PeriodicReview) {
  return review.status === "completed"
    ? "bg-green-500/15 text-green-300 border-green-500/25"
    : "bg-yellow-500/15 text-yellow-200 border-yellow-500/25";
}

export function ReviewPage({ kind }: { kind: ReviewKind }) {
  const [overview, setOverview] = React.useState<ReviewOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<DisplayTransaction | null>(null);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [summary, setSummary] = React.useState<Record<string, string>>({});
  const [notes, setNotes] = React.useState("");
  const [missingRequirements, setMissingRequirements] = React.useState<string[]>([]);

  const loadReview = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = kind === "weekly"
        ? await GamificationAPI.getWeeklyReview()
        : await GamificationAPI.getMonthlyReview();
      setOverview(data);
      setSummary(
        Object.fromEntries(
          data.summary_requirements.map((field) => [field, String(data.review.summary_json?.[field] ?? "")]),
        ),
      );
      setNotes(data.review.notes ?? "");
      setMissingRequirements([]);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to load review.");
    } finally {
      setLoading(false);
    }
  }, [kind]);

  React.useEffect(() => {
    void loadReview();
  }, [loadReview]);

  const openFeedback = (transaction: Transaction) => {
    setSelectedTransaction(toDisplayTransaction(transaction));
    setFeedbackOpen(true);
  };

  const handleComplete = async () => {
    if (!overview || submitting) return;

    try {
      setSubmitting(true);
      const payload = kind === "weekly"
        ? await GamificationAPI.completeWeeklyReviewFlow(summary, { notes: notes.trim() || undefined })
        : await GamificationAPI.completeMonthlyReviewFlow(summary, { notes: notes.trim() || undefined });
      setOverview(payload);
      setMissingRequirements(payload.missing_requirements ?? []);
      toast.success(
        payload.point_event
          ? `${kind === "weekly" ? "Weekly" : "Monthly"} review complete. +${payload.point_event.points} points`
          : "Review completed.",
      );
    } catch (error) {
      console.error(error);
      const parsed = parseApiErrorResponse(error);
      if (parsed?.missing_requirements?.length) {
        setMissingRequirements(parsed.missing_requirements);
      }
      toast.error(parsed?.detail ?? (error instanceof Error ? error.message : "Failed to complete review."));
    } finally {
      setSubmitting(false);
    }
  };

  const title = kind === "weekly" ? "Weekly Review" : "Monthly Review";
  const accent = kind === "weekly" ? COLORS.electricGreen : COLORS.electricBlue;

  if (loading) {
    return (
      <ElectricCard semanticColor={accent} elevation={1}>
        <div className="py-16 text-center text-xs font-black uppercase tracking-[0.3em] text-gray-600">
          Loading {kind} review...
        </div>
      </ElectricCard>
    );
  }

  if (!overview) {
    return (
      <ElectricCard semanticColor={COLORS.electricYellow} elevation={1}>
        <div className="space-y-3">
          <div className="text-sm font-black uppercase tracking-[0.24em] text-gray-500">{title}</div>
          <div className="text-2xl font-black text-white">Could not load review data</div>
          <div className="text-sm text-gray-400">
            Try refreshing the page once the backend is available again.
          </div>
          <Button onClick={() => void loadReview()} className="rounded-2xl bg-cyan-500 text-[#0B1220] hover:bg-cyan-400">
            Retry
          </Button>
        </div>
      </ElectricCard>
    );
  }

  const review = overview.review;

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-gray-500 transition-colors hover:text-cyan-400">
            <ArrowLeft size={14} />
            Back to dashboard
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">{title}</h1>
            <p className="mt-2 text-sm text-gray-400">
              {overview.period_label} · review meaningful purchases, then capture a short summary before points are awarded.
            </p>
          </div>
        </div>
        <div className={cn("rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em]", statusTone(review))}>
          {review.status === "completed" ? "Completed" : "Open"}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ElectricCard semanticColor={accent} elevation={1}>
          <div className="mb-6 flex items-center gap-2">
            <Sparkles size={18} style={{ color: accent }} />
            <h2 className="text-lg font-black text-white">Review readiness</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.8rem] border border-white/[0.05] bg-white/[0.02] p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Reviewed transactions</div>
              <div className="mt-3 text-3xl font-black text-white">{overview.reviewed_transaction_count}</div>
              <div className="mt-2 text-xs font-bold text-gray-500">
                Need {overview.minimum_transactions_required} to complete
              </div>
            </div>
            <div className="rounded-[1.8rem] border border-white/[0.05] bg-white/[0.02] p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Pending feedback</div>
              <div className="mt-3 text-3xl font-black text-white">{overview.pending_transaction_feedback_count}</div>
              <div className="mt-2 text-xs font-bold text-gray-500">
                Purchases still worth revisiting
              </div>
            </div>
            <div className="rounded-[1.8rem] border border-white/[0.05] bg-white/[0.02] p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Completion state</div>
              <div className="mt-3 text-3xl font-black text-white">
                {overview.eligible_to_complete ? "Ready" : "In progress"}
              </div>
              <div className="mt-2 text-xs font-bold text-gray-500">
                {review.status === "completed" ? "Already submitted for this period" : "Finish feedback + summary to earn points"}
              </div>
            </div>
          </div>

          {(missingRequirements.length > 0 || !overview.eligible_to_complete) && (
            <div className="mt-6 rounded-[1.8rem] border border-yellow-500/20 bg-yellow-500/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-yellow-200">
                <Clock3 size={16} />
                Still needed before completion
              </div>
              <div className="space-y-2 text-sm text-yellow-100/90">
                {(missingRequirements.length > 0 ? missingRequirements : overview.summary_requirements.filter((field) => !summary[field]?.trim()))
                  .map((requirement) => (
                    <div key={requirement}>• {formatMissingRequirement(requirement)}</div>
                  ))}
                {!overview.eligible_to_complete && !missingRequirements.includes("reviewed_transactions") && overview.reviewed_transaction_count < overview.minimum_transactions_required ? (
                  <div>• {formatMissingRequirement("reviewed_transactions")}</div>
                ) : null}
              </div>
            </div>
          )}
        </ElectricCard>

        <ElectricCard semanticColor={COLORS.electricPurple} elevation={1}>
          <div className="mb-6 flex items-center gap-2">
            <FileText size={18} className="text-purple-300" />
            <h2 className="text-lg font-black text-white">Summary</h2>
          </div>
          <div className="space-y-5">
            {overview.summary_requirements.map((field) => {
              const copy = FIELD_COPY[field] ?? {
                label: field.replace(/_/g, " "),
                placeholder: "Add your reflection here.",
              };
              return (
                <div key={field} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">
                    {copy.label}
                  </label>
                  <textarea
                    value={summary[field] ?? ""}
                    onChange={(event) => setSummary((current) => ({ ...current, [field]: event.target.value }))}
                    rows={3}
                    className="w-full rounded-[1.4rem] border border-white/10 bg-[#0B1220] px-4 py-3 text-sm font-medium text-white outline-none transition-colors focus:border-cyan-500/40"
                    placeholder={copy.placeholder}
                  />
                </div>
              );
            })}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="w-full rounded-[1.4rem] border border-white/10 bg-[#0B1220] px-4 py-3 text-sm font-medium text-white outline-none transition-colors focus:border-cyan-500/40"
                placeholder="Optional context you want to preserve with this review."
              />
            </div>
            <Button
              onClick={handleComplete}
              disabled={submitting || review.status === "completed"}
              className="w-full rounded-2xl bg-cyan-500 text-[#0B1220] hover:bg-cyan-400"
            >
              {review.status === "completed"
                ? "Review completed"
                : submitting
                  ? "Submitting..."
                  : `Complete ${kind} review`}
            </Button>
          </div>
        </ElectricCard>
      </div>

      <ElectricCard semanticColor={COLORS.electricCyan} elevation={1}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-cyan-300" />
            <h2 className="text-lg font-black text-white">Transactions to review</h2>
          </div>
          <Button variant="outline" onClick={() => void loadReview()} className="rounded-2xl border-white/10">
            <RefreshCw size={14} className="mr-2" />
            Refresh
          </Button>
        </div>
        {overview.transaction_candidates.length === 0 ? (
          <div className="rounded-[1.8rem] border border-white/[0.05] bg-white/[0.02] p-8 text-sm font-bold text-gray-500">
            No transaction candidates right now. If you’ve already reviewed your purchases for this period, you can finish the summary above.
          </div>
        ) : (
          <div className="space-y-3">
            {overview.transaction_candidates.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[1.8rem] border border-white/[0.05] bg-white/[0.02] p-5"
              >
                <div>
                  <div className="text-lg font-black text-white">{transaction.description_raw || transaction.category}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                    {new Date(transaction.occurred_at).toLocaleDateString()} · {transaction.category}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xl font-black text-white">{currencyAmount(transaction.amount)}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-600">
                      {transaction.direction}
                    </div>
                  </div>
                  <Button onClick={() => openFeedback(transaction)} className="rounded-2xl bg-cyan-500 text-[#0B1220] hover:bg-cyan-400">
                    Review purchase
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ElectricCard>

      {kind === "monthly" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <SubscriptionNudgesCard
            title="Upcoming renewals"
            icon={<Calendar size={18} className="text-yellow-300" />}
            emptyText="No renewals are coming up in the next two weeks."
            subscriptions={overview.upcoming_subscription_renewals}
          />
          <SubscriptionNudgesCard
            title="Low-value subscriptions"
            icon={<Target size={18} className="text-red-300" />}
            emptyText="No low-value subscription flags right now."
            subscriptions={overview.low_value_subscriptions}
          />
        </div>
      ) : null}

      <TransactionFeedbackModal
        transaction={selectedTransaction}
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        onSubmitted={() => {
          setFeedbackOpen(false);
          void loadReview();
        }}
      />
    </div>
  );
}

function SubscriptionNudgesCard({
  title,
  icon,
  subscriptions,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  subscriptions: ReviewSubscription[];
  emptyText: string;
}) {
  return (
    <ElectricCard semanticColor={COLORS.electricYellow} elevation={1}>
      <div className="mb-5 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-black text-white">{title}</h2>
      </div>
      {subscriptions.length === 0 ? (
        <div className="rounded-[1.8rem] border border-white/[0.05] bg-white/[0.02] p-6 text-sm font-bold text-gray-500">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="rounded-[1.8rem] border border-white/[0.05] bg-white/[0.02] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-black text-white">{subscription.plan_name || "Subscription"}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                    {subscription.billing_cycle} · {subscription.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-white">{currencyAmount(subscription.price)}</div>
                  {subscription.renewal_date ? (
                    <div className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                      Renews {new Date(subscription.renewal_date).toLocaleDateString()}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                {subscription.subscription_utilization != null ? (
                  <span className="rounded-full border border-white/10 px-3 py-1">
                    Utilization {Math.round(subscription.subscription_utilization * 100)}%
                  </span>
                ) : null}
                {subscription.subscription_cost_benefit != null ? (
                  <span className="rounded-full border border-white/10 px-3 py-1">
                    Cost benefit {Math.round(subscription.subscription_cost_benefit * 100)}%
                  </span>
                ) : null}
                {subscription.feedback_value_score != null ? (
                  <span className="rounded-full border border-white/10 px-3 py-1">
                    Value score {Math.round(subscription.feedback_value_score * 100)}%
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </ElectricCard>
  );
}
