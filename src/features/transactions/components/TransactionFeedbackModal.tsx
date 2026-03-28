import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import { COLORS } from "@/shared/theme";
import {
  TransactionsAPI,
  type TransactionFeedbackPayload,
} from "@/api/transactions.api";
import { BankingAPI } from "@/api/banking.api";
import { toast } from "sonner";
import type { DisplayTransaction } from "../utils/normalizeBankTransaction";
import { getFeedbackWording } from "../utils/feedbackWording";

type FeedbackForm = {
  satisfaction_rating: number | null;
  regret_rating: number;
  repurchase_likelihood: number;
  usage_frequency: string;
  reflection_text: string;
};

const INITIAL_FORM: FeedbackForm = {
  satisfaction_rating: null,
  regret_rating: 50,
  repurchase_likelihood: 50,
  usage_frequency: "",
  reflection_text: "",
};

function getPlaidId(displayId: string | number): string | null {
  if (typeof displayId !== "string") return null;
  if (!displayId.startsWith("bank-")) return null;
  return displayId.slice(5);
}

export function TransactionFeedbackModal({
  transaction,
  open,
  onOpenChange,
  onSubmitted,
}: {
  transaction: DisplayTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}) {
  const [form, setForm] = React.useState<FeedbackForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = React.useState(false);

  const isManual = transaction?.source === "manual" && typeof transaction.id === "number";
  const isBank = transaction?.source === "bank";
  const plaidId = transaction ? getPlaidId(transaction.id) : null;
  const canSubmit = isManual || (isBank && plaidId);

  const wording = transaction ? getFeedbackWording(transaction.category) : null;

  React.useEffect(() => {
    if (open && transaction) {
      setForm({
        satisfaction_rating: transaction.satisfaction_rating ?? null,
        regret_rating: transaction.regret_rating ?? 50,
        repurchase_likelihood: transaction.repurchase_likelihood ?? 50,
        usage_frequency: transaction.usage_frequency != null ? String(transaction.usage_frequency) : "",
        reflection_text: transaction.reflection_text ?? "",
      });
    } else if (!open) {
      setForm(INITIAL_FORM);
    }
  }, [open, transaction]);

  const set = <K extends keyof FeedbackForm>(key: K, val: FeedbackForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!canSubmit || !transaction) return;

    if (form.satisfaction_rating == null || form.satisfaction_rating < 1 || form.satisfaction_rating > 10) {
      toast.error("Please rate satisfaction from 1 to 10.");
      return;
    }
    if (form.regret_rating < 0 || form.regret_rating > 100) {
      toast.error("Regret rating must be between 0 and 100.");
      return;
    }
    if (form.repurchase_likelihood < 0 || form.repurchase_likelihood > 100) {
      toast.error("Repurchase likelihood must be between 0 and 100.");
      return;
    }
    const usageNum = form.usage_frequency.trim() ? Number(form.usage_frequency) : undefined;
    if (usageNum !== undefined && (Number.isNaN(usageNum) || usageNum < 0)) {
      toast.error("Usage frequency must be a non-negative number.");
      return;
    }

    const payload: TransactionFeedbackPayload = {
      satisfaction_rating: form.satisfaction_rating,
      regret_rating: Math.round(form.regret_rating),
      repurchase_likelihood: Math.round(form.repurchase_likelihood),
      considered_at: new Date().toISOString(),
    };
    if (usageNum !== undefined) payload.usage_frequency = usageNum;
    if (form.reflection_text.trim()) payload.reflection_text = form.reflection_text.trim();

    setSubmitting(true);
    try {
      if (isManual && typeof transaction.id === "number") {
        await TransactionsAPI.submitFeedback(transaction.id, payload);
      } else if (isBank && plaidId) {
        await BankingAPI.submitFeedback(plaidId, payload);
      } else {
        throw new Error("Invalid transaction for feedback");
      }
      toast.success("Feedback saved!");
      onOpenChange(false);
      onSubmitted?.();
    } catch {
      toast.error("Failed to save feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg bg-[#101A2E] border-white/10 text-white"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white tracking-tight">
            Transaction Feedback
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {transaction.description_raw || "This purchase"} — $
            {Math.abs(Number(transaction.amount)).toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Satisfaction 1–10 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Satisfaction <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("satisfaction_rating", form.satisfaction_rating === n ? null : n)}
                  className="flex-1 min-w-[2.5rem] py-2.5 rounded-xl text-xs font-black transition-all"
                  style={{
                    backgroundColor: form.satisfaction_rating === n ? COLORS.electricCyan : "rgba(255,255,255,0.04)",
                    color: form.satisfaction_rating === n ? "#0B1220" : "#64748b",
                    border: `1px solid ${form.satisfaction_rating === n ? COLORS.electricCyan : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Regret 0–100 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Regret (0 = none, 100 = high)
            </label>
            <div className="flex items-center gap-4">
              <Slider
                value={[form.regret_rating]}
                onValueChange={([v]) => set("regret_rating", v ?? 50)}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-lg font-black w-12 text-right" style={{ color: COLORS.electricCyan }}>
                {Math.round(form.regret_rating)}
              </span>
            </div>
          </div>

          {/* Repurchase likelihood 0–100 — category-aware label */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              {wording?.repurchaseLabel ?? "Would you buy or use this again?"} (0–100)
            </label>
            <div className="flex items-center gap-4">
              <Slider
                value={[form.repurchase_likelihood]}
                onValueChange={([v]) => set("repurchase_likelihood", v ?? 50)}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-lg font-black w-12 text-right" style={{ color: COLORS.electricCyan }}>
                {Math.round(form.repurchase_likelihood)}
              </span>
            </div>
          </div>

          {/* Usage frequency — shown only when meaningful for category */}
          {wording?.showUsageFrequency && (
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                {wording.usageFrequencyLabel ?? "Usage frequency"} <span className="text-gray-600">(optional)</span>
              </label>
              <input
                type="number"
                min={0}
                step={1}
                placeholder={wording.usageFrequencyPlaceholder ?? "e.g. 5"}
                value={form.usage_frequency}
                onChange={(e) => set("usage_frequency", e.target.value)}
                className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-3 px-4 text-white font-bold outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-700"
              />
            </div>
          )}

          {/* Reflection text (optional) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Reflection <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              placeholder="Any thoughts on this purchase..."
              value={form.reflection_text}
              onChange={(e) => set("reflection_text", e.target.value)}
              className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-4 px-5 text-white font-bold outline-none focus:border-cyan-500/50 transition-all h-24 resize-none placeholder:text-gray-700"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 text-gray-400 hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="bg-cyan-500 hover:bg-cyan-600 text-[#0B1220] font-black"
          >
            {submitting ? "Saving..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
