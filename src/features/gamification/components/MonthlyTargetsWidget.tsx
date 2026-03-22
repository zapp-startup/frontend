import * as React from "react";
import { motion } from "motion/react";
import { CheckCircle2, Clock3, Plus, Target } from "lucide-react";

import { GamificationAPI, type MonthlyTarget } from "@/api/gamification.api";
import { ElectricCard } from "@/features/home/components/ElectricCard";
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
import { COLORS } from "@/shared/theme";
import { cn } from "@/shared/components/ui/utils";
import { toast } from "sonner";

type MonthlyTargetsWidgetProps = {
  compact?: boolean;
};

const TARGET_TYPES = [
  { value: "transactions_logged", label: "Transactions" },
  { value: "reflections_completed", label: "Reflections" },
  { value: "item_valuations", label: "Advisor Uses" },
  { value: "custom", label: "Custom" },
];

export function MonthlyTargetsWidget({ compact = false }: MonthlyTargetsWidgetProps) {
  const [targets, setTargets] = React.useState<MonthlyTarget[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const loadTargets = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await GamificationAPI.getMonthlyTargets();
      setTargets(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load monthly targets.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadTargets();
  }, [loadTargets]);

  const targetList = compact ? targets.slice(0, 3) : targets;

  return (
    <>
      <ElectricCard
        className={compact ? "p-6" : "p-8"}
        semanticColor={COLORS.electricPurple}
        elevation={compact ? 1 : 2}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-purple-400" />
            <h3 className={compact ? "text-lg font-black text-white" : "text-2xl font-black text-white"}>
              Monthly Targets
            </h3>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-2xl bg-purple-500/15 px-4 text-purple-300 hover:bg-purple-500/25"
          >
            <Plus size={14} />
            New
          </Button>
        </div>

        {loading && (
          <div className="py-10 text-center text-xs font-black uppercase tracking-[0.3em] text-gray-600">
            Loading targets...
          </div>
        )}

        {!loading && targetList.length === 0 && (
          <div className="rounded-[2rem] border border-white/[0.05] bg-white/[0.02] p-8 text-center">
            <Target size={28} className="mx-auto mb-3 text-gray-700" />
            <div className="text-sm font-bold text-gray-400">No monthly targets yet.</div>
          </div>
        )}

        {!loading && targetList.length > 0 && (
          <div className="space-y-4">
            {targetList.map((target) => (
              <MonthlyTargetCard key={target.id} target={target} compact={compact} onUpdated={loadTargets} />
            ))}
          </div>
        )}
      </ElectricCard>

      <CreateTargetDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={loadTargets}
      />
    </>
  );
}

function MonthlyTargetCard({
  target,
  compact,
  onUpdated,
}: {
  target: MonthlyTarget;
  compact: boolean;
  onUpdated: () => Promise<void>;
}) {
  const [amount, setAmount] = React.useState("1");
  const completed = target.status === "completed";
  const progress = Math.min(100, (target.current_value / Math.max(target.target_value, 1)) * 100);

  const handleProgress = async () => {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) {
      toast.error("Enter a positive progress amount.");
      return;
    }
    try {
      await GamificationAPI.updateTargetProgress(target.id, parsed);
      toast.success("Target progress updated.");
      await onUpdated();
      setAmount("1");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update target progress.");
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/[0.05] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            {completed ? (
              <CheckCircle2 size={16} className="text-green-400" />
            ) : (
              <Clock3 size={16} className="text-purple-400" />
            )}
            <h4 className="text-base font-black text-white">{target.title}</h4>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
            {target.target_type.replaceAll("_", " ")}
          </div>
        </div>
        <div
          className={cn(
            "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]",
            completed ? "bg-green-500/15 text-green-400" : "bg-purple-500/15 text-purple-300",
          )}
        >
          {completed ? "Completed" : "Active"}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-sm font-bold text-gray-400">
        <span>{target.current_value} / {target.target_value}</span>
        <span className="text-white">{Math.round(progress)}%</span>
      </div>
      <div className="mb-5 h-2 rounded-full bg-white/[0.04]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className={completed ? "h-full rounded-full bg-green-500" : "h-full rounded-full bg-purple-500"}
        />
      </div>

      {!completed && !compact && (
        <div className="flex items-center gap-3">
          <Input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            min="1"
            className="h-11 rounded-2xl border-white/10 bg-[#0B1220] text-white"
          />
          <Button
            onClick={handleProgress}
            className="rounded-2xl bg-purple-500 text-white hover:bg-purple-400"
          >
            Log Progress
          </Button>
        </div>
      )}
    </div>
  );
}

function CreateTargetDialog({
  isOpen,
  onOpenChange,
  onCreated,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => Promise<void>;
}) {
  const [title, setTitle] = React.useState("");
  const [targetType, setTargetType] = React.useState(TARGET_TYPES[0].value);
  const [targetValue, setTargetValue] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedValue = Number(targetValue);
    if (!title.trim() || !parsedValue || parsedValue <= 0) {
      toast.error("Fill out a valid target.");
      return;
    }

    try {
      setSubmitting(true);
      const monthStart = new Date();
      const monthStartString = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}-01`;
      await GamificationAPI.createMonthlyTarget({
        target_type: targetType,
        title: title.trim(),
        target_value: parsedValue,
        month_start: monthStartString,
      });
      toast.success("Monthly target created.");
      onOpenChange(false);
      setTitle("");
      setTargetValue("");
      setTargetType(TARGET_TYPES[0].value);
      await onCreated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create target.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[2rem] border-white/10 bg-[#101A2E] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Create Monthly Target</DialogTitle>
          <DialogDescription className="text-gray-400">
            Set a goal tied to the habits you want to reinforce this month.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Target Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {TARGET_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setTargetType(type.value)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition-all",
                    targetType === type.value
                      ? "border-purple-400 bg-purple-500/15 text-purple-200"
                      : "border-white/10 bg-[#0B1220] text-gray-400 hover:border-white/20 hover:text-white",
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Title</Label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Reflect on 8 purchases"
              className="h-12 rounded-2xl border-white/10 bg-[#0B1220] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Target Value</Label>
            <Input
              value={targetValue}
              onChange={(event) => setTargetValue(event.target.value)}
              type="number"
              min="1"
              className="h-12 rounded-2xl border-white/10 bg-[#0B1220] text-white"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-purple-500 text-white hover:bg-purple-400"
            >
              {submitting ? "Creating..." : "Create Target"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
