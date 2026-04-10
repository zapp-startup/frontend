import type { Transaction } from "@/api/transactions.api";

export function deriveTransactionValueScore(tx: Transaction): number | null {
  if (typeof tx.personal_value_score !== "number") return null;
  return Math.max(0, Math.min(150, Math.round(tx.personal_value_score)));
}
