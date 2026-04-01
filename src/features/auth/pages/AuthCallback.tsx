import * as React from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingAPI } from "@/api/onboarding.api";

/**
 * OAuth completion: backend exchanges the code, sets the session cookie, then redirects here.
 * No Supabase session or tokens in JS — cookie auth only.
 */
export function AuthCallback() {
  const navigate = useNavigate();

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const isComplete = await OnboardingAPI.checkComplete();
        if (!cancelled) {
          navigate(isComplete ? "/" : "/onboarding", { replace: true });
        }
      } catch {
        if (!cancelled) {
          navigate("/login", { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center text-[var(--app-color-text-primary)]">
      Signing you in…
    </div>
  );
}
