import * as React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
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
import { normalizeModelValueScore } from "@/shared/valuation";

type ReviewKind = "weekly" | "monthly";

const REVIEW_THEME: Record<
  ReviewKind,
  {
    title: string;
    eyebrow: string;
    accent: string;
    heroCard: string;
    surfaceCard: string;
    pill: string;
    ring: string;
    progress: string;
    summaryTitle: string;
    summaryDescription: string;
    transactionTitle: string;
    transactionDescription: string;
  }
> = {
  weekly: {
    title: "Weekly Review",
    eyebrow: "Weekly Reset",
    accent: COLORS.electricGreen,
    heroCard: "from-emerald-400/18 via-cyan-400/10 to-transparent",
    surfaceCard: "border-emerald-400/15",
    pill: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    ring: "shadow-[0_0_0_1px_rgba(52,211,153,0.16)]",
    progress: "from-emerald-300 via-cyan-300 to-lime-200",
    summaryTitle: "Lock the lesson in",
    summaryDescription:
      "One win, one miss, and one adjustment for next week.",
    transactionTitle: "Purchases to review",
    transactionDescription:
      "The purchases that mattered most this week.",
  },
  monthly: {
    title: "Monthly Review",
    eyebrow: "Monthly Audit",
    accent: COLORS.electricBlue,
    heroCard: "from-sky-400/18 via-indigo-400/10 to-transparent",
    surfaceCard: "border-sky-400/15",
    pill: "border-sky-400/25 bg-sky-400/10 text-sky-200",
    ring: "shadow-[0_0_0_1px_rgba(56,189,248,0.16)]",
    progress: "from-sky-300 via-cyan-300 to-indigo-200",
    summaryTitle: "Close the month with signal",
    summaryDescription:
      "The best call, the miss, and next month's focus.",
    transactionTitle: "Purchases to review",
    transactionDescription:
      "Start with the biggest purchases, then subscriptions.",
  },
};

const FIELD_COPY: Record<string, { label: string; placeholder: string }> = {
  wins: {
    label: "Biggest win",
    placeholder: "One spending choice to keep.",
  },
  regrets: {
    label: "Biggest miss",
    placeholder: "One purchase or pattern to rethink.",
  },
  adjustment: {
    label: "Next adjustment",
    placeholder: "One change for next week.",
  },
  best_purchase: {
    label: "Best purchase",
    placeholder: "Which purchase delivered the most value?",
  },
  most_regretted_purchase: {
    label: "Most regretted purchase",
    placeholder: "Which purchase missed the mark?",
  },
  next_month_focus: {
    label: "Next month focus",
    placeholder: "What needs the most attention next month?",
  },
};

const MISSING_COPY: Record<string, string> = {
  reviewed_transactions: "Review enough purchases first.",
  wins: "Add your biggest win.",
  regrets: "Add your biggest miss.",
  adjustment: "Add one next step.",
  best_purchase: "Add your best purchase.",
  most_regretted_purchase: "Add your most regretted purchase.",
  next_month_focus: "Add next month's focus.",
};

function formatMissingRequirement(code: string) {
  return MISSING_COPY[code] ?? code.replace(/_/g, " ");
}

