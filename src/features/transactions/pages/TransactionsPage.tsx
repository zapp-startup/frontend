import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  X,
  Calendar,
  Coffee,
  ShoppingBag,
  Car,
  Zap as ZapIcon,
  ChevronDown,
  Wallet,
  ChevronUp,
  Flame,
  TrendingDown,
  Sparkles,
  Pencil,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { COLORS, GLOWS } from "@/shared/theme";
import { deriveTransactionValueScore } from "@/shared/transaction-valuation";
import { getValuePresentation } from "@/shared/valuation";
import { ElectricCard } from "@/features/home/components/ElectricCard";
import { usePanelActions } from "@/features/dashboard/context/PanelContext";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/components/ui/utils";
import { TransactionsAPI, type Transaction, type NewTransaction } from "@/api/transactions.api";
import { BankingSection } from "@/features/banking";
import { useMergedTransactions } from "../hooks/useMergedTransactions";
import type { DisplayTransaction } from "../utils/normalizeBankTransaction";
import { TransactionFeedbackModal } from "../components/TransactionFeedbackModal";
import { toast } from "sonner";

function formatLocalDateYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function createEmptyTransactionForm(): NewTransaction {
  return {
    description_raw: "",
    amount: "",
    direction: "spend",
    category: "other",
    occurred_at: formatLocalDateYYYYMMDD(new Date()),
    satisfaction_rating: null,
  };
}

const CATEGORY_OPTIONS = [
  { value: "eating_out", label: "Eating Out", icon: Coffee, color: COLORS.electricYellow },
  { value: "groceries", label: "Groceries", icon: ShoppingBag, color: COLORS.electricGreen },
  { value: "transport", label: "Transport", icon: Car, color: COLORS.electricCyan },
  { value: "subscriptions", label: "Subscriptions", icon: ZapIcon, color: COLORS.electricRed },
  { value: "shopping", label: "Shopping", icon: ShoppingBag, color: COLORS.electricBlue },
  { value: "bills", label: "Bills", icon: Wallet, color: COLORS.electricPurple },
  { value: "entertainment", label: "Entertainment", icon: ZapIcon, color: COLORS.electricYellow },
  { value: "health", label: "Health", icon: ZapIcon, color: COLORS.electricGreen },
  { value: "education", label: "Education", icon: ZapIcon, color: COLORS.electricCyan },
  { value: "other", label: "Other", icon: ZapIcon, color: COLORS.electricPurple },
];

