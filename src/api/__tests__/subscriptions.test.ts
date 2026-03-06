import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubscriptionsAPI } from "../subscriptions.api";
import { apiRequest } from "../client";

vi.mock("../client", () => ({
  apiRequest: vi.fn(),
}));

describe("subscriptions.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list calls GET /api/subscriptions/", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce([]);

    await SubscriptionsAPI.list();

    expect(apiRequest).toHaveBeenCalledWith("/api/subscriptions/", {
      requireAuth: true,
    });
  });

  it("create sends correct payload", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      id: 1,
      merchant: 1,
      amount: 9.99,
      billing_cycle: "monthly",
      status: "active",
      started_at: "2025-01-01T00:00:00Z",
    });

    await SubscriptionsAPI.create({
      merchant: 1,
      amount: 9.99,
      billing_cycle: "monthly",
      status: "active",
      started_at: "2025-01-01T00:00:00Z",
    });

    expect(apiRequest).toHaveBeenCalledWith(
      "/api/subscriptions/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          merchant: 1,
          amount: 9.99,
          billing_cycle: "monthly",
          status: "active",
          started_at: "2025-01-01T00:00:00Z",
        }),
        requireAuth: true,
      })
    );
  });

  it("remove calls DELETE /api/subscriptions/{id}/", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(null);

    await SubscriptionsAPI.remove(42);

    expect(apiRequest).toHaveBeenCalledWith("/api/subscriptions/42/", {
      method: "DELETE",
      requireAuth: true,
    });
  });
});
