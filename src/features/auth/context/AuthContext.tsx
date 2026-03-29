import * as React from "react";
import type { Session } from "@supabase/supabase-js";
import { apiRequest, getApiAccessToken, getApiConfigurationError, setApiAccessToken } from "@/api/client";
import { supabase } from "@/api/supabaseClient";
import { fetchAuthAssurance, type AuthAssuranceResponse } from "@/api/compliance.api";
import {
  enrollTotpFactor as mfaEnrollTotp,
  getMfaSnapshot,
  unenrollFactor as mfaUnenroll,
  verifyMfaChallenge as mfaVerifyChallenge,
  verifyTotpEnrollment as mfaVerifyTotpEnrollment,
  type MfaSnapshot,
} from "@/features/auth/mfa/mfaOperations";

export type User = {
  id: number | string;
  supabaseUid: string;
  username: string;
  name: string;
  email: string;
  tier?: string;
  createdAt: string;
};

export type BackendUserProfile = {
  id: number;
  email: string;
  username: string;
  supabase_uid: string;
};

/** Why bank linking may be blocked (aligned with auth-assurance blocking_code + client checks). */
export type BankLinkGateReason =
  | "api_misconfigured"
  | "mfa_loading"
  | "auth_assurance_unavailable"
  | "mfa_not_enrolled"
  | "mfa_verification_needed"
  | "mfa_required"
  | null;

export type RefreshMfaResult = {
  gate: { can: boolean; reason: BankLinkGateReason };
  mfaSnapshot: MfaSnapshot | null;
};

type AuthContextValue = {
  user: User | null;
  backendUser: BackendUserProfile | null;
  isAuthenticated: boolean;
  /** True after the first session check has completed; use to avoid redirecting before bootstrap. */
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; session?: Session | null }>;
  signUp: (data: SignUpData) => Promise<{ ok: boolean; error?: string; requiresVerification?: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, "name" | "tier">>) => Promise<{ ok: boolean; error?: string }>;
  /** MFA / strong-auth state for Plaid and bank linking. */
  mfaSnapshot: MfaSnapshot | null;
  mfaLoading: boolean;
  mfaError: string | null;
  authAssurance: AuthAssuranceResponse | null;
  refreshMfa: () => Promise<RefreshMfaResult>;
  /** True when auth-assurance reports banking_allowed (and checks pass). */
  canLinkBank: boolean;
  bankLinkGateReason: BankLinkGateReason;
  enrollTotpFactor: () => ReturnType<typeof mfaEnrollTotp>;
  verifyTotpEnrollment: (factorId: string, code: string) => ReturnType<typeof mfaVerifyTotpEnrollment>;
  verifyMfaChallenge: (factorId: string, code: string) => ReturnType<typeof mfaVerifyChallenge>;
  unenrollMfaFactor: (factorId: string) => Promise<void>;
};

export type SignUpData = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

function mapSupabaseUser(u: any): User {
  const meta = (u?.user_metadata ?? {}) as Record<string, any>;
  const email = u.email ?? "";
  const fallbackName = email ? String(email).split("@")[0] : "User";

  return {
    id: u.id,
    supabaseUid: u.id,
    username: (meta.username as string) ?? fallbackName,
    name: (meta.name as string) ?? fallbackName,
    email,
    tier: meta.tier as string | undefined,
    createdAt: u.created_at ?? new Date().toISOString(),
  };
}

function mergeBackendProfile(user: User, backendUser: BackendUserProfile | null): User {
  if (!backendUser) return user;

  return {
    ...user,
    id: backendUser.id,
    supabaseUid: backendUser.supabase_uid,
    username: backendUser.username,
    name: user.name || backendUser.username,
    email: backendUser.email || user.email,
  };
}

type GateOpts = { loading: boolean; fetchFailed: boolean };

