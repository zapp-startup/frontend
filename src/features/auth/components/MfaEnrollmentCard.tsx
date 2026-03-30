import * as React from "react";
import { Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { COLORS } from "@/shared/theme";
import { toast } from "sonner";

/**
 * TOTP MFA enrollment and management. Actual enforcement also depends on Supabase project settings and backend policy.
 */
export function MfaEnrollmentCard() {
  const {
    mfaSnapshot,
    mfaLoading,
    mfaError,
    refreshMfa,
    enrollTotpFactor,
    verifyTotpEnrollment,
    unenrollMfaFactor,
  } = useAuth();

  const [enrolling, setEnrolling] = React.useState(false);
  const [factorId, setFactorId] = React.useState<string | null>(null);
  const [qr, setQr] = React.useState<string | null>(null);
  const [totpSecret, setTotpSecret] = React.useState<string | null>(null);
  const [code, setCode] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const verified = mfaSnapshot?.factors.filter((f) => f.status === "verified") ?? [];
  const pending = mfaSnapshot?.factors.filter((f) => f.status !== "verified") ?? [];

  const startEnroll = async () => {
    setEnrolling(true);
    setQr(null);
    setTotpSecret(null);
    setFactorId(null);
    setCode("");
    try {
      const data = await enrollTotpFactor();
      const id = (data as { id: string }).id;
      const totp = (data as { totp?: { qr_code?: string; secret?: string } }).totp;
      const qrData = totp?.qr_code ?? null;
      setFactorId(id);
      setQr(qrData);
      setTotpSecret(totp?.secret ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start MFA enrollment.");
    } finally {
      setEnrolling(false);
    }
  };

  const completeEnroll = async () => {
    if (!factorId || code.length < 6) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setSubmitting(true);
    try {
      await verifyTotpEnrollment(factorId, code);
      toast.success("Two-factor authentication is enabled.");
      setQr(null);
      setTotpSecret(null);
      setFactorId(null);
      setCode("");
      await refreshMfa();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Remove this authenticator? You will need it to connect banks until you add a new one.")) return;
    try {
      await unenrollMfaFactor(id);
      toast.success("Authenticator removed.");
      await refreshMfa();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not remove.");
    }
  };

  return (
    <div className="pt-8 border-t border-white/10">
      <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
        <Shield size={18} className="text-cyan-400" />
        Two-factor authentication
      </h3>
      <p className="text-xs text-gray-500 mb-4 max-w-xl">
        Adding an authenticator app is required before connecting a bank. This strengthens your sign-in; server-side
        policies may apply additional checks.
      </p>
      {mfaLoading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 size={16} className="animate-spin" /> Loading security status…
        </div>
      )}
      {mfaError && <p className="text-sm text-amber-400 mb-2">{mfaError}</p>}
      {!mfaLoading && mfaSnapshot?.currentLevel && (
        <p className="text-xs text-gray-500 mb-3">
          Current session assurance:{" "}
          <span className="font-mono text-gray-300">{mfaSnapshot.currentLevel}</span>
          {mfaSnapshot.nextLevel ? (
            <>
              {" "}
              (next step: <span className="font-mono">{mfaSnapshot.nextLevel}</span>)
            </>
          ) : null}
        </p>
      )}
      {!mfaLoading && pending.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-100 text-xs">
          <p className="font-bold uppercase tracking-widest text-[10px] text-amber-400/90 mb-1">Pending setup</p>
          <p>
            Finish verifying your authenticator in this browser, or remove the incomplete factor and start again.
          </p>
        </div>
      )}
      {!mfaLoading && verified.length > 0 && (
        <ul className="space-y-2 mb-4">
          {verified.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2 px-4 rounded-xl bg-white/5 border border-white/5"
            >
              <span className="text-sm font-bold text-white">{f.friendlyName}</span>
              <span className="text-[10px] uppercase text-emerald-400 font-black">Active</span>
              <Button type="button" variant="ghost" size="sm" className="text-red-400" onClick={() => void remove(f.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
      {!mfaLoading && verified.length === 0 && !qr && (
        <Button
          type="button"
          onClick={() => void startEnroll()}
          disabled={enrolling}
          className="rounded-xl font-bold"
          style={{ backgroundColor: COLORS.electricCyan, color: COLORS.bgPrimary }}
        >
          {enrolling ? "Starting…" : "Set up authenticator app"}
        </Button>
      )}
      {qr && factorId && (
        <div className="space-y-4 mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-gray-300">Scan this QR code in Google Authenticator, Authy, or another TOTP app.</p>
          {qr.startsWith("data:") ? (
            <img src={qr} alt="MFA QR" className="w-48 h-48 rounded-lg border border-white/10" />
          ) : (
            <div className="text-xs text-gray-500 break-all">{qr}</div>
          )}
          {totpSecret && (
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Or enter key manually</p>
              <code className="block text-xs font-mono text-cyan-200/90 break-all bg-black/30 rounded-lg px-3 py-2 border border-white/10">
                {totpSecret}
              </code>
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-gray-500">Verification code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="bg-[#0B1220] border-white/10 text-white h-10 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => void completeEnroll()}
              disabled={submitting || code.length < 6}
              style={{ backgroundColor: COLORS.electricCyan, color: COLORS.bgPrimary }}
            >
              {submitting ? "Verifying…" : "Confirm"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-white/10"
              onClick={() => {
                setQr(null);
                setTotpSecret(null);
                setFactorId(null);
                setCode("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
