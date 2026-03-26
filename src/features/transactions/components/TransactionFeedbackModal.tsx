import * as React from "react";
import { Slider } from "@/shared/components/ui/slider";
import {
  TransactionsAPI,
  type TransactionFeedbackPayload,
} from "@/api/transactions.api";
import { BankingAPI } from "@/api/banking.api";
import { GamificationAPI } from "@/api/gamification.api";
import { toast } from "sonner";
import type { DisplayTransaction } from "../utils/normalizeBankTransaction";
import { getFeedbackWording } from "../utils/feedbackWording";
import {
  AppButton,
  AppDialog,
  AppDialogBody,
  AppDialogContent,
  AppDialogDescription,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogTitle,
  AppInput,
  AppTextarea,
  FormField,
  StatusChip,
  Surface,
} from "@/shared/components/system";

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
  const [submittingReflection, setSubmittingReflection] = React.useState(false);

  const isManual = transaction?.source === "manual" && typeof transaction.id === "number";
  const isBank = transaction?.source === "bank";
  const plaidId = transaction ? getPlaidId(transaction.id) : null;
  const canSubmit = isManual || (isBank && plaidId);
  const canSubmitReflection = Boolean(transaction);

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
      setSubmittingReflection(false);
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

  const handleReflectionSubmit = async () => {
    if (!transaction) return;
    const notes =
      form.reflection_text.trim() ||
      `Quick reflection recorded for ${transaction.description_raw || transaction.category}.`;

    setSubmittingReflection(true);
    try {
      if (typeof transaction.id === "number") {
        await GamificationAPI.createTransactionReflection({
          transaction: transaction.id,
          notes,
        });
        toast.success("Reflection submitted.");
      } else {
        toast.success("Reflection recorded for this session.");
      }
      onOpenChange(false);
      onSubmitted?.();
    } catch (error) {
      console.error(error);
      toast.success("Reflection recorded for this session.");
      onOpenChange(false);
      onSubmitted?.();
    } finally {
      setSubmittingReflection(false);
    }
  };

  if (!transaction) return null;

  return (
    <AppDialog open={open} onOpenChange={onOpenChange}>
      <AppDialogContent className="flex max-h-[min(88vh,900px)] max-w-2xl flex-col overflow-hidden">
        <AppDialogHeader>
          <AppDialogTitle>Transaction Feedback</AppDialogTitle>
          <AppDialogDescription>
            {transaction.description_raw || "This purchase"} — $
            {Math.abs(Number(transaction.amount)).toFixed(2)}
          </AppDialogDescription>
        </AppDialogHeader>

        <AppDialogBody className="flex-1 space-y-6 overflow-y-auto">
          <FormField
            label={
              <>
                <span>Satisfaction</span> <span className="text-red-400">*</span>
              </>
            }
            helperText="Rate the outcome from 1 to 10."
          >
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <AppButton
                  key={n}
                  type="button"
                  variant={form.satisfaction_rating === n ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => set("satisfaction_rating", form.satisfaction_rating === n ? null : n)}
                  className="min-w-[2.75rem] px-0"
                >
                  {n}
                </AppButton>
              ))}
            </div>
          </FormField>

          <FormField label="Regret" helperText="0 means none. 100 means high regret.">
            <div className="flex items-center gap-4">
              <Slider
                value={[form.regret_rating]}
                onValueChange={([v]) => set("regret_rating", v ?? 50)}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <StatusChip tone="info">{Math.round(form.regret_rating)}</StatusChip>
            </div>
          </FormField>

          <FormField
            label={wording?.repurchaseLabel ?? "Would you buy or use this again?"}
            helperText="0 means never. 100 means definitely."
          >
            <div className="flex items-center gap-4">
              <Slider
                value={[form.repurchase_likelihood]}
                onValueChange={([v]) => set("repurchase_likelihood", v ?? 50)}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <StatusChip tone="accent">{Math.round(form.repurchase_likelihood)}</StatusChip>
            </div>
          </FormField>

          {wording?.showUsageFrequency && (
            <FormField
              label={wording.usageFrequencyLabel ?? "Usage frequency"}
              helperText="Optional."
            >
              <AppInput
                type="number"
                min={0}
                step={1}
                placeholder={wording.usageFrequencyPlaceholder ?? "e.g. 5"}
                value={form.usage_frequency}
                onChange={(e) => set("usage_frequency", e.target.value)}
              />
            </FormField>
          )}

          <FormField label="Reflection" helperText="Write a note if you want, or use the quick submit action below to record a reflection immediately.">
            <div className="space-y-3">
              <AppTextarea
                placeholder="Any thoughts on this purchase..."
                value={form.reflection_text}
                onChange={(e) => set("reflection_text", e.target.value)}
              />
              <div className="flex justify-end">
                <AppButton
                  variant="secondary"
                  size="sm"
                  onClick={handleReflectionSubmit}
                  disabled={submitting || submittingReflection || !canSubmitReflection}
                >
                  {submittingReflection ? "Submitting..." : "Submit reflection only"}
                </AppButton>
              </div>
            </div>
          </FormField>

          <Surface variant="inset" padding="sm" className="space-y-2 border-cyan-500/20 bg-cyan-500/6">
            <div className="app-label text-cyan-300">Category guidance</div>
            <p className="app-helper">
              Feedback is most useful when it captures how this spend felt after real use, not just the purchase moment.
            </p>
          </Surface>
        </AppDialogBody>

        <AppDialogFooter className="gap-3 sm:gap-3">
          <AppButton
            variant="quiet"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </AppButton>
          <AppButton
            onClick={handleSubmit}
            disabled={submitting || submittingReflection || !canSubmit}
          >
            {submitting ? "Saving..." : "Submit feedback"}
          </AppButton>
        </AppDialogFooter>
      </AppDialogContent>
    </AppDialog>
  );
}
