import * as React from "react";

import { cn } from "@/shared/components/ui/utils";

type AppLogoProps = {
  className?: string;
  markClassName?: string;
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export function AppLogo({
  className,
  markClassName,
  size = 64,
  showWordmark = false,
  wordmarkClassName,
}: AppLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <img
        alt={showWordmark ? "" : "Zapp logo"}
        aria-hidden={showWordmark}
        className={cn("block shrink-0 object-contain object-center", markClassName)}
        draggable={false}
        role={showWordmark ? undefined : "img"}
        src="/logo-mark.png"
        style={{ width: size, height: size, objectPosition: "36% 50%" }}
      />

      {showWordmark ? (
        <span
          className={cn(
            "text-3xl font-black uppercase italic tracking-[-0.06em] text-[var(--app-color-text-primary)] sm:text-4xl",
            wordmarkClassName
          )}
        >
          Zapp
        </span>
      ) : null}
    </div>
  );
}
