import * as React from "react";
import { Toaster } from "sonner";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AmbientEnergyLines } from "./components/AmbientEnergyLines";
import { DashboardLayout } from "./layout/DashboardLayout";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { AuthCallback } from "./pages/AuthCallback"; // adjust path to where AuthCallback lives


/**
 * App root: providers, global shell, and top-level routes.
 * Auth and dashboard layout live in separate modules.
 */
export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0B1220] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
        <Toaster position="top-center" theme="dark" richColors />
        <AmbientEnergyLines />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* IMPORTANT: add this */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="*" element={<DashboardLayout />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}