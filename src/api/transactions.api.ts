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

export type NewTransaction = {
  description_raw: string;
  amount: string;
  direction: string;
  category: string;
  occurred_at: string;
  satisfaction_rating: number | null;
};

export const TransactionsAPI = {
  recent: () => apiRequest<Transaction[]>(`/api/transactions/`),
  list: (params?: { category?: string; direction?: string; date_from?: string; date_to?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.direction) query.set("direction", params.direction);
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    const qs = query.toString();
    return apiRequest<Transaction[]>(`/api/transactions/${qs ? `?${qs}` : ""}`);
  },
  create: (data: NewTransaction) =>
    apiRequest<Transaction>("/api/transactions/", {
      method: "POST",
      body: JSON.stringify({ ...data, currency: "USD", payment_channel: "card" }),
    }),
};