import * as React from "react";
import { Link } from "react-router-dom";
import { getPrivacyPolicyMeta, getPrivacyPolicyPath } from "@/config/privacy";
import { cn } from "@/shared/components/ui/utils";

type PrivacyPolicyLinkProps = {
  className?: string;
  children?: React.ReactNode;
};

/** Inline link to the hosted privacy policy. */
export function PrivacyPolicyLink({ className, children }: PrivacyPolicyLinkProps) {
  return (
    <Link
      to={getPrivacyPolicyPath()}
      className={cn("underline underline-offset-2 hover:opacity-90", className)}
    >
      {children ?? "Privacy Policy"}
    </Link>
  );
}

/** Short line with version + effective date (for consent modals, footers). */
export function PrivacyPolicyMetaLine({ className }: { className?: string }) {
  const m = getPrivacyPolicyMeta();
  return (
    <p className={cn("text-xs text-gray-500", className)}>
      Privacy Policy v{m.version} · Effective {m.effectiveDate}
    </p>
  );
}
