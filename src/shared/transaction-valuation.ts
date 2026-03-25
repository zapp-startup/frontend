import type { Transaction } from "@/api/transactions.api";

export function deriveTransactionValueScore(tx: Transaction): number | null {
  const satisfaction =
    typeof tx.satisfaction_rating === "number"
      ? Math.max(0, Math.min(10, tx.satisfaction_rating)) * 10
      : null;
  const impulsePenalty =
    typeof tx.impulse_score === "number"
      ? Math.max(0, Math.min(100, tx.impulse_score)) * 0.35
      : 0;
  const regretPenalty =
    typeof tx.regret_score === "number"
      ? Math.max(0, Math.min(100, tx.regret_score)) * 0.45
      : 0;

  if (satisfaction == null && impulsePenalty === 0 && regretPenalty === 0) return null;

  const baseline = satisfaction ?? 100;
  return Math.max(0, Math.min(150, Math.round(baseline + 50 - impulsePenalty - regretPenalty)));
}
