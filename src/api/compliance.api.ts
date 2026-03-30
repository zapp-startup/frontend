import { apiRequest } from "./client";

/** GET /api/security/auth-assurance/ */
export type AuthAssuranceResponse = {
  mfa_required_by_policy: boolean;
  assurance: {
    aal: string | null;
    amr: string[];
    mfa_factors_count: number;
  };
  banking_allowed: boolean;
  blocking_code: string | null;
};

/** GET /api/compliance/consent/status/ */
export type ConsentStatusResponse = {
  financial_data_access: boolean;
};

/** POST /api/compliance/consent/ */
export type FinancialDataConsentPayload = {
  consent_type: "financial_data_access";
  policy_version: string;
};

export async function fetchAuthAssurance(): Promise<AuthAssuranceResponse> {
  return apiRequest<AuthAssuranceResponse>("/api/security/auth-assurance/", { requireAuth: true });
}

export async function fetchConsentStatus(): Promise<ConsentStatusResponse> {
  return apiRequest<ConsentStatusResponse>("/api/compliance/consent/status/", { requireAuth: true });
}

/**
 * Records affirmative consent before Plaid link-token creation.
 * Failures must surface to the caller (no silent success).
 */
export async function recordFinancialDataConsent(policyVersion: string): Promise<void> {
  const payload: FinancialDataConsentPayload = {
    consent_type: "financial_data_access",
    policy_version: policyVersion,
  };
  await apiRequest<unknown>("/api/compliance/consent/", {
    requireAuth: true,
    method: "POST",
    body: JSON.stringify(payload),
  });
}
