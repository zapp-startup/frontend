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
  regret_rating?: number | null;
  repurchase_likelihood?: number | null;
  usage_frequency?: number | null;
  reflection_text?: string | null;
  considered_at?: string | null;
  feedback_value_score?: number | null;
  feedback_confidence?: number | null;
  value_score?: number | null;
  value_score_source?: string | null;
  value_score_confidence?: number | null;
};

export type NewTransaction = {
  description_raw: string;
  amount: string;
  direction: string;
  category: string;
  occurred_at: string;
  satisfaction_rating: number | null;
};

/** Response item from GET /api/transactions/feedback-candidates/ */
export type FeedbackCandidate = {
  transaction_id: number | string;
};

/** Payload for transaction-level feedback (ML pipeline). */
export type TransactionFeedbackPayload = {
  satisfaction_rating: number;
  regret_rating: number;
  repurchase_likelihood: number;
  usage_frequency?: number;
  reflection_text?: string;
  considered_at: string;
};

export const TransactionsAPI = {
  recent: (limit = 6) => apiRequest<Transaction[]>(`/api/transactions/?limit=${limit}`, { requireAuth: true }),
  /** Fetch transactions recommended for feedback by the ML pipeline. */
  getFeedbackCandidates: () =>
    apiRequest<FeedbackCandidate[]>("/api/transactions/feedback-candidates/", { requireAuth: true }),
  list: (params?: { category?: string; direction?: string; date_from?: string; date_to?: string; limit?: number; signal?: AbortSignal; }) => {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.direction) query.set("direction", params.direction);
  if (params?.date_from) query.set("date_from", params.date_from);
  if (params?.date_to) query.set("date_to", params.date_to);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiRequest<Transaction[]>(`/api/transactions/${qs ? `?${qs}` : ""}`, { requireAuth: true, signal: params?.signal, });
},
  create: (data: NewTransaction) =>
    apiRequest<Transaction>("/api/transactions/", {
      requireAuth: true,
      method: "POST",
      body: JSON.stringify({ ...data, currency: "USD", payment_channel: "card" }),
      audit: { eventName: "transaction.create", action: "create", resourceType: "transaction" },
    }),
  update: (id: number, data: Partial<NewTransaction>) =>
    apiRequest<Transaction>(`/api/transactions/${id}/`, {
      requireAuth: true,
      method: "PUT",
      body: JSON.stringify(data),
      audit: { eventName: "transaction.update", action: "update", resourceType: "transaction", resourceId: id },
    }),
  patch: (id: number, data: Partial<NewTransaction> | Partial<TransactionFeedbackPayload>) =>
    apiRequest<Transaction>(`/api/transactions/${id}/`, {
      requireAuth: true,
      method: "PATCH",
      body: JSON.stringify(data),
      audit: { eventName: "transaction.update", action: "update", resourceType: "transaction", resourceId: id },
    }),
  /** Submit transaction-level feedback for ML pipeline. Uses PATCH. */
  submitFeedback: (id: number, payload: TransactionFeedbackPayload) =>
    apiRequest<Transaction>(`/api/transactions/${id}/`, {
      requireAuth: true,
      method: "PATCH",
      body: JSON.stringify(payload),
      audit: { eventName: "transaction.feedback", action: "update_feedback", resourceType: "transaction", resourceId: id },
    }),
  score: (id: number) =>
    apiRequest<Transaction>(`/api/transactions/${id}/score/`, {
      requireAuth: true,
      method: "POST",
      body: JSON.stringify({}),
      audit: { eventName: "transaction.score", action: "score", resourceType: "transaction", resourceId: id },
    }),
  remove: (id: number) =>
    apiRequest<null>(`/api/transactions/${id}/`, {
      requireAuth: true,
      method: "DELETE",
      audit: { eventName: "transaction.delete", action: "delete", resourceType: "transaction", resourceId: id },
    }),
};
