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
  recent: (limit = 6) => apiRequest<Transaction[]>(`/api/transactions/?limit=${limit}`, { requireAuth: true }),
  list: (params?: {
    category?: string;
    direction?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    signal?: AbortSignal;
  }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.direction) query.set("direction", params.direction);
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiRequest<Transaction[]>(`/api/transactions/${qs ? `?${qs}` : ""}`, {
      requireAuth: true,
      signal: params?.signal,
    });
  },
  create: (data: NewTransaction) =>
    apiRequest<Transaction>("/api/transactions/", {
      requireAuth: true,
      method: "POST",
      body: JSON.stringify({ ...data, currency: "USD", payment_channel: "card" }),
    }),
  update: (id: number, data: Partial<NewTransaction>) =>
    apiRequest<Transaction>(`/api/transactions/${id}/`, {
      requireAuth: true,
      method: "PUT",
      body: JSON.stringify(data),
    }),
  patch: (id: number, data: Partial<NewTransaction>) =>
    apiRequest<Transaction>(`/api/transactions/${id}/`, {
      requireAuth: true,
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    apiRequest<null>(`/api/transactions/${id}/`, {
      requireAuth: true,
      method: "DELETE",
    }),
};