export function computeBankLinkGateFromAssurance(
  apiErr: string | null,
  assurance: AuthAssuranceResponse | null,
  opts: GateOpts
): { can: boolean; reason: BankLinkGateReason } {
  if (apiErr) return { can: false, reason: "api_misconfigured" };
  if (opts.loading) return { can: false, reason: "mfa_loading" };
  if (opts.fetchFailed || assurance === null) return { can: false, reason: "auth_assurance_unavailable" };
  if (!assurance.banking_allowed) {
    const code = assurance.blocking_code;
    if (code === "mfa_not_enrolled") return { can: false, reason: "mfa_not_enrolled" };
    if (code === "mfa_verification_needed") return { can: false, reason: "mfa_verification_needed" };
    if (code === "mfa_required") return { can: false, reason: "mfa_required" };
    return { can: false, reason: "mfa_required" };
  }
  return { can: true, reason: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [backendUser, setBackendUser] = React.useState<BackendUserProfile | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [mfaSnapshot, setMfaSnapshot] = React.useState<MfaSnapshot | null>(null);
  const [mfaLoading, setMfaLoading] = React.useState(false);
  const [mfaError, setMfaError] = React.useState<string | null>(null);
  const [authAssurance, setAuthAssurance] = React.useState<AuthAssuranceResponse | null>(null);
  const backendUserRef = React.useRef<BackendUserProfile | null>(null);
  const syncBackendUserPromiseRef = React.useRef<Promise<BackendUserProfile | null> | null>(null);
  const lastSyncedAccessTokenRef = React.useRef<string | null>(null);

  const updateBackendUser = React.useCallback((profile: BackendUserProfile | null) => {
    backendUserRef.current = profile;
    setBackendUser(profile);
  }, []);

  const refreshMfa = React.useCallback(async () => {
    const token = getApiAccessToken();
    if (!token) {
      setMfaSnapshot(null);
      setAuthAssurance(null);
      setMfaError(null);
      return {
        gate: computeBankLinkGateFromAssurance(getApiConfigurationError(), null, { loading: false, fetchFailed: false }),
        mfaSnapshot: null as MfaSnapshot | null,
      };
    }
    setMfaLoading(true);
    setMfaError(null);
    let snap: MfaSnapshot | null = null;
    try {
      snap = await getMfaSnapshot();
      setMfaSnapshot(snap);
    } catch (e) {
      setMfaSnapshot(null);
      setAuthAssurance(null);
      setMfaError(e instanceof Error ? e.message : "MFA status unavailable");
      return {
        gate: computeBankLinkGateFromAssurance(getApiConfigurationError(), null, { loading: false, fetchFailed: true }),
        mfaSnapshot: null,
      };
    }
    try {
      const assurance = await fetchAuthAssurance();
      setAuthAssurance(assurance);
      setMfaError(null);
      return {
        gate: computeBankLinkGateFromAssurance(getApiConfigurationError(), assurance, { loading: false, fetchFailed: false }),
        mfaSnapshot: snap,
      };
    } catch (e) {
      setAuthAssurance(null);
      setMfaError(e instanceof Error ? e.message : "Security check failed");
      return {
        gate: computeBankLinkGateFromAssurance(getApiConfigurationError(), null, { loading: false, fetchFailed: true }),
        mfaSnapshot: snap,
      };
    } finally {
      setMfaLoading(false);
    }
  }, []);

  const syncBackendUser = React.useCallback(async () => {
    const currentAccessToken = getApiAccessToken();
    if (currentAccessToken && lastSyncedAccessTokenRef.current === currentAccessToken && backendUserRef.current) {
      return backendUserRef.current;
    }

    if (syncBackendUserPromiseRef.current) {
      return syncBackendUserPromiseRef.current;
    }

    syncBackendUserPromiseRef.current = (async () => {
      try {
        const profile = await apiRequest<BackendUserProfile>("/api/auth/sync/", {
          requireAuth: true,
          method: "POST",
        });
        lastSyncedAccessTokenRef.current = currentAccessToken;
        updateBackendUser(profile);
        setUser((prev) => (prev ? mergeBackendProfile(prev, profile) : prev));
        return profile;
      } catch {
        updateBackendUser(null);
        return null;
      } finally {
        syncBackendUserPromiseRef.current = null;
      }
    })();

    return syncBackendUserPromiseRef.current;
  }, [updateBackendUser]);

  const applySession = React.useCallback(
    async (session: Session | null, shouldSyncBackend: boolean) => {
      const accessToken = session?.access_token ?? null;
      setApiAccessToken(accessToken);

      const sbUser = session?.user ?? null;
      if (!sbUser) {
        setUser(null);
        updateBackendUser(null);
        lastSyncedAccessTokenRef.current = null;
        return;
      }

      const mappedUser = mapSupabaseUser(sbUser);
      setUser(mergeBackendProfile(mappedUser, backendUserRef.current));

      if (shouldSyncBackend) {
        await syncBackendUser();
      }
    },
    [syncBackendUser, updateBackendUser]
  );

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        setApiAccessToken(null);
        setUser(null);
        updateBackendUser(null);
      } else {
        await applySession(data.session, !!data.session);
      }
      setAuthLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      const shouldSyncBackend = event === "SIGNED_IN";
      await applySession(session, shouldSyncBackend);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [applySession]);

  React.useEffect(() => {
    if (user) {
      void refreshMfa();
    } else {
      setMfaSnapshot(null);
      setAuthAssurance(null);
      setMfaError(null);
    }
  }, [user, refreshMfa]);

  const login = React.useCallback(async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return { ok: false, error: error.message };

    setApiAccessToken(data.session?.access_token ?? null);
    if (data.session) {
      await syncBackendUser();
      await refreshMfa();
    }

    return { ok: true, session: data.session };
  }, [syncBackendUser, refreshMfa]);

  const signUp = React.useCallback(async (data: SignUpData) => {
    if (data.password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
      return { ok: false, error: "Passwords do not match." };
    }

    const { error, data: resp } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      options: {
        data: {
          name: data.name.trim(),
          tier: "Intentional Tier",
        },
      },
    });

    if (error) return { ok: false, error: error.message };

    if (resp.session) {
      await applySession(resp.session, true);
    }

    return { ok: true, requiresVerification: !resp.session };
  }, [applySession]);

  const logout = React.useCallback(async () => {
    await supabase.auth.signOut();
    setApiAccessToken(null);
    setUser(null);
    updateBackendUser(null);
    lastSyncedAccessTokenRef.current = null;
  }, [updateBackendUser]);

  const enrollTotpFactor = React.useCallback(() => mfaEnrollTotp(), []);

  const verifyTotpEnrollment = React.useCallback(
    (factorId: string, code: string) =>
      mfaVerifyTotpEnrollment(factorId, code).then(async (r) => {
        await refreshMfa();
        return r;
      }),
    [refreshMfa]
  );

  const verifyMfaChallenge = React.useCallback(
    (factorId: string, code: string) =>
      mfaVerifyChallenge(factorId, code).then(async (r) => {
        await refreshMfa();
        return r;
      }),
    [refreshMfa]
  );

  const unenrollMfaFactor = React.useCallback(
    async (factorId: string) => {
      await mfaUnenroll(factorId);
      await refreshMfa();
    },
    [refreshMfa]
  );

  const { can: canLinkBank, reason: bankLinkGateReason } = React.useMemo(() => {
    const fetchFailed = !mfaLoading && !!mfaError && authAssurance === null;
    return computeBankLinkGateFromAssurance(getApiConfigurationError(), authAssurance, {
      loading: mfaLoading,
      fetchFailed,
    });
  }, [mfaLoading, mfaError, authAssurance]);

  const updateProfile = React.useCallback(async (data: Partial<Pick<User, "name" | "tier">>) => {
    const { error, data: resp } = await supabase.auth.updateUser({
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.tier !== undefined ? { tier: data.tier } : {}),
      },
    });

    if (error) {
      return { ok: false as const, error: error.message };
    }

    const sbUser = resp.user ?? null;
    setUser(sbUser ? mergeBackendProfile(mapSupabaseUser(sbUser), backendUserRef.current) : null);
    return { ok: true as const };
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      backendUser,
      isAuthenticated: !!user,
      isAuthReady: !authLoading,
      login,
      signUp,
      logout,
      updateProfile,
      mfaSnapshot,
      mfaLoading,
      mfaError,
      authAssurance,
      refreshMfa,
      canLinkBank,
      bankLinkGateReason,
      enrollTotpFactor,
      verifyTotpEnrollment,
      verifyMfaChallenge,
      unenrollMfaFactor,
    }),
    [
      user,
      backendUser,
      authLoading,
      login,
      signUp,
      logout,
      updateProfile,
      mfaSnapshot,
      mfaLoading,
      mfaError,
      authAssurance,
      refreshMfa,
      canLinkBank,
      bankLinkGateReason,
      enrollTotpFactor,
      verifyTotpEnrollment,
      verifyMfaChallenge,
      unenrollMfaFactor,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
