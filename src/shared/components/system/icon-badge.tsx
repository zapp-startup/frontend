import * as React from "react";
import { cn } from "@/shared/components/ui/utils";

type IconBadgeProps = React.ComponentProps<"div"> & {
  tone?: "cyan" | "green" | "blue" | "purple" | "red" | "yellow" | "neutral";
  size?: "sm" | "md" | "lg";
};

const toneStyles = {
  cyan: "bg-cyan-500/12 text-cyan-300 border-cyan-400/25",
  green: "bg-emerald-500/12 text-emerald-300 border-emerald-400/25",
  blue: "bg-blue-500/12 text-blue-300 border-blue-400/25",
  purple: "bg-purple-500/12 text-purple-300 border-purple-400/25",
  red: "bg-red-500/12 text-red-300 border-red-400/25",
  yellow: "bg-yellow-500/12 text-yellow-300 border-yellow-400/25",
  neutral: "bg-white/5 text-[var(--app-color-text-secondary)] border-[var(--app-color-border-strong)]",
} as const;

const sizeStyles = {
  sm: "size-10 rounded-[var(--app-radius-md)] [&_svg]:size-4",
  md: "size-12 rounded-[var(--app-radius-control)] [&_svg]:size-5",
  lg: "size-16 rounded-[var(--app-radius-control)] [&_svg]:size-8",
} as const;

function IconBadge({
  className,
  tone = "neutral",
  size = "md",
  ...props
}: IconBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center border",
        toneStyles[tone],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}

export { IconBadge };
