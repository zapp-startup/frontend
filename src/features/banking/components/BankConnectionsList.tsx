import * as React from "react";
import type { BankConnection } from "@/api/banking.api";
import { BankConnectionCard } from "./BankConnectionCard";

type BankConnectionsListProps = {
  connections: BankConnection[];
  onSync: (connectionId: string) => void;
  syncingConnectionId?: string | null;
};

export function BankConnectionsList({
  connections,
  onSync,
  syncingConnectionId,
}: BankConnectionsListProps) {
  if (connections.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
        Linked institutions
      </div>
      <div className="space-y-3">
        {connections.map((conn) => (
          <BankConnectionCard
            key={conn.id}
            connection={conn}
            onSync={() => onSync(conn.id)}
            isSyncing={syncingConnectionId === conn.id}
          />
        ))}
      </div>
    </div>
  );
}
