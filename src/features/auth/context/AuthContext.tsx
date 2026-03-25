import * as React from "react";
import type { Session } from "@supabase/supabase-js";
import { apiRequest, setApiAccessToken } from "@/api/client";
import { supabase } from "@/api/supabaseClient";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [backendUser, setBackendUser] = React.useState<BackendUserProfile | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const backendUserRef = React.useRef<BackendUserProfile | null>(null);

  const updateBackendUser = React.useCallback((profile: BackendUserProfile | null) => {
    backendUserRef.current = profile;
    setBackendUser(profile);
  }, []);

  const syncBackendUser = React.useCallback(async () => {
    try {
      const profile = await apiRequest<BackendUserProfile>("/api/auth/sync/", {
        requireAuth: true,
        method: "POST",
      });
      updateBackendUser(profile);
      setUser((prev) => (prev ? mergeBackendProfile(prev, profile) : prev));
      return profile;
    } catch {
      updateBackendUser(null);
      return null;
    }
  }, [updateBackendUser]);

  const applySession = React.useCallback(
    async (session: Session | null, shouldSyncBackend: boolean) => {
      const accessToken = session?.access_token ?? null;
      setApiAccessToken(accessToken);

      const sbUser = session?.user ?? null;
      if (!sbUser) {
        setUser(null);
        updateBackendUser(null);
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

  const login = React.useCallback(async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return { ok: false, error: error.message };

    setApiAccessToken(data.session?.access_token ?? null);

    return { ok: true, session: data.session };
  }, []);

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

    return { ok: true };
  }, [applySession]);

  const logout = React.useCallback(async () => {
    await supabase.auth.signOut();
    setApiAccessToken(null);
    setUser(null);
    updateBackendUser(null);
  }, [updateBackendUser]);

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
    }),
    [user, backendUser, authLoading, login, signUp, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
