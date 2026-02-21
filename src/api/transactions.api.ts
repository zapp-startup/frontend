import { apiRequest } from "./client";

export type Transaction = {
  id: number;
  description_raw: string;
  occurred_at: string;
  amount: string;
  direction: string;
  category: string;
  impulse_score: number | null;
  regret_score: number | null;
  satisfaction_rating: number | null;
};

export const TransactionsAPI = {
  recent: (limit = 6) =>
    apiRequest<Transaction[]>(`/api/transactions/`),
};