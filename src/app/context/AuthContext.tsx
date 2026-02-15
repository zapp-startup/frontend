import * as React from "react";
import type { Session } from "@supabase/supabase-js";
import { apiRequest, setApiAccessToken } from "../../api/client";
import { supabase } from "../../api/supabaseClient";

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
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, "name" | "tier">>) => Promise<void>;
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
    // if you store "name" in metadata, use it; otherwise fallback to email prefix
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

  const syncBackendUser = React.useCallback(async () => {
    try {
      const profile = await apiRequest<BackendUserProfile>("/api/auth/sync/", {
        method: "POST",
      });
      setBackendUser(profile);
      setUser((prev) => (prev ? mergeBackendProfile(prev, profile) : prev));
      return profile;
    } catch (error) {
      console.error("Failed to sync backend user:", error);
      setBackendUser(null);
      return null;
    }
  }, []);

  const applySession = React.useCallback(
    async (session: Session | null, shouldSyncBackend: boolean) => {
      const accessToken = session?.access_token ?? null;
      setApiAccessToken(accessToken);

      const sbUser = session?.user ?? null;
      if (!sbUser) {
        setUser(null);
        setBackendUser(null);
        return;
      }

      const mappedUser = mapSupabaseUser(sbUser);
      setUser(mergeBackendProfile(mappedUser, backendUser));

      if (shouldSyncBackend) {
        await syncBackendUser();
      }
    },
    [backendUser, syncBackendUser]
  );

  // Keep local state synced with Supabase session
  React.useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        console.error("getSession error:", error);
        setApiAccessToken(null);
        setUser(null);
        setBackendUser(null);
        return;
      }

      await applySession(data.session, !!data.session);
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
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return { ok: false, error: error.message };

    return { ok: true };
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

    // If email confirmations are OFF, you get a session immediately.
    // If confirmations are ON, session may be null until user confirms.
    const sbUser = resp.user ?? null;
    if (sbUser) setUser(mapSupabaseUser(sbUser));

    return { ok: true };
  }, []);

  const logout = React.useCallback(async () => {
    await supabase.auth.signOut();
    setApiAccessToken(null);
    setUser(null);
    setBackendUser(null);
  }, []);

  const updateProfile = React.useCallback(async (data: Partial<Pick<User, "name" | "tier">>) => {
    // Updates user_metadata in Supabase
    const { error, data: resp } = await supabase.auth.updateUser({
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.tier !== undefined ? { tier: data.tier } : {}),
      },
    });

    if (error) {
      console.error("updateUser error:", error);
      return;
    }

    const sbUser = resp.user ?? null;
    setUser(sbUser ? mergeBackendProfile(mapSupabaseUser(sbUser), backendUser) : null);
  }, [backendUser]);

  const value: AuthContextValue = {
    user,
    backendUser,
    isAuthenticated: !!user,
    login,
    signUp,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
