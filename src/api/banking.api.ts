import { apiRequest } from "./client";

export type BankConnection = {
  id: string;
  institution_name?: string;
  institution?: string;
  status?: string;
  last_synced_at?: string | null;
};

export type BankAccount = {
  id: string;
  connection_id?: string;
  name?: string;
  type?: string;
  subtype?: string;
  mask?: string;
  current_balance?: number | string | null;
  available_balance?: number | string | null;
};

export type BankTransaction = {
  id: string;
  account_id?: string;
  amount: string | number;
  date?: string;
  occurred_at?: string;
  name?: string;
  merchant_name?: string;
  description_raw?: string;
  direction?: string;
  category?: string;
};

export const BankingAPI = {
  createLinkToken: () =>
    apiRequest<{ link_token: string }>("/api/banking/link-token/", {
      requireAuth: true,
      method: "POST",
      body: JSON.stringify({}),
    }),

  exchangePublicToken: (publicToken: string) =>
    apiRequest<{ ok?: boolean }>("/api/banking/exchange-token/", {
      requireAuth: true,
      method: "POST",
      body: JSON.stringify({ public_token: publicToken }),
    }),

  getConnections: () =>
    apiRequest<BankConnection[]>("/api/banking/connections/", { requireAuth: true }),

  getAccounts: () =>
    apiRequest<BankAccount[]>("/api/banking/accounts/", { requireAuth: true }),

  getTransactions: (params?: { limit?: number; date_from?: string; date_to?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    const qs = query.toString();
    return apiRequest<BankTransaction[]>(
      `/api/banking/transactions/${qs ? `?${qs}` : ""}`,
      { requireAuth: true }
    );
  },

  syncConnection: (connectionId: string) =>
    apiRequest<{ ok?: boolean }>(`/api/banking/connections/${connectionId}/sync/`, {
      requireAuth: true,
      method: "POST",
      body: JSON.stringify({}),
    }),
};
