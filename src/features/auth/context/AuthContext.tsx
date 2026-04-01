import * as React from "react";
import { apiRequest, ApiError, getApiConfigurationError } from "@/api/client";
import { fetchAuthAssurance, type AuthAssuranceResponse } from "@/api/compliance.api";
import { emitAuditEvent } from "@/shared/audit/audit";
import {
  enrollTotpFactor as mfaEnrollTotp,
  getMfaSnapshot,
  unenrollFactor as mfaUnenroll,
  verifyMfaChallenge as mfaVerifyChallenge,
  verifyTotpEnrollment as mfaVerifyTotpEnrollment,
  type MfaSnapshot,
} from "@/features/auth/mfa/mfaOperations";

/** GET /api/auth/me/ — canonical session user from Django. */
export type MeResponse = {
  id: number;
  email: string;
  username: string;
  supabase_uid: string;
  name: string;
  tier?: string;
  created_at: string;
};

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
  refreshSession: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
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

function mapMeToUser(me: MeResponse): User {
  return {
    id: me.id,
    supabaseUid: me.supabase_uid,
    username: me.username,
    name: me.name || me.username,
    email: me.email,
    tier: me.tier,
    createdAt: me.created_at,
  };
}

function mapMeToBackend(me: MeResponse): BackendUserProfile {
  return {
    id: me.id,
    email: me.email,
    username: me.username,
    supabase_uid: me.supabase_uid,
  };
}

type SignUpApiResponse = {
  requires_verification?: boolean;
  user?: MeResponse;
};

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
  /** Sync with `user` so `refreshMfa` can run immediately after login before re-render. */
  const userRef = React.useRef<User | null>(null);

  const updateBackendUser = React.useCallback((profile: BackendUserProfile | null) => {
    backendUserRef.current = profile;
    setBackendUser(profile);
  }, []);

  const applyMe = React.useCallback(
    (me: MeResponse | null) => {
      if (!me) {
        userRef.current = null;
        setUser(null);
        updateBackendUser(null);
        return;
      }
      const u = mapMeToUser(me);
      userRef.current = u;
      setUser(u);
      updateBackendUser(mapMeToBackend(me));
    },
    [updateBackendUser]
  );

  const refreshSession = React.useCallback(async () => {
    try {
      const me = await apiRequest<MeResponse>("/api/auth/me/", { requireAuth: true });
      applyMe(me);
      return true;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        applyMe(null);
        return false;
      }
      applyMe(null);
      return false;
    }
  }, [applyMe]);

  const refreshMfa = React.useCallback(async () => {
    if (!userRef.current) {
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
      }
    } finally {
      setMfaLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await refreshSession();
      } finally {
        if (mounted) setAuthLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshSession]);

  React.useEffect(() => {
    if (user) {
      void refreshMfa();
    } else {
      setMfaSnapshot(null);
      setAuthAssurance(null);
      setMfaError(null);
    }
  }, [user, refreshMfa]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      try {
        await apiRequest<MeResponse>("/api/auth/login/", {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });
        const me = await apiRequest<MeResponse>("/api/auth/me/", { requireAuth: true });
        applyMe(me);
        await refreshMfa();

        emitAuditEvent({
          event_name: "auth.login",
          outcome: "success",
          actor_id: me.supabase_uid,
          source_system: "frontend-web",
          action: "login",
          resource_type: "session",
          metadata: { auth_provider: "django_session" },
        });

        return { ok: true as const };
      } catch (e) {
        const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Sign in failed.";
        emitAuditEvent({
          event_name: "auth.login",
          outcome: "failure",
          actor_id: null,
          source_system: "frontend-web",
          action: "login",
          resource_type: "session",
          error_message: message,
          metadata: { auth_provider: "django_session", email_domain: email.trim().toLowerCase().split("@")[1] ?? null },
        });
        return { ok: false as const, error: message };
      }
    },
    [applyMe, refreshMfa]
  );

  const signUp = React.useCallback(async (data: SignUpData) => {
    if (data.password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
      return { ok: false, error: "Passwords do not match." };
    }

    try {
      const resp = await apiRequest<SignUpApiResponse>("/api/auth/signup/", {
        method: "POST",
        body: JSON.stringify({
          email: data.email.trim().toLowerCase(),
          password: data.password,
          name: data.name.trim(),
        }),
      });

      const needsVerify = resp.requires_verification === true;
      if (!needsVerify && resp.user) {
        applyMe(resp.user);
      }

      emitAuditEvent({
        event_name: "auth.signup",
        outcome: "success",
        actor_id: resp.user?.supabase_uid ?? null,
        source_system: "frontend-web",
        action: "signup",
        resource_type: "account",
        metadata: { auth_provider: "django_session", verification_required: needsVerify },
      });

      return { ok: true as const, requiresVerification: needsVerify };
    } catch (e) {
      const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Sign up failed.";
      emitAuditEvent({
        event_name: "auth.signup",
        outcome: "failure",
        actor_id: null,
        source_system: "frontend-web",
        action: "signup",
        resource_type: "account",
        error_message: message,
        metadata: { auth_provider: "django_session", email_domain: data.email.trim().toLowerCase().split("@")[1] ?? null },
      });
      return { ok: false as const, error: message };
    }
  }, [applyMe]);

  const logout = React.useCallback(async () => {
    const actorId = userRef.current?.supabaseUid ?? backendUserRef.current?.supabase_uid ?? null;
    try {
      await apiRequest<null>("/api/auth/logout/", { method: "POST" });
    } catch {
      // Still clear local state so the UI can recover.
    }
    applyMe(null);
    emitAuditEvent({
      event_name: "auth.logout",
      outcome: "success",
      actor_id: actorId,
      source_system: "frontend-web",
      action: "logout",
      resource_type: "session",
    });
  }, [applyMe]);

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

  const updateProfile = React.useCallback(
    async (data: Partial<Pick<User, "name" | "tier">>) => {
      try {
        const me = await apiRequest<MeResponse>("/api/users/profile/", {
          requireAuth: true,
          method: "PATCH",
          body: JSON.stringify({
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.tier !== undefined ? { tier: data.tier } : {}),
          }),
        });
        applyMe(me);
        emitAuditEvent({
          event_name: "account.profile_update",
          outcome: "success",
          actor_id: me.supabase_uid,
          source_system: "frontend-web",
          action: "update_profile",
          resource_type: "account",
          metadata: { updated_fields: Object.keys(data) },
        });
        return { ok: true as const };
      } catch (e) {
        const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Update failed.";
        emitAuditEvent({
          event_name: "account.profile_update",
          outcome: "failure",
          actor_id: userRef.current?.supabaseUid ?? null,
          source_system: "frontend-web",
          action: "update_profile",
          resource_type: "account",
          error_message: message,
          metadata: { updated_fields: Object.keys(data) },
        });
        return { ok: false as const, error: message };
      }
    },
    [applyMe]
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      backendUser,
      isAuthenticated: !!user,
      isAuthReady: !authLoading,
      refreshSession,
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
      refreshSession,
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
