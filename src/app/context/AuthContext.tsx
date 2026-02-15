import * as React from "react";
import { supabase } from "../../api/supabaseClient";

export type User = {
  id: string;
  name: string;
  email: string;
  tier?: string;
  createdAt: string;
};

type AuthContextValue = {
  user: User | null;
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

  return {
    id: u.id,
    // if you store "name" in metadata, use it; otherwise fallback to email prefix
    name: (meta.name as string) ?? (u.email ? String(u.email).split("@")[0] : "User"),
    email: u.email ?? "",
    tier: meta.tier as string | undefined,
    createdAt: u.created_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);

  // Keep local state synced with Supabase session
  React.useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        console.error("getSession error:", error);
        setUser(null);
        return;
      }

      const sbUser = data.session?.user ?? null;
      setUser(sbUser ? mapSupabaseUser(sbUser) : null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const sbUser = session?.user ?? null;
      setUser(sbUser ? mapSupabaseUser(sbUser) : null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return { ok: false, error: error.message };

    // onAuthStateChange will set user; but we can also set immediately
    const sbUser = data.user;
    if (sbUser) setUser(mapSupabaseUser(sbUser));

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
    setUser(null);
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
    setUser(sbUser ? mapSupabaseUser(sbUser) : null);
  }, []);

  const value: AuthContextValue = {
    user,
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
