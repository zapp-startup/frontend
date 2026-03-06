import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubscriptionsPage } from "../pages/SubscriptionsPage";
import * as api from "@/api";

vi.mock("@/api", () => ({
  SubscriptionsAPI: { list: vi.fn(), remove: vi.fn(), create: vi.fn() },
  MerchantsAPI: { list: vi.fn() },
  SubscriptionValuationsAPI: { list: vi.fn() },
}));

describe("SubscriptionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.SubscriptionsAPI.list).mockResolvedValue([]);
    vi.mocked(api.MerchantsAPI.list).mockResolvedValue([
      { id: 1, name: "Netflix", category: "streaming" },
    ]);
  });

  it("loads and displays empty state when no subscriptions", async () => {
    render(<SubscriptionsPage />);

    await waitFor(() => {
      expect(api.SubscriptionsAPI.list).toHaveBeenCalled();
      expect(api.MerchantsAPI.list).toHaveBeenCalled();
    });

    expect(screen.getByText(/No subscriptions yet/i)).toBeInTheDocument();
  });

  it("displays subscriptions when data is loaded", async () => {
    vi.mocked(api.SubscriptionsAPI.list).mockResolvedValue([
      {
        id: 1,
        merchant: 1,
        merchant_name: "Netflix",
        amount: 15.99,
        billing_cycle: "monthly",
        status: "active",
        started_at: "2025-01-01",
      },
    ]);

    render(<SubscriptionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Netflix")).toBeInTheDocument();
    });

    expect(screen.getByText("$15.99")).toBeInTheDocument();
  });
});
