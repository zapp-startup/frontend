import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SubscriptionsPage } from "../pages/SubscriptionsPage";
import { PanelProvider } from "@/features/dashboard/context/PanelContext";
import * as api from "@/api";

vi.mock("@/api", () => ({
  SubscriptionsAPI: { list: vi.fn(), remove: vi.fn(), create: vi.fn() },
  MerchantsAPI: { list: vi.fn() },
  SubscriptionValuationsAPI: { list: vi.fn() },
}));

vi.mock("@/api/spotifyIntegration.api", () => ({
  SpotifyIntegrationAPI: {
    getStatus: vi.fn().mockResolvedValue({ connected: false }),
    getInsights: vi.fn().mockResolvedValue(null),
    connect: vi.fn(),
    sync: vi.fn(),
    disconnect: vi.fn(),
    resolveAuthorizationUrl: vi.fn(),
  },
}));

vi.mock("@/config/spotifyIntegration", () => ({
  getSpotifyOAuthReturnUrl: () => "http://localhost/integrations/spotify/callback",
}));

function renderSubscriptions() {
  return render(
    <MemoryRouter>
      <PanelProvider>
        <SubscriptionsPage />
      </PanelProvider>
    </MemoryRouter>
  );
}

describe("SubscriptionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.SubscriptionsAPI.list).mockResolvedValue([]);
    vi.mocked(api.MerchantsAPI.list).mockResolvedValue([
      { id: 1, name: "Netflix", category: "streaming" },
    ]);
    vi.mocked(api.SubscriptionValuationsAPI.list).mockResolvedValue([]);
  });

  it("loads and displays empty state when no subscriptions", async () => {
    renderSubscriptions();

    await waitFor(() => {
      expect(api.SubscriptionsAPI.list).toHaveBeenCalled();
      expect(api.MerchantsAPI.list).toHaveBeenCalled();
    });

    expect(screen.getByRole("heading", { name: /spotify/i })).toBeInTheDocument();
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

    renderSubscriptions();

    await waitFor(() => {
      expect(screen.getByText("Netflix")).toBeInTheDocument();
    });

    expect(screen.getByText("$15.99")).toBeInTheDocument();
  });

  it("uses the 0-150 value scale labels on subscription cards", async () => {
    vi.mocked(api.SubscriptionsAPI.list).mockResolvedValue([
      {
        id: 1,
        merchant: 1,
        merchant_name: "Netflix",
        amount: 15.99,
        billing_cycle: "monthly",
        status: "active",
        started_at: "2025-01-01",
        value_score: 100,
      },
    ]);

    renderSubscriptions();

    await waitFor(() => {
      expect(screen.getAllByText("Decent").length).toBeGreaterThan(0);
    });
  });

  it("still shows subscriptions when valuations fail to load", async () => {
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
    vi.mocked(api.SubscriptionValuationsAPI.list).mockRejectedValue(new Error("valuations unavailable"));

    renderSubscriptions();

    await waitFor(() => {
      expect(screen.getByText("Netflix")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });
});
