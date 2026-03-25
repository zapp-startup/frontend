import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/components/ui/utils";

const statusChipVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]",
  {
    variants: {
      tone: {
        neutral: "border-[var(--app-color-border-strong)] bg-[var(--app-color-surface-inset)] text-[var(--app-color-text-secondary)]",
        success: "border-emerald-400/30 bg-emerald-500/12 text-emerald-300",
        warning: "border-yellow-400/30 bg-yellow-500/12 text-yellow-300",
        danger: "border-red-400/30 bg-red-500/12 text-red-300",
        info: "border-cyan-400/30 bg-cyan-500/12 text-cyan-300",
        accent: "border-purple-400/30 bg-purple-500/12 text-purple-300",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
);

function StatusChip({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof statusChipVariants>) {
  return <span className={cn(statusChipVariants({ tone, className }))} {...props} />;
}

export { StatusChip };
