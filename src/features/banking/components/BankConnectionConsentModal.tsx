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
import { Checkbox } from "@/shared/components/ui/checkbox";
import { COLORS } from "@/shared/theme";
import { getFinancialConsentDisclosure, usePrivacyPolicyMeta } from "@/config/privacy";
import { PrivacyPolicyLink } from "@/shared/components/PrivacyPolicyLink";

type BankConnectionConsentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  submitting?: boolean;
};

/**
 * Explicit consent before Plaid link-token creation. Does not replace backend logging or legal review.
 */
export function BankConnectionConsentModal({
  open,
  onOpenChange,
  onConfirm,
  submitting = false,
}: BankConnectionConsentModalProps) {
  const [accepted, setAccepted] = React.useState(false);
  const meta = usePrivacyPolicyMeta();
  const disclosure = React.useMemo(() => getFinancialConsentDisclosure(meta), [meta]);

  React.useEffect(() => {
    if (!open) setAccepted(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#101A2E] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-white">Connect your bank</DialogTitle>
          {/* asChild: Radix Description renders a <p> by default; use a div to avoid invalid <p> inside <p>. */}
          <DialogDescription asChild>
            <div className="text-gray-400 text-left space-y-3 text-sm">
              <p>
                {disclosure.intro}
              </p>
              <p className="text-xs text-gray-500">
                {disclosure.policyReference} Our <PrivacyPolicyLink className="text-cyan-400" /> contains the current
                version and effective date.
              </p>
              <div
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-gray-400"
                data-testid="bank-consent-policy-meta"
              >
                <p className="font-bold uppercase tracking-widest text-[10px] text-gray-500 mb-1">Privacy policy</p>
                <p>
                  Version <span className="text-gray-200 font-mono">{meta.version}</span>
                  <span className="mx-2 text-gray-600">·</span>
                  Effective <span className="text-gray-200">{meta.effectiveDate}</span>
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 py-2">
          <Checkbox
            id="bank-consent"
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
            className="mt-1 border-white/30 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
          />
          <label htmlFor="bank-consent" className="text-sm text-gray-300 leading-snug cursor-pointer">
            {disclosure.checkboxLabel}
          </label>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 text-gray-400"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!accepted || submitting}
            onClick={() => void onConfirm()}
            className="font-black"
            style={{ backgroundColor: COLORS.electricCyan, color: COLORS.bgPrimary }}
          >
            {submitting ? "Saving…" : "Continue to bank connection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
