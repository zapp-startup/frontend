import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/components/ui/utils";

const surfaceVariants = cva("", {
  variants: {
    variant: {
      card: "app-surface-card",
      panel: "app-surface-panel",
      inset: "app-surface-inset",
      overlay: "app-surface-overlay",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-10",
    },
  },
  defaultVariants: {
    variant: "card",
    padding: "md",
  },
});

type SurfaceProps = React.ComponentProps<"div"> &
  VariantProps<typeof surfaceVariants> & {
    accentColor?: string;
    accentMode?: "border" | "glow" | "top-border";
  };

function Surface({
  className,
  variant,
  padding,
  accentColor,
  accentMode = "glow",
  style,
  ...props
}: SurfaceProps) {
  const accentStyle =
    accentColor == null
      ? undefined
      : accentMode === "border"
        ? { borderColor: `${accentColor}55` }
        : accentMode === "top-border"
          ? { borderTopColor: accentColor, borderTopWidth: "1px" }
          : {
              borderColor: `${accentColor}26`,
              boxShadow: `var(--app-shadow-raised), inset 0 0 1px rgba(255,255,255,0.15), 0 0 24px ${accentColor}2d`,
            };

  return <div className={cn(surfaceVariants({ variant, padding, className }))} style={{ ...accentStyle, ...style }} {...props} />;
}

export { Surface, surfaceVariants };
