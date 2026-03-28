import * as React from "react";
import { Loader2, RefreshCw, Landmark } from "lucide-react";
import { ElectricCard } from "@/features/home/components/ElectricCard";
import { COLORS } from "@/shared/theme";
import { motion } from "motion/react";
import { cn } from "@/shared/components/ui/utils";
import type { BankConnection } from "@/api/banking.api";

type BankConnectionCardProps = {
  connection: BankConnection;
  onSync: () => void;
  isSyncing?: boolean;
};

function formatLastSynced(iso?: string | null): string {
  if (!iso) return "Never synced";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "Unknown";
  }
}

export function BankConnectionCard({ connection, onSync, isSyncing = false }: BankConnectionCardProps) {
  const name = connection.institution_name ?? connection.institution ?? "Bank";
  const status = connection.status ?? "active";
  const lastSynced = connection.last_synced_at;

  return (
    <ElectricCard className="p-5" semanticColor={COLORS.electricTeal} elevation={1}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-500/20">
            <Landmark size={22} className="text-teal-400" />
          </div>
          <div>
            <h4 className="font-black text-white text-base">{name}</h4>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Last synced: {formatLastSynced(lastSynced)}
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: isSyncing ? 1 : 1.05 }}
          whileTap={{ scale: isSyncing ? 1 : 0.95 }}
          onClick={onSync}
          disabled={isSyncing}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest",
            "bg-white/5 border border-white/10 hover:bg-teal-500/20 hover:border-teal-500/40",
            "text-gray-400 hover:text-teal-400 transition-all disabled:opacity-60"
          )}
        >
          {isSyncing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          Sync now
        </motion.button>
      </div>
    </ElectricCard>
  );
}
