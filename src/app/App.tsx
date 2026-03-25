import * as React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider, LoginPage, SignUpPage, AuthCallback } from "@/features/auth";
import { DashboardLayout, AmbientEnergyLines } from "@/features/dashboard";
import { OnboardingPage } from "@/features/onboarding";
import { AppThemeProvider } from "@/shared/theme-provider";
import { Toaster } from "@/shared/components/ui/sonner";

/**
 * App root: providers, global shell, and top-level routes.
 * Auth and dashboard layout live in feature modules.
 */
export default function App() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <div className="app-shell relative min-h-screen overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
          <Toaster position="top-center" richColors />
          <AmbientEnergyLines />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="*" element={<DashboardLayout />} />
          </Routes>
        </div>
      </AuthProvider>
    </AppThemeProvider>
  );
}
