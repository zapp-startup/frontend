import * as React from "react";
import { MessageSquare, Sparkles } from "lucide-react";

import type { Transaction } from "@/api/transactions.api";
import { GamificationAPI } from "@/api/gamification.api";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/components/ui/utils";
import { toast } from "sonner";

type TransactionReflectionDialogProps = {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
};

export function TransactionReflectionDialog({
  transaction,
  open,
  onOpenChange,
  onSubmitted,
}: TransactionReflectionDialogProps) {
  const [regretScore, setRegretScore] = React.useState("");
  const [wasWorthIt, setWasWorthIt] = React.useState<boolean | null>(null);
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setRegretScore("");
      setWasWorthIt(null);
      setNotes("");
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!transaction) return;

    const parsedScore = regretScore.trim() ? Number(regretScore) : null;
    if (parsedScore != null && (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100)) {
      toast.error("Regret score must be between 0 and 100.");
      return;
    }

    try {
      setSubmitting(true);
      await GamificationAPI.createTransactionReflection({
        transaction: transaction.id,
        regret_score: parsedScore,
        was_worth_it: wasWorthIt,
        notes: notes.trim(),
      });
      toast.success("Reflection saved.");
      onOpenChange(false);
      onSubmitted?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save reflection. You may have already reflected on this purchase.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-[2rem] border-white/10 bg-[#101A2E] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black">
            <MessageSquare size={20} className="text-cyan-400" />
            Reflect On This Purchase
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Capture whether this spend felt worth it while the context is still fresh.
          </DialogDescription>
        </DialogHeader>

        {transaction && (
          <div className="rounded-[1.5rem] border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="text-lg font-black text-white">
              {transaction.description_raw || transaction.category}
            </div>
            <div className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
              ${Number(transaction.amount).toFixed(2)} • {new Date(transaction.occurred_at).toLocaleString()}
            </div>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Regret Score</Label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="0 to 100"
              value={regretScore}
              onChange={(event) => setRegretScore(event.target.value)}
              className="h-12 rounded-2xl border-white/10 bg-[#0B1220] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Was It Worth It?</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Worth It", value: true },
                { label: "Not Worth It", value: false },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setWasWorthIt(option.value)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-black transition-all",
                    wasWorthIt === option.value
                      ? "border-cyan-400 bg-cyan-500/15 text-cyan-200"
                      : "border-white/10 bg-[#0B1220] text-gray-400 hover:border-white/20 hover:text-white",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Notes</Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What drove the purchase, and how do you feel about it now?"
              className="min-h-28 rounded-2xl border-white/10 bg-[#0B1220] text-white"
            />
          </div>

          <div className="rounded-[1.5rem] border border-cyan-500/20 bg-cyan-500/8 p-4 text-sm text-gray-300">
            <div className="mb-1 flex items-center gap-2 font-black text-cyan-300">
              <Sparkles size={14} />
              Same-day reflection helps your streak and badges.
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              Reflections are meant for purchases. Income entries won’t count toward gamification.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-cyan-500 text-[#0B1220] hover:bg-cyan-400"
            >
              {submitting ? "Saving..." : "Save Reflection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
