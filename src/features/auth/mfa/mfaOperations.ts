import { supabase } from "@/api/supabaseClient";

export type MfaFactorView = {
  id: string;
  friendlyName: string;
  factorType: string;
  status: string;
};

export type MfaSnapshot = {
  currentLevel: "aal1" | "aal2" | null;
  nextLevel: "aal1" | "aal2" | null;
  factors: MfaFactorView[];
};

export async function getMfaSnapshot(): Promise<MfaSnapshot> {
  const [{ data: aal, error: aalErr }, { data: factorsData, error: facErr }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  if (aalErr) throw aalErr;
  if (facErr) throw facErr;

  const totp = factorsData?.totp ?? [];
  const factors: MfaFactorView[] = totp.map((f: { id: string; friendly_name?: string; factor_type: string; status: string }) => ({
    id: f.id,
    friendlyName: f.friendly_name ?? "Authenticator",
    factorType: f.factor_type,
    status: f.status,
  }));

  return {
    currentLevel: (aal?.currentLevel as "aal1" | "aal2") ?? null,
    nextLevel: (aal?.nextLevel as "aal1" | "aal2") ?? null,
    factors,
  };
}

export async function enrollTotpFactor(friendlyName = "Authenticator app") {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName,
  });
  if (error) throw error;
  if (!data) throw new Error("MFA enroll returned no data");
  return data;
}

/** Complete TOTP enrollment with a code from the authenticator app. */
export async function verifyTotpEnrollment(factorId: string, code: string) {
  const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
  if (cErr) throw cErr;
  if (!challenge) throw new Error("MFA challenge failed");

  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code: code.replace(/\s/g, ""),
  });
  if (error) throw error;
  if (!data) throw new Error("MFA verify returned no data");
  return data;
}

/** Elevate session to AAL2 when MFA is already enrolled (challenge + verify). */
export async function verifyMfaChallenge(factorId: string, code: string) {
  return verifyTotpEnrollment(factorId, code);
}

export async function unenrollFactor(factorId: string): Promise<void> {
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw error;
}
