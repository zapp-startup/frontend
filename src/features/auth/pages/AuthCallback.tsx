import * as React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { OnboardingAPI } from "@/api/onboarding.api";
import { setApiAccessToken } from "@/api/client";

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
            console.error("exchangeCodeForSession error:", error);
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
          console.error("getSession error:", error);
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
    <div className="min-h-screen flex items-center justify-center text-white">
      Signing you in…
    </div>
  );
}
