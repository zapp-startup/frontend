import { apiRequest } from "./client";

export type Subscription = {
  id: number;
  merchant?: number | null;
  merchant_name?: string;
  amount: string | number;
  billing_cycle: string;
  status: string;
  started_at: string;
  notes?: string;
  value_score?: number;
};

export type NewSubscription = {
  merchant?: number;
  merchant_name?: string;
  amount: string | number;
  billing_cycle: string;
  status?: string;
  started_at: string;
  notes?: string;
};

const auth = { requireAuth: true as const };

export const SubscriptionsAPI = {
  list: (opts?: { signal?: AbortSignal }) =>
    apiRequest<Subscription[]>("/api/subscriptions/", { ...auth, signal: opts?.signal }),
  get: (id: number) => apiRequest<Subscription>(`/api/subscriptions/${id}/`, auth),
  create: (data: NewSubscription) =>
    apiRequest<Subscription>("/api/subscriptions/", {
      ...auth,
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<NewSubscription>) =>
    apiRequest<Subscription>(`/api/subscriptions/${id}/`, {
      ...auth,
      method: "PUT",
      body: JSON.stringify(data),
    }),
  patch: (id: number, data: Partial<NewSubscription>) =>
    apiRequest<Subscription>(`/api/subscriptions/${id}/`, {
      ...auth,
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    apiRequest<null>(`/api/subscriptions/${id}/`, { ...auth, method: "DELETE" }),
};
