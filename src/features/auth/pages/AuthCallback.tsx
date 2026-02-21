import * as React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { OnboardingAPI } from "@/api/onboarding.api";

export function AuthCallback() {
  const navigate = useNavigate();

  React.useEffect(() => {
    let done = false;

    const finish = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("getSession error:", error);
    navigate("/login", { replace: true });
    return;
  }
  if (data.session) {
    done = true;
    const isComplete = await OnboardingAPI.checkComplete();
    navigate(isComplete ? "/" : "/onboarding", { replace: true });
    return;
  }
  setTimeout(async () => {
    if (done) return;
    const { data: d2 } = await supabase.auth.getSession();
    if (d2.session) {
      const isComplete = await OnboardingAPI.checkComplete();
      navigate(isComplete ? "/" : "/onboarding", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, 300);
};

    finish();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Signing you in…
    </div>
  );
}