function formatCategoryLabel(code: string) {
  return code.replace(/_/g, " ");
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

function currentDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function effectiveReviewEnd(review: PeriodicReview) {
  const today = currentDateKey();
  return review.period_end < today ? review.period_end : today;
}

function occursInReviewWindow(transaction: Transaction, review: PeriodicReview) {
  const occurredOn = transaction.occurred_at.slice(0, 10);
  return occurredOn >= review.period_start && occurredOn <= effectiveReviewEnd(review);
}

function formatDateLabel(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function hasReviewFeedback(transaction: Transaction) {
  return (
    transaction.satisfaction_rating != null ||
    transaction.regret_rating != null ||
    transaction.repurchase_likelihood != null ||
    (transaction.reflection_text?.trim().length ?? 0) > 0
  );
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

  const theme = REVIEW_THEME[kind];
  const accent = theme.accent;

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
          <div className="text-sm font-black uppercase tracking-[0.24em] text-gray-500">{theme.title}</div>
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
  const requiredTransactions = Math.max(overview.minimum_transactions_required, 1);
  const reviewedProgress = Math.min(
    overview.reviewed_transaction_count / requiredTransactions,
    1,
  );
  const filledSummaryFields = overview.summary_requirements.filter(
    (field) => summary[field]?.trim(),
  ).length;
  const summaryProgress =
    overview.summary_requirements.length === 0
      ? 1
      : filledSummaryFields / overview.summary_requirements.length;
  const overallProgress = Math.round(
    (((reviewedProgress * 0.55) + (summaryProgress * 0.45)) || 0) * 100,
  );
  const scopedTransactions = overview.transaction_candidates.filter((transaction) =>
    occursInReviewWindow(transaction, review),
  );
  const reviewScopeLabel = `${formatDateLabel(review.period_start)} - ${formatDateLabel(effectiveReviewEnd(review))}`;
  const outstandingRequirements = [
    ...(missingRequirements.length > 0
      ? missingRequirements
      : overview.summary_requirements.filter((field) => !summary[field]?.trim())),
  ];

  if (
    !outstandingRequirements.includes("reviewed_transactions") &&
    overview.reviewed_transaction_count < overview.minimum_transactions_required
  ) {
    outstandingRequirements.unshift("reviewed_transactions");
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#08111f] p-6 sm:p-8">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br",
            theme.heroCard,
          )}
        />
        <div className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-white/6 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-gray-500 transition-colors hover:text-cyan-400"
              >
                <ArrowLeft size={14} />
                Back to dashboard
              </Link>
              <div className="space-y-3">
                <div className="text-[10px] font-black uppercase tracking-[0.32em] text-cyan-300/80">
                  {theme.eyebrow}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                    {theme.title}
                  </h1>
                  <div
                    className={cn(
                      "rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em]",
                      statusTone(review),
                    )}
                  >
                    {review.status === "completed" ? "Completed" : "Open"}
                  </div>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-gray-300">
                  {overview.period_label}. Review purchases, then finish the summary.
                </p>
              </div>
            </div>

            <div
              className={cn(
                "min-w-[220px] rounded-[1.8rem] border bg-white/[0.03] p-5 backdrop-blur",
                theme.surfaceCard,
                theme.ring,
              )}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-gray-500">
                Completion progress
              </div>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div className="text-5xl font-black tracking-tight text-white">
                  {overallProgress}%
                </div>
                <div
                  className={cn(
                    "rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em]",
                    theme.pill,
                  )}
                >
                  {overview.eligible_to_complete ? "Ready to submit" : "In progress"}
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/6">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                    theme.progress,
                  )}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="mt-3 text-xs font-bold leading-5 text-gray-400">
                {review.status === "completed"
                  ? "This review is complete."
                  : overview.eligible_to_complete
                    ? "Ready to submit."
                    : "Finish the queue and summary."}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <HeroMetricCard
              label="Reviewed purchases"
              value={String(overview.reviewed_transaction_count)}
              note={`Need ${overview.minimum_transactions_required} total`}
            />
            <HeroMetricCard
              label="Pending"
              value={String(overview.pending_transaction_feedback_count)}
              note="Waiting for feedback"
            />
            <HeroMetricCard
              label="Summary"
              value={`${filledSummaryFields}/${overview.summary_requirements.length}`}
              note="Questions answered"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ElectricCard semanticColor={accent} elevation={1} className="overflow-hidden">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={18} style={{ color: accent }} />
                <h2 className="text-lg font-black text-white">Review map</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-gray-400">
                See what's left before you submit.
              </p>
            </div>
            <div
              className={cn(
                "rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em]",
                theme.pill,
              )}
            >
              {kind}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[1.8rem] border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-gray-500">
                Checklist
              </div>
              <div className="mt-4 space-y-3">
                <ChecklistRow
                  done={
                    overview.reviewed_transaction_count >=
                    overview.minimum_transactions_required
                  }
                  title="Review purchases"
                  description={`${overview.reviewed_transaction_count} of ${overview.minimum_transactions_required}`}
                />
                {overview.summary_requirements.map((field) => (
                  <ChecklistRow
                    key={field}
                    done={Boolean(summary[field]?.trim())}
                    title={FIELD_COPY[field]?.label ?? formatCategoryLabel(field)}
                    description={summary[field]?.trim() ? "Done" : "Missing"}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
                <Clock3 size={16} className="text-yellow-300" />
                Still needed
              </div>
              {outstandingRequirements.length === 0 ? (
                <div className="rounded-[1.4rem] border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-bold leading-6 text-emerald-100">
                  Everything is in place. Submit when ready.
                </div>
              ) : (
                <div className="space-y-3">
                  {outstandingRequirements.map((requirement) => (
                    <div
                      key={requirement}
                      className="rounded-[1.4rem] border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold leading-6 text-yellow-100/90"
                    >
                      {formatMissingRequirement(requirement)}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MiniStat
                  label="Review status"
                  value={review.status === "completed" ? "Completed" : "Open"}
                />
                <MiniStat label="Period label" value={overview.period_label} />
              </div>
            </div>
          </div>
        </ElectricCard>

        <ElectricCard
          semanticColor={COLORS.electricPurple}
          elevation={1}
          className="overflow-hidden"
        >
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-purple-300" />
              <h2 className="text-lg font-black text-white">
                {theme.summaryTitle}
              </h2>
            </div>
            <p className="text-sm leading-6 text-gray-400">
              {theme.summaryDescription}
            </p>
          </div>
          <div className="space-y-4">
            {overview.summary_requirements.map((field) => {
              const copy = FIELD_COPY[field] ?? {
                label: field.replace(/_/g, " "),
                placeholder: "Add a note.",
              };
              const filled = Boolean(summary[field]?.trim());
              return (
                <div
                  key={field}
                  className={cn(
                    "rounded-[1.6rem] border bg-white/[0.02] p-4 transition-colors",
                    filled
                      ? "border-cyan-400/20 bg-cyan-400/[0.04]"
                      : "border-white/[0.06]",
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">
                      {copy.label}
                    </label>
                    <div
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em]",
                        filled
                          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                          : "border-white/10 bg-white/[0.03] text-gray-500",
                      )}
                    >
                      {filled ? "Done" : "Needed"}
                    </div>
                  </div>
                  <textarea
                    value={summary[field] ?? ""}
                    onChange={(event) =>
                      setSummary((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full rounded-[1.2rem] border border-white/10 bg-[#0B1220] px-4 py-3 text-sm font-medium leading-6 text-white outline-none transition-colors focus:border-cyan-500/40"
                    placeholder={copy.placeholder}
                  />
                </div>
              );
            })}
            <div className="rounded-[1.6rem] border border-white/[0.06] bg-white/[0.02] p-4">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className="w-full rounded-[1.2rem] border border-white/10 bg-[#0B1220] px-4 py-3 text-sm font-medium leading-6 text-white outline-none transition-colors focus:border-cyan-500/40"
                placeholder="Optional notes."
              />
            </div>
            <Button
              onClick={handleComplete}
              disabled={submitting || review.status === "completed"}
              className="h-14 w-full rounded-[1.2rem] bg-cyan-500 text-sm font-black uppercase tracking-[0.18em] text-[#0B1220] hover:bg-cyan-400"
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

      <ElectricCard
        semanticColor={COLORS.electricCyan}
        elevation={1}
        className="overflow-hidden"
      >
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-cyan-300" />
              <h2 className="text-lg font-black text-white">
                {theme.transactionTitle}
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              {theme.transactionDescription}
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              Showing {reviewScopeLabel} purchases only
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => void loadReview()}
            className="rounded-2xl border-white/10"
          >
            <RefreshCw size={14} className="mr-2" />
            Refresh
          </Button>
        </div>
        {scopedTransactions.length === 0 ? (
          <div className="rounded-[1.8rem] border border-white/[0.05] bg-white/[0.02] p-8 text-sm font-bold leading-6 text-gray-500">
            No purchases to review right now. Finish the summary above if you're ready.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {scopedTransactions.map((transaction) => {
              const reviewed = hasReviewFeedback(transaction);
              return (
                <button
                  key={transaction.id}
                  type="button"
                  onClick={() => openFeedback(transaction)}
                  className="group rounded-[1.8rem] border border-white/[0.06] bg-white/[0.02] p-5 text-left transition-all hover:border-cyan-400/25 hover:bg-cyan-400/[0.04]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300/80">
                          Purchase {String(transaction.id).slice(-3)}
                        </div>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em]",
                            reviewed
                              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                              : "border-yellow-400/25 bg-yellow-400/10 text-yellow-100",
                          )}
                        >
                          {reviewed ? "Reviewed" : "Needs feedback"}
                        </span>
                      </div>
                      <div className="mt-2 truncate text-xl font-black text-white">
                        {transaction.description_raw ||
                          formatCategoryLabel(transaction.category)}
                      </div>
                      <div className="mt-2 text-sm font-bold text-gray-400">
                        {reviewed ? "Feedback saved for this purchase." : "Still needs feedback for this review."}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                        <span className="rounded-full border border-white/10 px-3 py-1">
                          {new Date(transaction.occurred_at).toLocaleDateString()}
                        </span>
                        <span className="rounded-full border border-white/10 px-3 py-1">
                          {formatCategoryLabel(transaction.category)}
                        </span>
                        <span className="rounded-full border border-white/10 px-3 py-1">
                          {transaction.direction}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">
                        {currencyAmount(transaction.amount)}
                      </div>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200 transition-colors group-hover:border-cyan-300/40 group-hover:text-cyan-100">
                        {reviewed ? "Edit feedback" : "Add feedback"}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
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

function HeroMetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur">
      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-gray-500">
        {label}
      </div>
      <div className="mt-3 text-3xl font-black tracking-tight text-white">
        {value}
      </div>
      <div className="mt-2 text-xs font-bold leading-5 text-gray-400">
        {note}
      </div>
    </div>
  );
}

function ChecklistRow({
  done,
  title,
  description,
}: {
  done: boolean;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[1.2rem] border border-white/[0.05] bg-[#0B1220]/80 p-3">
      <div
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
          done
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
            : "border-white/10 bg-white/[0.04] text-gray-500",
        )}
      >
        <CheckCircle2 size={14} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-black text-white">{title}</div>
        <div className="mt-1 text-xs font-bold leading-5 text-gray-500">
          {description}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/[0.05] bg-[#0B1220]/70 p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-black leading-5 text-white">{value}</div>
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
                    Value score {normalizeModelValueScore(subscription.feedback_value_score)}
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
