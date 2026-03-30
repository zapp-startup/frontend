import * as React from "react";
import { AlertTriangle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { bankLinkGateMessage } from "../security/bankLinkMessages";
import { getApiConfigurationError } from "@/api/client";

/**
 * Honest UI when bank linking is blocked. Does not claim backend-only protections.
 */
export function BankLinkComplianceBanner() {
  const { canLinkBank, bankLinkGateReason, mfaLoading } = useAuth();
  const apiErr = getApiConfigurationError();

  if (apiErr) {
    return (
      <div className="flex gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-black uppercase tracking-widest text-[10px] text-red-400 mb-1">Configuration</p>
          <p>{apiErr}</p>
        </div>
      </div>
    );
  }

  if (canLinkBank || mfaLoading) return null;

  const msg = bankLinkGateMessage(bankLinkGateReason);
  const showProfileLink =
    bankLinkGateReason === "mfa_not_enrolled" ||
    bankLinkGateReason === "mfa_verification_needed" ||
    bankLinkGateReason === "mfa_required";

  return (
    <div className="flex gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-100 text-sm">
      <Shield className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
      <div>
        <p className="font-black uppercase tracking-widest text-[10px] text-amber-400/90 mb-1">Bank connection</p>
        <p>{msg}</p>
        {showProfileLink && (
          <Link to="/profile" className="inline-block mt-2 text-cyan-400 font-bold text-xs uppercase tracking-widest hover:underline">
            Open profile & security
          </Link>
        )}
      </div>
    </div>
  );
}
