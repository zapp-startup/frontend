import * as React from "react";
import { Landmark } from "lucide-react";
import { toast } from "sonner";
import { useBankingData } from "../hooks/useBankingData";
import { usePlaidConnect } from "../hooks/usePlaidConnect";
import { useBankConnectionSync } from "../hooks/useBankConnectionSync";
import { BankingEmptyState } from "./BankingEmptyState";
import { BankConnectionsList } from "./BankConnectionsList";
import { ConnectBankButton } from "./ConnectBankButton";
import { LinkedAccountsSection } from "./LinkedAccountsSection";

type BankingSectionProps = {
  onTransactionsRefetch?: () => void | Promise<void>;
};

export function BankingSection({ onTransactionsRefetch }: BankingSectionProps) {
  const {
    connections,
    accounts,
    transactions,
    connectionsLoading,
    accountsLoading,
    transactionsLoading,
    refetchAll,
    refetchConnections,
    refetchAccounts,
    refetchTransactions,
  } = useBankingData({ autoLoad: true });

  const handleConnected = React.useCallback(async () => {
    await refetchAll();
    await onTransactionsRefetch?.();
    toast.success("Bank connected successfully. Your transactions are syncing.");
  }, [refetchAll, onTransactionsRefetch]);

  const { startConnect, isPreparingLink, isExchanging, linkError } = usePlaidConnect({
    onConnected: handleConnected,
  });

  const handleSynced = React.useCallback(async () => {
    await refetchConnections();
    await refetchAccounts();
    await refetchTransactions();
    await onTransactionsRefetch?.();
    toast.success("Sync complete.");
  }, [refetchConnections, refetchAccounts, refetchTransactions, onTransactionsRefetch]);

  const { syncConnection, syncingConnectionId } = useBankConnectionSync({
    onSynced: handleSynced,
  });

  const isConnecting = isPreparingLink || isExchanging;
  const hasConnections = connections.length > 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Landmark size={24} className="text-cyan-400" />
        <h2 className="text-xl font-black tracking-tight text-white">Bank connections</h2>
      </div>

      {!hasConnections && !connectionsLoading && (
        <BankingEmptyState onConnect={startConnect} isConnecting={isConnecting} />
      )}

      {linkError && hasConnections && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
          {linkError}
        </div>
      )}

      {hasConnections && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <BankConnectionsList
              connections={connections}
              onSync={syncConnection}
              syncingConnectionId={syncingConnectionId}
            />
            <ConnectBankButton
              onConnect={startConnect}
              loading={isConnecting}
              error={linkError}
            />
          </div>

          <LinkedAccountsSection
            accounts={accounts}
            loading={accountsLoading && accounts.length === 0}
          />
        </div>
      )}
    </section>
  );
}