function getCategoryMeta(value: string) {
  return CATEGORY_OPTIONS.find((c) => c.value === value) ?? CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const INITIAL_VISIBLE_GROUPS = 8;

type Filters = {
  category: string;
  direction: string;
  date_from: string;
  date_to: string;
};

const EMPTY_FILTERS: Filters = {
  category: "",
  direction: "",
  date_from: "",
  date_to: "",
};

type TransactionRowViewModel = {
  tx: DisplayTransaction;
  categoryLabel: string;
  categoryColor: string;
  categoryIcon: (typeof CATEGORY_OPTIONS)[number]["icon"];
  timeLabel: string;
  heading: string;
  directionLabel: string;
  satisfactionLabel: string | null;
  amountText: string;
  isIncome: boolean;
  valueScore: number | null;
  valueLabel: string;
  valueTone: string;
  valueColor: string;
};

type TransactionGroupViewModel = {
  date: string;
  dateLabel: string;
  rows: TransactionRowViewModel[];
};

function formatDayLabel(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const SpendingCalendar = React.memo(function SpendingCalendar({
  transactions,
  selectedDate,
  onSelectDate,
}: {
  transactions: DisplayTransaction[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = React.useState(28);
  const [hoveredDate, setHoveredDate] = React.useState<string | null>(null);

  const NUM_WEEKS = 18;
  const GAP = 4;
  const DAY_LABEL_WIDTH = 36;

  React.useEffect(() => {
    const calc = () => {
      if (!containerRef.current) return;
      const available = containerRef.current.clientWidth - DAY_LABEL_WIDTH - 8;
      const size = Math.floor((available - GAP * (NUM_WEEKS - 1)) / NUM_WEEKS);
      setCellSize(Math.max(size, 20));
    };

    calc();

    const ro = new ResizeObserver(calc);
    if (containerRef.current) ro.observe(containerRef.current);

    return () => ro.disconnect();
  }, []);

  const { todayStr, spendByDay, maxValue, weeks, monthLabelByWeek, thisWeekSpend, biggestDay, streak } =
    React.useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStrMemo = today.toISOString().split("T")[0];

      const startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay() - 7 * (NUM_WEEKS - 1));

      const allDaysMemo: string[] = [];
      const cursor = new Date(startDate);

      while (cursor <= today) {
        allDaysMemo.push(cursor.toISOString().split("T")[0]);
        cursor.setDate(cursor.getDate() + 1);
      }

      const spendByDayMemo: Record<string, number> = {};
      for (const tx of transactions) {
        const day = tx.occurred_at.split("T")[0];
        if (tx.direction === "spend") {
          spendByDayMemo[day] = (spendByDayMemo[day] ?? 0) + Math.abs(Number(tx.amount));
        }
      }

      const weeksMemo: string[][] = [];
      for (let i = 0; i < allDaysMemo.length; i += 7) {
        weeksMemo.push(allDaysMemo.slice(i, i + 7));
      }

      const seenMonths = new Set<string>();
      const monthLabelByWeekMemo: Record<number, string> = {};
      weeksMemo.forEach((week, wi) => {
        for (const date of week) {
          const d = new Date(date);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (!seenMonths.has(key)) {
            seenMonths.add(key);
            monthLabelByWeekMemo[wi] = d.toLocaleDateString("en-US", { month: "short" });
            break;
          }
        }
      });

      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());

      const thisWeekSpendMemo = allDaysMemo
        .filter((d) => d >= thisWeekStart.toISOString().split("T")[0])
        .reduce((s, d) => s + (spendByDayMemo[d] ?? 0), 0);

      const biggestDayMemo = Object.entries(spendByDayMemo).sort((a, b) => b[1] - a[1])[0];

      let streakMemo = 0;
      for (let i = allDaysMemo.length - 1; i >= 0; i--) {
        if (!spendByDayMemo[allDaysMemo[i]]) streakMemo++;
        else break;
      }

      return {
        allDays: allDaysMemo,
        todayStr: todayStrMemo,
        spendByDay: spendByDayMemo,
        maxValue: Math.max(...Object.values(spendByDayMemo), 1),
        weeks: weeksMemo,
        monthLabelByWeek: monthLabelByWeekMemo,
        thisWeekSpend: thisWeekSpendMemo,
        biggestDay: biggestDayMemo,
        streak: streakMemo,
      };
    }, [transactions, NUM_WEEKS]);

  const getColor = React.useCallback(
    (value: number, isSelected: boolean) => {
      if (isSelected) return COLORS.electricCyan;
      if (!value) return "rgba(255,255,255,0.05)";
      const t = value / maxValue;
      if (t < 0.25) return `${COLORS.electricCyan}35`;
      if (t < 0.5) return `${COLORS.electricCyan}60`;
      if (t < 0.75) return `${COLORS.electricCyan}85`;
      return COLORS.electricCyan;
    },
    [maxValue]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${COLORS.electricCyan}15` }}
          >
            <TrendingDown size={18} style={{ color: COLORS.electricCyan }} />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">This Week</div>
            <div className="text-2xl font-black text-white">${thisWeekSpend.toFixed(0)}</div>
          </div>
        </div>

        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${COLORS.electricRed}15` }}
          >
            <Flame size={18} style={{ color: COLORS.electricRed }} />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">Peak Day</div>
            <div className="text-2xl font-black text-white">
              {biggestDay ? `$${biggestDay[1].toFixed(0)}` : "—"}
            </div>
            {biggestDay && (
              <div className="text-[9px] text-gray-500 font-bold mt-0.5">
                {new Date(biggestDay[0]).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${COLORS.electricGreen}15` }}
          >
            <Sparkles size={18} style={{ color: COLORS.electricGreen }} />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">No-Spend Streak</div>
            <div className="text-2xl font-black text-white">
              {streak} {streak === 1 ? "day" : "days"}
            </div>
          </div>
        </div>
      </div>

      <div ref={containerRef} style={{ width: "100%" }}>
        <div style={{ display: "flex", gap: GAP, alignItems: "flex-start", width: "100%" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: GAP,
              paddingTop: 22,
              flexShrink: 0,
              width: DAY_LABEL_WIDTH,
            }}
          >
            {DAY_LABELS.map((label, i) => (
              <div
                key={label}
                style={{
                  height: cellSize,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 10,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#6b7280",
                  opacity: i % 2 === 0 ? 1 : 0,
                  userSelect: "none",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", gap: GAP, marginBottom: 6, height: 16 }}>
              {weeks.map((_, wi) => (
                <div
                  key={wi}
                  style={{
                    width: cellSize,
                    flexShrink: 0,
                    fontSize: 10,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: monthLabelByWeek[wi] ? COLORS.electricCyan : "transparent",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {monthLabelByWeek[wi] ?? ""}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: GAP }}>
              {weeks.map((week, wi) => (
                <div
                  key={wi}
                  style={{ display: "flex", flexDirection: "column", gap: GAP, flexShrink: 0 }}
                >
                  {week.map((date) => {
                    const spend = spendByDay[date] ?? 0;
                    const isSelected = selectedDate === date;
                    const isFuture = date > todayStr;
                    const isToday = date === todayStr;
                    const isHovered = hoveredDate === date;

                    return (
                      <div
                        key={date}
                        style={{ width: cellSize, height: cellSize, position: "relative" }}
                        onMouseEnter={() => !isFuture && setHoveredDate(date)}
                        onMouseLeave={() => setHoveredDate(null)}
                      >
                        <div
                          onClick={() => !isFuture && onSelectDate(isSelected ? null : date)}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: Math.max(4, cellSize * 0.2),
                            backgroundColor: isFuture ? "transparent" : getColor(spend, isSelected),
                            boxShadow: isSelected ? `0 0 12px ${COLORS.electricCyan}60` : undefined,
                            outline: isToday && !isSelected ? `2px solid rgba(255,255,255,0.25)` : undefined,
                            outlineOffset: -1,
                            cursor: isFuture ? "default" : "pointer",
                          }}
                        />
                        {isHovered && !isFuture && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "100%",
                              left: "50%",
                              transform: "translateX(-50%)",
                              marginBottom: 6,
                              zIndex: 9999,
                              pointerEvents: "none",
                            }}
                          >
                            <div
                              style={{
                                background: "#0B1220",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 10,
                                padding: "6px 10px",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <div style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>
                                {new Date(date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                                {isToday && (
                                  <span style={{ marginLeft: 6, color: COLORS.electricCyan }}>· Today</span>
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  marginTop: 2,
                                  color: spend > 0 ? COLORS.electricCyan : "#6b7280",
                                }}
                              >
                                {spend > 0 ? `$${spend.toFixed(2)} spent` : "No spend"}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedDate && (
        <motion.button
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onSelectDate(null)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <X size={10} />
          Showing{" "}
          {new Date(selectedDate).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}{" "}
          · Clear
        </motion.button>
      )}

      <div
        className="flex items-center gap-2"
        style={{
          fontSize: 9,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#6b7280",
        }}
      >
        <span>Less</span>
        <div style={{ display: "flex", gap: 3 }}>
          {[
            "rgba(255,255,255,0.05)",
            `${COLORS.electricCyan}35`,
            `${COLORS.electricCyan}60`,
            `${COLORS.electricCyan}85`,
            COLORS.electricCyan,
          ].map((bg, i) => (
            <div
              key={i}
              style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: bg }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
});

function AddPanel({
  onClose,
  onAdded,
  onUpdated,
  editingTransaction,
}: {
  onClose: () => void;
  onAdded: (tx: Transaction) => void;
  onUpdated?: (tx: Transaction) => void;
  editingTransaction?: DisplayTransaction | null;
}) {
  const canEdit = editingTransaction?.source === "manual" && typeof editingTransaction.id === "number";

  const [form, setForm] = React.useState<NewTransaction>(() =>
    editingTransaction && canEdit
      ? {
          description_raw: editingTransaction.description_raw,
          amount: editingTransaction.amount,
          direction: editingTransaction.direction,
          category: editingTransaction.category,
          occurred_at: editingTransaction.occurred_at.split("T")[0],
          satisfaction_rating: editingTransaction.satisfaction_rating,
        }
      : createEmptyTransactionForm()
  );

  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (editingTransaction && canEdit) {
      setForm({
        description_raw: editingTransaction.description_raw,
        amount: editingTransaction.amount,
        direction: editingTransaction.direction,
        category: editingTransaction.category,
        occurred_at: editingTransaction.occurred_at.split("T")[0],
        satisfaction_rating: editingTransaction.satisfaction_rating,
      });
    } else {
      setForm(createEmptyTransactionForm());
    }
  }, [editingTransaction, canEdit]);

  const set = <K extends keyof NewTransaction>(key: K, val: NewTransaction[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const selectedCat = getCategoryMeta(form.category);
  const isEdit = !!editingTransaction && canEdit;

  const handleSubmit = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!form.description_raw.trim()) {
      toast.error("Please enter a description.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = { ...form, occurred_at: `${form.occurred_at}T12:00:00Z` };

      if (isEdit && editingTransaction && typeof editingTransaction.id === "number") {
        const tx = await TransactionsAPI.patch(editingTransaction.id, payload);
        toast.success("Transaction updated!");
        onUpdated?.(tx);
      } else {
        const tx = await TransactionsAPI.create(payload);
        toast.success("Transaction added!");
        onAdded(tx);
      }

      onClose();
    } catch {
      toast.error(isEdit ? "Failed to update transaction." : "Failed to save transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#0B1220]/80 backdrop-blur-md z-[110]"
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#101A2E] border-l border-white/5 z-[120] p-12 shadow-2xl flex flex-col"
        style={{ boxShadow: `-20px 0 60px rgba(0,0,0,0.5)` }}
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">
              {isEdit ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 font-black mt-1">
              {isEdit ? "Update" : "Manual Entry"}
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto pr-2">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description</label>
            <input
              type="text"
              placeholder="e.g. Sushi dinner with friends"
              value={form.description_raw}
              onChange={(e) => set("description_raw", e.target.value)}
              className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Type</label>
              <div className="flex bg-[#0B1220] rounded-2xl p-1.5 border border-white/10">
                {["spend", "income"].map((type) => (
                  <button
                    key={type}
                    onClick={() => set("direction", type)}
                    className="flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    style={
                      form.direction === type
                        ? { backgroundColor: COLORS.electricCyan, color: "#0B1220" }
                        : { color: "#64748b" }
                    }
                  >
                    {type === "spend" ? "Expense" : "Income"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3" style={{ position: "relative" }}>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
            <button
              onClick={() => setCategoryOpen((o) => !o)}
              className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 px-6 text-left flex items-center justify-between hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <selectedCat.icon size={18} style={{ color: selectedCat.color }} />
                <span className="font-bold text-white">{selectedCat.label}</span>
              </div>
              {categoryOpen ? (
                <ChevronUp size={18} className="text-gray-600" />
              ) : (
                <ChevronDown size={18} className="text-gray-600" />
              )}
            </button>

            {categoryOpen && (
              <div
                className="absolute left-0 right-0 mt-2 bg-[#0B1220] border border-white/10 rounded-2xl overflow-auto z-[200] max-h-64"
                style={{ top: "100%" }}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      set("category", cat.value);
                      setCategoryOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition-all text-left"
                  >
                    <cat.icon size={16} style={{ color: cat.color }} />
                    <span className="font-bold text-white text-sm">{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Date</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="date"
                value={form.occurred_at}
                onChange={(e) => set("occurred_at", e.target.value)}
                className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Satisfaction <span className="text-gray-600">(optional)</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => set("satisfaction_rating", form.satisfaction_rating === n ? null : n)}
                  className="flex-1 py-3 rounded-xl text-xs font-black transition-all"
                  style={{
                    backgroundColor:
                      form.satisfaction_rating === n ? COLORS.electricCyan : "rgba(255,255,255,0.04)",
                    color: form.satisfaction_rating === n ? "#0B1220" : "#64748b",
                    border: `1px solid ${
                      form.satisfaction_rating === n
                        ? COLORS.electricCyan
                        : "rgba(255,255,255,0.06)"
                    }`,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 mt-auto">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-[#0B1220] rounded-[2rem] py-10 text-xl font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEdit ? "Update Transaction" : "Add Transaction"}
          </Button>
        </div>
      </motion.div>
    </>
  );
}

const FilterBar = React.memo(function FilterBar({
  filters,
  onChange,
  onClear,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = React.useState<string | null>(null);
  const hasFilters = Object.values(filters).some(Boolean);

  React.useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-filterbar]")) setOpen(null);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const btnClass = (active: boolean) =>
    cn(
      "whitespace-nowrap px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer",
      active
        ? "border-cyan-500/40 text-cyan-400 bg-cyan-500/10"
        : "bg-[#101A2E] border-white/5 text-gray-400 hover:text-white hover:border-white/10"
    );

  return (
    <div data-filterbar className="flex items-center gap-2 flex-wrap" style={{ position: "relative", zIndex: 100 }}>
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen(open === "date" ? null : "date")}
          className={btnClass(!!(filters.date_from || filters.date_to))}
        >
          {filters.date_from || filters.date_to
            ? `${filters.date_from || "…"} → ${filters.date_to || "…"}`
            : "Date Range"}
          <ChevronDown size={12} />
        </button>

        {open === "date" && (
          <div
            style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 9999, minWidth: 220 }}
            className="bg-[#101A2E] border border-white/10 rounded-2xl p-4 space-y-3 shadow-2xl"
          >
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase text-gray-500">From</div>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => onChange({ ...filters, date_from: e.target.value })}
                className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none text-sm"
              />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase text-gray-500">To</div>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
                className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-cyan-400"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen(open === "cat" ? null : "cat")}
          className={btnClass(!!filters.category)}
        >
          {filters.category ? getCategoryMeta(filters.category).label : "Category"}
          <ChevronDown size={12} />
        </button>

        {open === "cat" && (
          <div
            style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 9999, minWidth: 180 }}
            className="bg-[#101A2E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              type="button"
              onClick={() => {
                onChange({ ...filters, category: "" });
                setOpen(null);
              }}
              className="w-full px-5 py-3 text-left text-[10px] font-black uppercase text-gray-500 hover:bg-white/5"
            >
              All
            </button>

            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  onChange({ ...filters, category: cat.value });
                  setOpen(null);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-all text-left",
                  filters.category === cat.value && "bg-white/5"
                )}
              >
                <cat.icon size={14} style={{ color: cat.color }} />
                <span className="font-bold text-white text-xs">{cat.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen(open === "type" ? null : "type")}
          className={btnClass(!!filters.direction)}
        >
          {filters.direction
            ? filters.direction === "spend"
              ? "Expense"
              : filters.direction.charAt(0).toUpperCase() + filters.direction.slice(1)
            : "Type"}
          <ChevronDown size={12} />
        </button>

        {open === "type" && (
          <div
            style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 9999, minWidth: 140 }}
            className="bg-[#101A2E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            {[
              { label: "All", value: "" },
              { label: "Expense", value: "spend" },
              { label: "Income", value: "income" },
              { label: "Refund", value: "refund" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange({ ...filters, direction: opt.value });
                  setOpen(null);
                }}
                className={cn(
                  "w-full px-5 py-3 text-left text-xs font-black text-white hover:bg-white/5 transition-all",
                  filters.direction === opt.value && "bg-white/5"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2"
        >
          <X size={12} /> Clear
        </button>
      )}
    </div>
  );
});

const TransactionStats = React.memo(function TransactionStats({
  count,
  totalSpend,
  totalIncome,
  net,
}: {
  count: number;
  totalSpend: number;
  totalIncome: number;
  net: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <ElectricCard className="p-6" semanticColor={COLORS.electricCyan} elevation={1}>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">
          Total Transactions
        </div>
        <div className="text-3xl font-black text-white">{count}</div>
      </ElectricCard>

      <ElectricCard className="p-6" semanticColor={COLORS.electricRed} elevation={1}>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">
          Total Spent
        </div>
        <div className="text-3xl font-black text-white">${totalSpend.toFixed(2)}</div>
      </ElectricCard>

      <ElectricCard className="p-6" semanticColor={COLORS.electricGreen} elevation={1}>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">
          Total Income
        </div>
        <div className="text-3xl font-black text-white">${totalIncome.toFixed(2)}</div>
      </ElectricCard>

      <ElectricCard className="p-6" semanticColor={COLORS.electricBlue} elevation={1}>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">Net</div>
        <div className={cn("text-3xl font-black", net >= 0 ? "text-emerald-400" : "text-red-400")}>
          {net >= 0 ? "+" : ""}${net.toFixed(2)}
        </div>
      </ElectricCard>
    </div>
  );
});

const TransactionToolbar = React.memo(function TransactionToolbar({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onClearFilters,
  onOpenAdd,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
  onOpenAdd: () => void;
}) {
  return (
    <div className="flex flex-row gap-4 items-center">
      <div className="relative w-80 flex-shrink-0 group">
        <Search
          size={18}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors"
        />
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#101A2E] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-bold outline-none focus:border-cyan-500/30 transition-all placeholder:text-gray-600"
        />
      </div>

      <div className="flex items-center gap-3 flex-1">
        <FilterBar filters={filters} onChange={onFiltersChange} onClear={onClearFilters} />
      </div>

      <motion.button
        whileHover={{ scale: 1.05, boxShadow: GLOWS.strong(COLORS.electricCyan) }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenAdd}
        className="flex-shrink-0 w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-[#0B1220] shadow-[0_0_20px_rgba(34,240,255,0.3)]"
      >
        <Plus size={22} strokeWidth={3} />
      </motion.button>
    </div>
  );
});

const TransactionGroups = React.memo(function TransactionGroups({
  groups,
  loading,
  onEdit,
  onDelete,
  onFeedback,
}: {
  groups: TransactionGroupViewModel[];
  loading: boolean;
  onEdit: (tx: DisplayTransaction) => void;
  onDelete: (tx: DisplayTransaction, e: React.MouseEvent) => void;
  onFeedback: (tx: DisplayTransaction) => void;
}) {
  const [expandedState, setExpandedState] = React.useState<Record<string, boolean>>({});
  const [visibleGroupCount, setVisibleGroupCount] = React.useState(INITIAL_VISIBLE_GROUPS);
  const groupKeys = React.useMemo(() => groups.map((group) => group.date), [groups]);

  React.useEffect(() => {
    setExpandedState((prev) => {
      const next: Record<string, boolean> = {};
      groupKeys.forEach((date, index) => {
        next[date] = prev[date] ?? index < INITIAL_VISIBLE_GROUPS;
      });
      return next;
    });

    setVisibleGroupCount((prev) => {
      if (groupKeys.length <= INITIAL_VISIBLE_GROUPS) return groupKeys.length;
      return prev >= groupKeys.length ? groupKeys.length : Math.max(INITIAL_VISIBLE_GROUPS, prev);
    });
  }, [groupKeys]);

  const visibleGroups = React.useMemo(
    () => groups.slice(0, visibleGroupCount),
    [groups, visibleGroupCount]
  );

  const toggleGroup = React.useCallback((date: string) => {
    setExpandedState((prev) => ({ ...prev, [date]: !prev[date] }));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-600 text-xs font-black uppercase tracking-widest animate-pulse">
        Loading transactions...
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="text-gray-600 text-xs font-black uppercase tracking-widest">
          No transactions found
        </div>
        <div className="text-gray-700 text-xs">Add your first transaction using the + button.</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {visibleGroups.map((group) => {
        const isExpanded = expandedState[group.date] ?? false;

        return (
          <div key={group.date} className="space-y-4">
            <button onClick={() => toggleGroup(group.date)} className="flex items-center gap-4 w-full text-left group">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 bg-[#101A2E] px-4 py-1 rounded-full border border-white/5">
                {group.dateLabel}
              </div>
              <div className="h-px flex-1 bg-white/[0.03]" />
              <ChevronDown
                size={16}
                className={cn("text-gray-600 transition-transform duration-300", !isExpanded && "-rotate-90")}
              />
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  {group.rows.map((row) => {
                    const Icon = row.categoryIcon;
                    const isManual = row.tx.source === "manual";

                    return (
                      <div
                        key={`${row.tx.source}-${row.tx.id}`}
                        className="bg-[#101A2E]/50 border border-white/[0.03] rounded-3xl p-5 flex items-center justify-between group/tx transition-all hover:bg-white/[0.02]"
                      >
                        <div
                          className={cn("flex items-center gap-5 flex-1", isManual && "cursor-pointer")}
                          onClick={() => {
                            if (isManual) onEdit(row.tx);
                          }}
                        >
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover/tx:scale-110"
                            style={{ backgroundColor: `${row.categoryColor}15` }}
                          >
                            <Icon size={20} style={{ color: row.categoryColor }} />
                          </div>

                          <div>
                            <h4 className="font-black text-white text-lg">{row.heading}</h4>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              <span>{row.categoryLabel}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-700" />
                              <span>{row.timeLabel}</span>

                              {row.tx.source === "bank" && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                                  <span className="text-cyan-400/80">Bank</span>
                                </>
                              )}

                              {row.valueScore != null && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                                  <span style={{ color: row.valueColor }}>
                                    Value {row.valueScore} · {row.valueLabel}
                                  </span>
                                </>
                              )}

                              {row.satisfactionLabel && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                                  <span style={{ color: COLORS.electricCyan }}>{row.satisfactionLabel}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {row.valueScore != null && (
                            <div className="min-w-[138px] rounded-2xl border border-white/5 bg-[#0B1220]/80 px-4 py-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">
                                  Value
                                </div>
                                <div className="text-lg font-black" style={{ color: row.valueColor }}>
                                  {row.valueScore}
                                </div>
                              </div>

                              <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(100, (row.valueScore / 150) * 100)}%`,
                                    backgroundColor: row.valueColor,
                                  }}
                                />
                              </div>

                              <div
                                className="mt-2 text-[9px] font-black uppercase tracking-[0.18em]"
                                style={{ color: row.valueColor }}
                              >
                                {row.valueLabel}
                              </div>

                              <div className="mt-1 text-[10px] leading-tight text-gray-500">
                                {row.valueTone}
                              </div>
                            </div>
                          )}

                          <div className="text-right">
                            <div className={cn("text-xl font-black", row.isIncome ? "text-emerald-400" : "text-white")}>
                              {row.amountText}
                            </div>
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                              {row.directionLabel}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onFeedback(row.tx);
                            }}
                            className="p-2 hover:bg-white/10 rounded-xl text-gray-500 hover:text-cyan-400 transition-colors"
                            title="Give feedback"
                          >
                            <MessageSquare size={18} />
                          </button>

                          {isManual && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(row.tx);
                                }}
                                className="p-2 hover:bg-white/10 rounded-xl text-gray-500 hover:text-cyan-400 transition-colors"
                                title="Edit"
                              >
                                <Pencil size={18} />
                              </button>

                              <button
                                onClick={(e) => onDelete(row.tx, e)}
                                className="p-2 hover:bg-red-500/10 rounded-xl text-gray-500 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {visibleGroupCount < groups.length && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setVisibleGroupCount((prev) => Math.min(prev + INITIAL_VISIBLE_GROUPS, groups.length))}
            className="rounded-2xl border-white/10"
          >
            Load More Dates
          </Button>
        </div>
      )}
    </div>
  );
});

