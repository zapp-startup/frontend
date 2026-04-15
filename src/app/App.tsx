import * as React from "react";
import { Toaster } from "sonner";
import { Routes, Route } from "react-router-dom";
import { AuthProvider, LoginPage, SignUpPage, AuthCallback, useAuth } from "@/features/auth";
import { DashboardLayout, AmbientEnergyLines } from "@/features/dashboard";
import { OnboardingPage } from "@/features/onboarding";
import { PrivacyPolicyPage } from "@/features/legal/PrivacyPolicyPage";
import LandingPage from "@/LandingPage";

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
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0B1220] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
        <Toaster position="top-center" theme="dark" richColors />
        <AmbientEnergyLines />
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/waitlist" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="*" element={<DashboardLayout />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
