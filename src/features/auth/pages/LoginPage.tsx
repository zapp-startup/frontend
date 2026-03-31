import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/api/supabaseClient";
import { OnboardingAPI } from "@/api/onboarding.api";
import { AppButton, AppInput, FormField, SectionHeader, Surface } from "@/shared/components/system";
import { PrivacyPolicyLink } from "@/shared/components/PrivacyPolicyLink";
import { AppLogo } from "@/shared/components/brand/AppLogo";

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

      const accessToken = result.session?.access_token ?? null;
      if (accessToken) {
        try {
          const isComplete = await OnboardingAPI.checkComplete();
          navigate(isComplete ? "/" : "/onboarding", { replace: true });
        } catch {
          navigate("/", { replace: true });
        }
      } else {
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
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Surface variant="overlay" padding="xl" className="backdrop-blur-xl">
          <div className="mb-8 flex justify-center">
            <AppLogo size={104} />
          </div>

          <SectionHeader
            align="center"
            eyebrow="Welcome back"
            title="Sign in"
            description="Enter your credentials to continue."
            titleClassName="app-page-title text-[2.5rem] sm:text-[3rem]"
            className="mb-8"
          />

          <AppButton
            type="button"
            variant="outline"
            size="md"
            onClick={handleGoogleSignIn}
            className="w-full border-[var(--app-color-border-strong)] bg-[var(--app-color-surface-base)]"
          >
            Continue with Google
          </AppButton>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--app-color-border-subtle)]" />
            <span className="app-label text-[var(--app-color-text-tertiary)]">or</span>
            <div className="h-px flex-1 bg-[var(--app-color-border-subtle)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Email" htmlFor="login-email">
              <AppInput
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Password" htmlFor="login-password">
              <AppInput
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormField>

            <AppButton type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </AppButton>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--app-color-text-secondary)]">
            Don't have an account?{" "}
            <NavLink
              to="/signup"
              className="font-semibold text-[var(--app-accent-cyan)] transition-colors hover:opacity-90"
            >
              Sign up
            </NavLink>
          </p>
        
          <p className="mt-4 text-center text-xs text-gray-600">
            <PrivacyPolicyLink className="text-gray-500 hover:text-gray-400" />
          </p>
        </Surface>
      </motion.div>
    </div>
  );
}
