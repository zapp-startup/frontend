import * as React from "react";
import { Wallet } from "lucide-react";
import { ElectricCard } from "@/features/home/components/ElectricCard";
import { COLORS } from "@/shared/theme";
import type { BankAccount } from "@/api/banking.api";

type LinkedAccountsSectionProps = {
  accounts: BankAccount[];
  loading?: boolean;
};

function formatBalance(val: number | string | null | undefined): string {
  if (val == null) return "—";
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (Number.isNaN(n)) return "—";
  return `$${n.toFixed(2)}`;
}

export function LinkedAccountsSection({ accounts, loading = false }: LinkedAccountsSectionProps) {
  if (loading && accounts.length === 0) {
    return (
      <ElectricCard className="p-6" semanticColor={COLORS.electricBlue} elevation={1}>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
          Linked accounts
        </div>
        <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
      </ElectricCard>
    );
  }

  if (accounts.length === 0) return null;

  return (
    <ElectricCard className="p-6" semanticColor={COLORS.electricBlue} elevation={1}>
      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
        Linked accounts
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20">
              <Wallet size={18} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm truncate">
                {acc.name ?? "Account"}
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {[acc.type, acc.subtype].filter(Boolean).join(" · ") || "—"}
                {acc.mask ? ` •••• ${acc.mask}` : ""}
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-white">
                {formatBalance(acc.current_balance ?? acc.available_balance)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ElectricCard>
  );
}
