import * as React from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  tier?: string;
  createdAt: string;
};

const AUTH_STORAGE_KEY = "zapp_auth_user";

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null) {
  if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_STORAGE_KEY);
}

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "name" | "tier">>) => void;
};

export type SignUpData = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(getStoredUser);

  const login = React.useCallback(async (email: string, _password: string) => {
    const stored = getStoredUser();
    if (stored && stored.email.toLowerCase() === email.toLowerCase()) {
      setUser(stored);
      return { ok: true };
    }
    if (!stored) return { ok: false, error: "No account found. Please sign up first." };
    return { ok: false, error: "Invalid email or password." };
  }, []);

  const signUp = React.useCallback(async (data: SignUpData) => {
    if (data.password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
      return { ok: false, error: "Passwords do not match." };
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      tier: "Intentional Tier",
      createdAt: new Date().toISOString(),
    };
    setStoredUser(newUser);
    setUser(newUser);
    return { ok: true };
  }, []);

  const logout = React.useCallback(() => {
    setStoredUser(null);
    setUser(null);
  }, []);

  const updateProfile = React.useCallback((data: Partial<Pick<User, "name" | "tier">>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      setStoredUser(next);
      return next;
    });
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
