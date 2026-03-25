import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/components/ui/utils";

function AppDialog(props: React.ComponentProps<typeof Dialog>) {
  return <Dialog {...props} />;
}

function AppDialogTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger {...props} />;
}

function AppDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn(
        "app-surface-overlay max-w-xl border-[var(--app-color-border-strong)] p-0 text-[var(--app-color-text-primary)]",
        className
      )}
      {...props}
    />
  );
}

function AppDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <DialogHeader className={cn("gap-3 px-8 pt-8 text-left", className)} {...props} />;
}

function AppDialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-8 pb-8", className)} {...props} />;
}

function AppDialogFooter({
  className,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  return <DialogFooter className={cn("border-t border-[var(--app-color-border-subtle)] px-8 py-6", className)} {...props} />;
}

function AppDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle className={cn("app-section-title text-left", className)} {...props} />;
}

function AppDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription className={cn("app-helper text-left", className)} {...props} />;
}

export {
  AppDialog,
  AppDialogBody,
  AppDialogContent,
  AppDialogDescription,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogTitle,
  AppDialogTrigger,
};
