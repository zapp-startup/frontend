import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/components/ui/utils";
import { COLORS, GLOWS } from "@/shared/theme";
import { motion } from "motion/react";

type ConnectBankButtonProps = {
  onConnect: () => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
  className?: string;
};

export function ConnectBankButton({
  onConnect,
  loading = false,
  disabled = false,
  error,
  className,
}: ConnectBankButtonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <motion.button
        whileHover={{ scale: disabled || loading ? 1 : 1.02, boxShadow: disabled || loading ? undefined : GLOWS.medium(COLORS.electricCyan) }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        onClick={onConnect}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-[#0B1220] transition-all",
          "bg-cyan-500 shadow-[0_0_20px_rgba(34,240,255,0.3)]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          "hover:bg-cyan-400"
        )}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm uppercase tracking-widest">Connecting...</span>
          </>
        ) : (
          <span className="text-sm uppercase tracking-widest">Connect bank</span>
        )}
      </motion.button>
      {error && (
        <p className="text-xs font-bold text-red-400">{error}</p>
      )}
    </div>
  );
}
