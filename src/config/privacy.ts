/**
 * Privacy policy metadata (config-driven). Override via VITE_* env in deployment.
 * The frontend cannot enforce backend retention or encryption; copy stays factual.
 */

export type PrivacyPolicyMeta = {
  version: string;
  effectiveDate: string;
  supportEmail: string;
  privacyEmail: string;
};

export function getPrivacyPolicyMeta(): PrivacyPolicyMeta {
  return {
    version: import.meta.env.VITE_PRIVACY_POLICY_VERSION ?? "1.0",
    effectiveDate: import.meta.env.VITE_PRIVACY_POLICY_EFFECTIVE_DATE ?? "2026-03-01",
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL ?? "support@example.com",
    privacyEmail: import.meta.env.VITE_PRIVACY_EMAIL ?? "privacy@example.com",
  };
}

export function getPrivacyPolicyPath(): string {
  return "/privacy";
}