export const TransactionsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setRightPanelOpen } = usePanelActions();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddPanelOpen, setIsAddPanelOpen] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<DisplayTransaction | null>(null);
  const [feedbackTransaction, setFeedbackTransaction] = React.useState<DisplayTransaction | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS);

  const { transactions, loading, error, refetch } = useMergedTransactions({
    category: filters.category || undefined,
    direction: filters.direction || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
  });

  const refetchTransactions = React.useCallback(() => {
    refetch();
  }, [refetch]);

  React.useEffect(() => {
    setRightPanelOpen(isAddPanelOpen);
    return () => setRightPanelOpen(false);
  }, [isAddPanelOpen, setRightPanelOpen]);

  React.useEffect(() => {
    if (error) toast.error("Failed to load transactions.");
  }, [error]);

  React.useEffect(() => {
    if (location.pathname === "/transactions/new") {
      setEditingTransaction(null);
      setIsAddPanelOpen(true);
    }
  }, [location.pathname]);

  const closePanel = React.useCallback(() => {
    setIsAddPanelOpen(false);
    setEditingTransaction(null);
    if (location.pathname === "/transactions/new") {
      navigate("/transactions", { replace: true });
    }
  }, [location.pathname, navigate]);

  const openAddPanel = React.useCallback(() => {
    setEditingTransaction(null);
    setIsAddPanelOpen(true);
  }, []);

  const handleEdit = React.useCallback((tx: DisplayTransaction) => {
    if (tx.source === "bank") return;
    setEditingTransaction(tx);
    setIsAddPanelOpen(true);
  }, []);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredTransactions = React.useMemo(
    () =>
      normalizedSearch
        ? transactions.filter((tx) =>
            [tx.description_raw, tx.category].join(" ").toLowerCase().includes(normalizedSearch)
          )
        : transactions,
    [transactions, normalizedSearch]
  );

  const transactionGroups = React.useMemo<TransactionGroupViewModel[]>(
    () =>
      Array.from(
        filteredTransactions
          .reduce<Map<string, TransactionRowViewModel[]>>((acc, tx) => {
            const date = tx.occurred_at.split("T")[0];
            if (selectedDate && date !== selectedDate) return acc;

            const category = getCategoryMeta(tx.category);
            const isIncome = tx.direction === "income";
            const amount = Math.abs(Number(tx.amount));
            const valueScore = deriveTransactionValueScore(tx);
            const value = getValuePresentation(valueScore);

            const row: TransactionRowViewModel = {
              tx,
              categoryLabel: category.label,
              categoryColor: category.color,
              categoryIcon: category.icon,
              timeLabel: new Date(tx.occurred_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              heading: tx.description_raw || category.label,
              directionLabel: tx.direction,
              satisfactionLabel: tx.satisfaction_rating ? `★ ${tx.satisfaction_rating}/10` : null,
              amountText: `${isIncome ? "+" : "-"}$${amount.toFixed(2)}`,
              isIncome,
              valueScore,
              valueLabel: value.label,
              valueTone:
                valueScore == null ? "Waiting for satisfaction or regret data." : value.tone,
              valueColor: value.accentColor,
            };

            const existing = acc.get(date);
            if (existing) existing.push(row);
            else acc.set(date, [row]);

            return acc;
          }, new Map<string, TransactionRowViewModel[]>())
          .entries()
      )
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, rows]) => ({ date, dateLabel: formatDayLabel(date), rows })),
    [filteredTransactions, selectedDate]
  );

  const handleAdded = React.useCallback(
    (_tx: Transaction) => {
      refetchTransactions();
    },
    [refetchTransactions]
  );

  const handleUpdated = React.useCallback(
    (_tx: Transaction) => {
      refetchTransactions();
    },
    [refetchTransactions]
  );

  const handleDelete = React.useCallback(
    async (tx: DisplayTransaction, e: React.MouseEvent) => {
      e.stopPropagation();

      if (tx.source === "bank") return;
      if (typeof tx.id !== "number") return;
      if (!window.confirm(`Delete "${tx.description_raw || "this transaction"}"?`)) return;

      try {
        await TransactionsAPI.remove(tx.id);
        refetchTransactions();
        toast.success("Transaction deleted.");
      } catch {
        toast.error("Failed to delete transaction.");
      }
    },
    [refetchTransactions]
  );

  const { totalSpend, totalIncome, net } = React.useMemo(() => {
    const totalSpendMemo = transactions
      .filter((t) => t.direction === "spend")
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

    const totalIncomeMemo = transactions
      .filter((t) => t.direction === "income")
      .reduce((s, t) => s + Number(t.amount), 0);

    return {
      totalSpend: totalSpendMemo,
      totalIncome: totalIncomeMemo,
      net: totalIncomeMemo - totalSpendMemo,
    };
  }, [transactions]);

  return (
    <div className="space-y-12 pb-40 relative z-10">
      <BankingSection onTransactionsRefetch={refetchTransactions} />

      <TransactionStats
        count={transactions.length}
        totalSpend={totalSpend}
        totalIncome={totalIncome}
        net={net}
      />

      <div className="space-y-4">
        <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
          <Calendar size={20} className="text-cyan-400" /> Spending Calendar
        </h3>
        <ElectricCard className="p-8" elevation={0}>
          <SpendingCalendar
            transactions={transactions}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </ElectricCard>
      </div>

      <TransactionToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters(EMPTY_FILTERS)}
        onOpenAdd={openAddPanel}
      />

      <TransactionGroups
        groups={transactionGroups}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFeedback={setFeedbackTransaction}
      />

      <AnimatePresence>
        {isAddPanelOpen && (
          <AddPanel
            onClose={closePanel}
            onAdded={handleAdded}
            onUpdated={handleUpdated}
            editingTransaction={editingTransaction}
          />
        )}
      </AnimatePresence>

      <TransactionFeedbackModal
        transaction={feedbackTransaction}
        open={!!feedbackTransaction}
        onOpenChange={(open) => {
          if (!open) setFeedbackTransaction(null);
        }}
        onSubmitted={refetchTransactions}
      />
    </div>
  );
};