import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { cn } from "@/shared/components/ui/utils";

function AppSheet(props: React.ComponentProps<typeof Sheet>) {
  return <Sheet {...props} />;
}

function AppSheetTrigger(props: React.ComponentProps<typeof SheetTrigger>) {
  return <SheetTrigger {...props} />;
}

function AppSheetContent({
  className,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetContent>) {
  return (
    <SheetContent
      side={side}
      className={cn(
        "app-surface-overlay border-[var(--app-color-border-strong)] p-0 text-[var(--app-color-text-primary)] sm:max-w-lg",
        className
      )}
      {...props}
    />
  );
}

function AppSheetHeader({
  className,
  ...props
}: React.ComponentProps<typeof SheetHeader>) {
  return <SheetHeader className={cn("gap-3 px-8 pt-8", className)} {...props} />;
}

function AppSheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex-1 overflow-y-auto px-8 pb-8", className)} {...props} />;
}

function AppSheetFooter({
  className,
  ...props
}: React.ComponentProps<typeof SheetFooter>) {
  return <SheetFooter className={cn("border-t border-[var(--app-color-border-subtle)] px-8 py-6", className)} {...props} />;
}

function AppSheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetTitle>) {
  return <SheetTitle className={cn("app-section-title", className)} {...props} />;
}

function AppSheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetDescription>) {
  return <SheetDescription className={cn("app-helper", className)} {...props} />;
}

export {
  AppSheet,
  AppSheetBody,
  AppSheetContent,
  AppSheetDescription,
  AppSheetFooter,
  AppSheetHeader,
  AppSheetTitle,
  AppSheetTrigger,
};
