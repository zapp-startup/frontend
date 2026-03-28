import * as React from "react";
import { Landmark } from "lucide-react";
import { ElectricCard } from "@/features/home/components/ElectricCard";
import { COLORS } from "@/shared/theme";
import { ConnectBankButton } from "./ConnectBankButton";

type BankingEmptyStateProps = {
  onConnect: () => void;
  isConnecting?: boolean;
};

export function BankingEmptyState({ onConnect, isConnecting = false }: BankingEmptyStateProps) {
  return (
    <ElectricCard className="p-8" semanticColor={COLORS.electricCyan} elevation={1}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-cyan-500/20">
          <Landmark size={28} className="text-cyan-400" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-black text-white">Import real transactions from your bank</h3>
          <p className="text-sm text-gray-500 font-medium">
            Connect your bank account securely via Plaid to automatically sync transactions. Your data stays private and encrypted.
          </p>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
            Sandbox mode available for testing
          </p>
        </div>
        <ConnectBankButton onConnect={onConnect} loading={isConnecting} />
      </div>
    </ElectricCard>
  );
}
