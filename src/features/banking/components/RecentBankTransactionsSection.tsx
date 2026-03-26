import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ElectricCard } from "@/features/home/components/ElectricCard";
import { formatDateLabel } from "@/shared/date";
import { cn } from "@/shared/components/ui/utils";
import { COLORS } from "@/shared/theme";
import type { BankTransaction } from "@/api/banking.api";

type RecentBankTransactionsSectionProps = {
  transactions: BankTransaction[];
  loading?: boolean;
  onViewAll?: () => void;
};

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return formatDateLabel(iso, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatAmount(amount: string | number, direction?: string): { text: string; isIncome: boolean } {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  const isIncome = n >= 0 || direction === "income";
  const abs = Math.abs(Number.isNaN(n) ? 0 : n);
  return {
    text: `${isIncome ? "+" : "-"}$${abs.toFixed(2)}`,
    isIncome,
  };
}

export function RecentBankTransactionsSection({
  transactions,
  loading = false,
  onViewAll,
}: RecentBankTransactionsSectionProps) {
  if (loading && transactions.length === 0) {
    return (
      <ElectricCard className="p-6" semanticColor={COLORS.electricGreen} elevation={1}>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
          Recent bank transactions
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </ElectricCard>
    );
  }

  if (transactions.length === 0) return null;

  const display = transactions.slice(0, 8);

  return (
    <ElectricCard className="p-6" semanticColor={COLORS.electricGreen} elevation={1}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          Recent bank transactions
        </div>
        {onViewAll && transactions.length > 8 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View all
          </button>
        )}
      </div>
      <div className="space-y-2">
        {display.map((tx) => {
          const { text, isIncome } = formatAmount(tx.amount, tx.direction);
          const name = tx.merchant_name ?? tx.name ?? tx.description_raw ?? "Transaction";
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 border border-white/5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    isIncome ? "bg-emerald-500/20" : "bg-white/10"
                  )}
                >
                  {isIncome ? (
                    <ArrowDownRight size={14} className="text-emerald-400" />
                  ) : (
                    <ArrowUpRight size={14} className="text-gray-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm truncate">{name}</div>
                  <div className="text-[10px] font-bold text-gray-500">
                    {formatDate(tx.date ?? tx.occurred_at)}
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "font-black text-sm flex-shrink-0 ml-2",
                  isIncome ? "text-emerald-400" : "text-white"
                )}
              >
                {text}
              </div>
            </div>
          );
        })}
      </div>
    </ElectricCard>
  );
}
