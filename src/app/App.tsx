import * as React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider, LoginPage, SignUpPage, AuthCallback, useAuth, MfaPage, MfaSetupPage, MfaVerifyPage } from "@/features/auth";
import { DashboardLayout, AmbientEnergyLines } from "@/features/dashboard";
import { OnboardingPage } from "@/features/onboarding";
import { AppThemeProvider } from "@/shared/theme-provider";
import { Toaster } from "@/shared/components/ui/sonner";
import { PrivacyPolicyPage } from "@/features/legal/PrivacyPolicyPage";
import LandingPage from "@/LandingPage";
import { hydratePrivacyPolicyMeta } from "@/config/privacy";

/**
 * App root: providers, global shell, and top-level routes.
 * Auth and dashboard layout live in feature modules.
 */
function RootRoute() {
  const { isAuthenticated, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return null;
  }

  return isAuthenticated ? <DashboardLayout /> : <LandingPage />;
}

export default function App() {
  React.useEffect(() => {
    void hydratePrivacyPolicyMeta();
  }, []);

  return (
    <AppThemeProvider>
      <AuthProvider>
        <div className="app-shell relative min-h-screen overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200 bg-[#0B1220] text-white font-sans">
          <Toaster position="top-center" richColors />
          <AmbientEnergyLines />
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/waitlist" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/mfa" element={<MfaPage />} />
            <Route path="/mfa/setup" element={<MfaSetupPage />} />
            <Route path="/mfa/verify" element={<MfaVerifyPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="*" element={<DashboardLayout />} />
          </Routes>
        </div>
      </AuthProvider>
    </AppThemeProvider>
  );
}
