import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { COLORS, GLOWS } from "@/shared/theme";
import { toast } from "sonner";
import { supabase } from "@/api/supabaseClient";
import { OnboardingAPI } from "@/api/onboarding.api";

export function LoginPage() {
  const { login, isAuthenticated, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isAuthReady && isAuthenticated) navigate("/", { replace: true });
  }, [isAuthReady, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
  toast.success("Welcome back!");
  // Wait for auth state to propagate so the API token is set
    await new Promise<void>((resolve) => {
    const unsub = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        unsub.data.subscription.unsubscribe();
        resolve();
      }
    });
    setTimeout(() => {
      unsub.data.subscription.unsubscribe();
      resolve();
    }, 2000);
  });
  try {
    const isComplete = await OnboardingAPI.checkComplete();
    navigate(isComplete ? "/" : "/onboarding", { replace: true });
  } catch {
    navigate("/", { replace: true });
  }
} else {
      toast.error(result.error);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div
          className="rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl"
          style={{ backgroundColor: COLORS.bgCard, boxShadow: GLOWS.ambient() }}
        >
          <div className="flex justify-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: COLORS.electricCyan + "20",
                boxShadow: GLOWS.soft(COLORS.electricCyan),
              }}
            >
              <Zap className="w-7 h-7" style={{ color: COLORS.electricCyan }} />
            </div>
          </div>

          <h1 className="text-2xl font-black text-center text-white uppercase tracking-tight mb-1">
            Sign in
          </h1>
          <p className="text-sm text-gray-400 text-center mb-6">
            Enter your credentials to continue
          </p>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-12 rounded-xl font-bold uppercase tracking-wider text-sm"
            style={{ backgroundColor: "white", color: COLORS.bgPrimary }}
          >
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-gray-300 text-xs font-bold uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-gray-300 text-xs font-bold uppercase tracking-wider">
                Password
              </Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold uppercase tracking-wider text-sm"
              style={{ backgroundColor: COLORS.electricCyan, color: COLORS.bgPrimary }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <NavLink
              to="/signup"
              className="font-semibold transition-colors hover:opacity-90"
              style={{ color: COLORS.electricCyan }}
            >
              Sign up
            </NavLink>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
