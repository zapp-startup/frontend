import { describe, it, expect, vi, beforeEach } from "vitest";
import { recordFinancialDataConsent, fetchAuthAssurance, fetchConsentStatus } from "../compliance.api";
import { apiRequest } from "../client";

vi.mock("../client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../client")>();
  return {
    ...actual,
    apiRequest: vi.fn(),
  };
});

describe("compliance.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchAuthAssurance calls auth-assurance endpoint", async () => {
    const body = {
      mfa_required_by_policy: false,
      assurance: { aal: "aal2" as string | null, amr: ["mfa"], mfa_factors_count: 1 },
      banking_allowed: true,
      blocking_code: null,
    };
    vi.mocked(apiRequest).mockResolvedValueOnce(body);
    const r = await fetchAuthAssurance();
    expect(r).toEqual(body);
    expect(apiRequest).toHaveBeenCalledWith("/api/security/auth-assurance/", { requireAuth: true });
  });

  it("fetchConsentStatus calls consent status endpoint", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ financial_data_access: false });
    const r = await fetchConsentStatus();
    expect(r.financial_data_access).toBe(false);
    expect(apiRequest).toHaveBeenCalledWith("/api/compliance/consent/status/", { requireAuth: true });
  });

  it("recordFinancialDataConsent sends consent_type and policy_version", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({});
    await recordFinancialDataConsent("2.1.0");
    expect(apiRequest).toHaveBeenCalledWith(
      "/api/compliance/consent/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          consent_type: "financial_data_access",
          policy_version: "2.1.0",
        }),
        requireAuth: true,
      })
    );
  });

  it("recordFinancialDataConsent propagates errors (no silent 404)", async () => {
    const { ApiError } = await import("../client");
    vi.mocked(apiRequest).mockRejectedValueOnce(new ApiError("Not found", 404));
    await expect(recordFinancialDataConsent("1.0")).rejects.toBeTruthy();
  });
});
