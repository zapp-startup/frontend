import { describe, it, expect } from "vitest";
import { getPrivacyPolicyMeta, getPrivacyPolicyPath } from "../privacy";

describe("privacy config", () => {
  it("getPrivacyPolicyPath returns /privacy", () => {
    expect(getPrivacyPolicyPath()).toBe("/privacy");
  });

  it("getPrivacyPolicyMeta returns version and emails", () => {
    const m = getPrivacyPolicyMeta();
    expect(m.version).toMatch(/\d/);
    expect(m.effectiveDate).toBeTruthy();
    expect(m.supportEmail).toContain("@");
    expect(m.privacyEmail).toContain("@");
  });
});
