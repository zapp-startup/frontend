import * as React from "react";
import { useLocation } from "react-router-dom";
import { TransactionsAPI, type FeedbackCandidate } from "@/api/transactions.api";
import { useMergedTransactions } from "../hooks/useMergedTransactions";
import { TransactionFeedbackModal } from "./TransactionFeedbackModal";
import type { DisplayTransaction } from "../utils/normalizeBankTransaction";

const MAX_PROMPTS_PER_SESSION = 2;
const TRANSACTION_POOL_LIMIT = 300;

function hasFeedback(tx: DisplayTransaction): boolean {
  return (
    tx.satisfaction_rating != null ||
    tx.considered_at != null ||
    (tx.regret_rating != null && tx.repurchase_likelihood != null)
  );
}

function matchTransaction(
  candidates: FeedbackCandidate[],
  transactions: DisplayTransaction[],
  answeredThisSession: Set<string | number>
): DisplayTransaction[] {
  const byId = new Map<string | number, DisplayTransaction>();
  for (const tx of transactions) {
    byId.set(tx.id, tx);
    if (typeof tx.id === "string" && tx.id.startsWith("bank-")) {
      byId.set(tx.id.slice(5), tx);
    }
  }
  const seen = new Set<string | number>();
  const queue: DisplayTransaction[] = [];
  for (const c of candidates) {
    const id = c.transaction_id;
    if (seen.has(id)) continue;
    const tx =
      byId.get(id) ??
      (typeof id === "string" ? byId.get(`bank-${id}`) : undefined);
    if (!tx) continue;
    if (seen.has(tx.id)) continue;
    seen.add(tx.id);
    if (hasFeedback(tx)) continue;
    if (answeredThisSession.has(tx.id)) continue;
    queue.push(tx);
    if (queue.length >= MAX_PROMPTS_PER_SESSION) break;
  }
  return queue;
}

export function FeedbackPromptFlow() {
  const { pathname } = useLocation();
  const isOnHome = pathname === "/";

  const { transactions, loading: txLoading } = useMergedTransactions({
    limit: TRANSACTION_POOL_LIMIT,
  });

  const [candidates, setCandidates] = React.useState<FeedbackCandidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = React.useState(false);
  const [queue, setQueue] = React.useState<DisplayTransaction[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answeredThisSession, setAnsweredThisSession] = React.useState<
    Set<string | number>
  >(() => new Set());
  const hasFetchedCandidates = React.useRef(false);
  const ignoreNextCloseRef = React.useRef(false);

  React.useEffect(() => {
    if (!isOnHome || hasFetchedCandidates.current) return;
    hasFetchedCandidates.current = true;
    setCandidatesLoading(true);
    TransactionsAPI.getFeedbackCandidates()
      .then((data) => setCandidates(Array.isArray(data) ? data : []))
      .catch(() => setCandidates([]))
      .finally(() => setCandidatesLoading(false));
  }, [isOnHome]);

  React.useEffect(() => {
    if (!isOnHome || candidatesLoading || txLoading) return;
    if (candidates.length === 0) return;
    const q = matchTransaction(candidates, transactions, answeredThisSession);
    setQueue(q);
    setCurrentIndex(0);
  }, [isOnHome, candidates, candidatesLoading, txLoading, transactions, answeredThisSession]);

  const currentTransaction = queue[currentIndex] ?? null;
  const isOpen = isOnHome && currentTransaction != null;

  const handleClose = (open: boolean) => {
    if (!open) {
      if (ignoreNextCloseRef.current) {
        ignoreNextCloseRef.current = false;
        return;
      }
      advanceToNext();
    }
  };

  const handleSubmitted = () => {
    if (currentTransaction) {
      setAnsweredThisSession((prev) => new Set(prev).add(currentTransaction.id));
    }
    ignoreNextCloseRef.current = true;
    advanceToNext();
  };

  const advanceToNext = () => {
    setCurrentIndex((i) => {
      const next = i + 1;
      if (next >= queue.length) {
        setQueue([]);
        return 0;
      }
      return next;
    });
  };

  return (
    <TransactionFeedbackModal
      transaction={currentTransaction}
      open={isOpen}
      onOpenChange={handleClose}
      onSubmitted={handleSubmitted}
    />
  );
}
