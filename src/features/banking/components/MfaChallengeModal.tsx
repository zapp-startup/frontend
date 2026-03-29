import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { COLORS } from "@/shared/theme";

type MfaChallengeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  onCodeChange: (v: string) => void;
  onSubmit: () => void | Promise<void>;
  submitting?: boolean;
};

/** Second-factor challenge to reach AAL2 before sensitive actions (e.g. Plaid). */
export function MfaChallengeModal({
  open,
  onOpenChange,
  code,
  onCodeChange,
  onSubmit,
  submitting = false,
}: MfaChallengeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#101A2E] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-white">Authenticator required</DialogTitle>
          <DialogDescription className="text-gray-400 text-left">
            Enter the 6-digit code from your authenticator app to continue. This adds a second factor to your session
            before connecting a bank.
          </DialogDescription>
        </DialogHeader>
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={12}
          placeholder="000000"
          value={code}
          onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="bg-[#0B1220] border-white/10 text-white text-lg tracking-widest text-center h-14 rounded-xl"
        />
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-white/10">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={code.length < 6 || submitting}
            onClick={() => void onSubmit()}
            style={{ backgroundColor: COLORS.electricCyan, color: COLORS.bgPrimary }}
            className="font-black"
          >
            {submitting ? "Verifying…" : "Verify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
