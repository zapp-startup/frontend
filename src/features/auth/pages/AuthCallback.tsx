import * as React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { OnboardingAPI } from "@/api/onboarding.api";
import { apiRequest, setApiAccessToken } from "@/api/client";

export function AuthCallback() {
  const navigate = useNavigate();

  React.useEffect(() => {
    let cancelled = false;

    const completeSignIn = async (accessToken: string) => {
      if (cancelled) return;

      setApiAccessToken(accessToken);

      try {
        const isComplete = await OnboardingAPI.checkComplete();
        if (!cancelled) {
          navigate(isComplete ? "/" : "/onboarding", { replace: true });
        }
      } catch {
        if (!cancelled) {
          navigate("/", { replace: true });
        }
      }
    };

    void (async () => {
      try {
        const code = new URL(window.location.href).searchParams.get("code");
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (!cancelled) {
              navigate("/login", { replace: true });
            }
            return;
          }

          const accessToken = data.session?.access_token ?? null;
          if (accessToken) {
            await completeSignIn(accessToken);
            return;
          }
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          if (!cancelled) {
            navigate("/login", { replace: true });
          }
          return;
        }

        const accessToken = data.session?.access_token ?? null;
        if (accessToken) {
          await completeSignIn(accessToken);
          return;
        }

        if (!cancelled) {
          navigate("/login", { replace: true });
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
