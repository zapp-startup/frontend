import { apiRequest } from "./client";

export type Subscription = {
  id: number;
  // add real fields later
};

export const SubscriptionsAPI = {
  list: () => apiRequest<Subscription[]>("/api/subscriptions/"),
};
