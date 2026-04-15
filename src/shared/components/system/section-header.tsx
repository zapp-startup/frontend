import * as React from "react";
import { cn } from "@/shared/components/ui/utils";

type SectionHeaderProps = {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
};

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
  titleClassName,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div className={cn("flex gap-6", centered ? "flex-col items-center text-center" : "items-start justify-between", className)}>
      <div className="space-y-3">
        {eyebrow ? <div className="app-eyebrow">{eyebrow}</div> : null}
        <h1 className={cn("app-section-title", titleClassName)}>{title}</h1>
        {description ? <p className={cn("app-helper max-w-2xl", centered && "mx-auto")}>{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export { SectionHeader };
