import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, X, Calendar, Coffee, ShoppingBag, Car,
  Zap as ZapIcon, ChevronDown, Wallet, ChevronUp,
} from "lucide-react";
import { COLORS, GLOWS } from "@/shared/theme";
import { ElectricCard } from "@/features/home/components/ElectricCard";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/components/ui/utils";
import { TransactionsAPI, type Transaction, type NewTransaction } from "@/api/transactions.api";
import { toast } from "sonner";

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { value: "eating_out",    label: "Eating Out",     icon: Coffee,      color: COLORS.electricYellow },
  { value: "groceries",     label: "Groceries",      icon: ShoppingBag, color: COLORS.electricGreen  },
  { value: "transport",     label: "Transport",      icon: Car,         color: COLORS.electricCyan   },
  { value: "subscriptions", label: "Subscriptions",  icon: ZapIcon,     color: COLORS.electricRed    },
  { value: "shopping",      label: "Shopping",       icon: ShoppingBag, color: COLORS.electricBlue   },
  { value: "bills",         label: "Bills",          icon: Wallet,      color: COLORS.electricPurple },
  { value: "entertainment", label: "Entertainment",  icon: ZapIcon,     color: COLORS.electricYellow },
  { value: "health",        label: "Health",         icon: ZapIcon,     color: COLORS.electricGreen  },
  { value: "education",     label: "Education",      icon: ZapIcon,     color: COLORS.electricCyan   },
  { value: "other",         label: "Other",          icon: ZapIcon,     color: COLORS.electricPurple },
];

function getCategoryMeta(value: string) {
  return CATEGORY_OPTIONS.find((c) => c.value === value) ?? CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1];
}

// ── Heatmap ───────────────────────────────────────────────────────────────────
function Heatmap({
  transactions,
  selectedDate,
  onSelectDate,
}: {
  transactions: Transaction[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}) {
  const days = Array.from({ length: 91 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (90 - i));
    return d.toISOString().split("T")[0];
  });

  const spendByDay: Record<string, number> = {};
  transactions.forEach((tx) => {
    const day = tx.occurred_at.split("T")[0];
    if (tx.direction === "spend") {
      spendByDay[day] = (spendByDay[day] ?? 0) + Math.abs(Number(tx.amount));
    }
  });

  const maxValue = Math.max(...Object.values(spendByDay), 1);
  const getColor = (value: number) => {
    if (!value) return "rgba(255,255,255,0.03)";
    const intensity = value / maxValue;
    if (intensity < 0.25) return `${COLORS.electricCyan}20`;
    if (intensity < 0.5)  return `${COLORS.electricCyan}40`;
    if (intensity < 0.75) return `${COLORS.electricCyan}70`;
    return COLORS.electricCyan;
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
        {days.map((date, i) => (
          <motion.div
            key={date}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.004 }}
            className="w-3 h-3 rounded-[2px] cursor-pointer relative group"
            style={{
              backgroundColor: getColor(spendByDay[date] ?? 0),
              outline: selectedDate === date ? `2px solid ${COLORS.electricCyan}` : "none",
            }}
            onClick={() => onSelectDate(selectedDate === date ? null : date)}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#101A2E] border border-white/10 rounded-md text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              {date}: ${(spendByDay[date] ?? 0).toFixed(2)}
            </div>
          </motion.div>
        ))}
      </div>
      {selectedDate && (
        <button
          onClick={() => onSelectDate(null)}
          className="mt-4 text-[10px] font-black uppercase tracking-widest text-cyan-400"
        >
          Clear date filter ×
        </button>
      )}
    </div>
  );
}

// ── Add Transaction Panel ─────────────────────────────────────────────────────
const EMPTY_FORM: NewTransaction = {
  description_raw: "",
  amount: "",
  direction: "spend",
  category: "other",
  occurred_at: new Date().toISOString().split("T")[0],
  satisfaction_rating: null,
};

function AddPanel({ onClose, onAdded }: { onClose: () => void; onAdded: (tx: Transaction) => void }) {
  const [form, setForm] = React.useState<NewTransaction>(EMPTY_FORM);
  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const set = <K extends keyof NewTransaction>(key: K, val: NewTransaction[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const selectedCat = getCategoryMeta(form.category);

  const handleSubmit = async () => {
    if (!form.amount || Number(form.amount) <= 0) { toast.error("Please enter a valid amount."); return; }
    if (!form.description_raw.trim()) { toast.error("Please enter a description."); return; }
    setSubmitting(true);
    try {
      const tx = await TransactionsAPI.create({ ...form, occurred_at: `${form.occurred_at}T12:00:00Z` });
      toast.success("Transaction added!");
      onAdded(tx);
      onClose();
    } catch {
      toast.error("Failed to save transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#0B1220]/80 backdrop-blur-md z-[110]"
      />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#101A2E] border-l border-white/5 z-[120] p-12 shadow-2xl flex flex-col"
        style={{ boxShadow: `-20px 0 60px rgba(0,0,0,0.5)` }}
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">Add Transaction</h2>
            <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 font-black mt-1">Manual Entry</div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto pr-2">
          {/* Description */}
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

          {/* Amount + Type */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount ($)</label>
              <input
                type="number" min="0" step="0.01" placeholder="0.00"
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
                    style={form.direction === type ? { backgroundColor: COLORS.electricCyan, color: "#0B1220" } : { color: "#64748b" }}
                  >
                    {type === "spend" ? "Expense" : "Income"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category */}
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
              {categoryOpen ? <ChevronUp size={18} className="text-gray-600" /> : <ChevronDown size={18} className="text-gray-600" />}
            </button>
            {categoryOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-[#0B1220] border border-white/10 rounded-2xl overflow-auto z-[200] max-h-64" style={{ top: "100%" }}>
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => { set("category", cat.value); setCategoryOpen(false); }}
                    className="w-full flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition-all text-left"
                  >
                    <cat.icon size={16} style={{ color: cat.color }} />
                    <span className="font-bold text-white text-sm">{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
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

          {/* Satisfaction */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              How satisfied are you with this purchase? <span className="text-gray-600">(optional)</span>
            </label>
            <div className="flex gap-2">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <button
                  key={n}
                  onClick={() => set("satisfaction_rating", form.satisfaction_rating === n ? null : n)}
                  className="flex-1 py-3 rounded-xl text-xs font-black transition-all"
                  style={{
                    backgroundColor: form.satisfaction_rating === n ? COLORS.electricCyan : "rgba(255,255,255,0.04)",
                    color: form.satisfaction_rating === n ? "#0B1220" : "#64748b",
                    border: `1px solid ${form.satisfaction_rating === n ? COLORS.electricCyan : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Reflection <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              placeholder="Any thoughts on this purchase..."
              className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-cyan-500/50 transition-all h-28 resize-none placeholder:text-gray-700"
            />
          </div>
        </div>

        <div className="pt-8 mt-auto">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-[#0B1220] rounded-[2rem] py-10 text-xl font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Add Transaction"}
          </Button>
        </div>
      </motion.div>
    </>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────────
type Filters = { category: string; direction: string; date_from: string; date_to: string };
const EMPTY_FILTERS: Filters = { category: "", direction: "", date_from: "", date_to: "" };

function FilterBar({
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

  // Close dropdown when clicking outside
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

      {/* Date Range */}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen(open === "date" ? null : "date")}
          className={btnClass(!!(filters.date_from || filters.date_to))}
        >
          {filters.date_from || filters.date_to ? `${filters.date_from || "…"} → ${filters.date_to || "…"}` : "Date Range"}
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

      {/* Category */}
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
              onClick={() => { onChange({ ...filters, category: "" }); setOpen(null); }}
              className="w-full px-5 py-3 text-left text-[10px] font-black uppercase text-gray-500 hover:bg-white/5"
            >
              All
            </button>
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => { onChange({ ...filters, category: cat.value }); setOpen(null); }}
                className={cn("w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-all text-left", filters.category === cat.value && "bg-white/5")}
              >
                <cat.icon size={14} style={{ color: cat.color }} />
                <span className="font-bold text-white text-xs">{cat.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Type */}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen(open === "type" ? null : "type")}
          className={btnClass(!!filters.direction)}
        >
          {filters.direction ? (filters.direction === "spend" ? "Expense" : filters.direction.charAt(0).toUpperCase() + filters.direction.slice(1)) : "Type"}
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
                onClick={() => { onChange({ ...filters, direction: opt.value }); setOpen(null); }}
                className={cn("w-full px-5 py-3 text-left text-xs font-black text-white hover:bg-white/5 transition-all", filters.direction === opt.value && "bg-white/5")}
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
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export const TransactionsPage = () => {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddPanelOpen, setIsAddPanelOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>([]);
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    TransactionsAPI.list({
      category: filters.category || undefined,
      direction: filters.direction || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
    })
      .then((data) => { if (!cancelled) setTransactions(data); })
      .catch(() => { if (!cancelled) toast.error("Failed to load transactions."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters]);

  const filtered = transactions.filter((tx) =>
    [tx.description_raw, tx.category].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const day = tx.occurred_at.split("T")[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(tx);
    return acc;
  }, {});

  const dates = Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .filter((d) => !selectedDate || d === selectedDate);

  React.useEffect(() => { setExpandedGroups(dates); }, [selectedDate, searchQuery, transactions]);

  const toggleGroup = (date: string) =>
    setExpandedGroups((prev) => prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]);

  const handleAdded = (tx: Transaction) => setTransactions((prev) => [tx, ...prev]);

  const totalSpend  = transactions.filter(t => t.direction === "spend").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const totalIncome = transactions.filter(t => t.direction === "income").reduce((s, t) => s + Number(t.amount), 0);
  const net = totalIncome - totalSpend;

  return (
    <div className="space-y-12 pb-40 relative z-10">

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ElectricCard className="p-6" semanticColor={COLORS.electricCyan} elevation={1}>
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">Total Transactions</div>
          <div className="text-3xl font-black text-white">{transactions.length}</div>
        </ElectricCard>
        <ElectricCard className="p-6" semanticColor={COLORS.electricRed} elevation={1}>
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">Total Spent</div>
          <div className="text-3xl font-black text-white">${totalSpend.toFixed(2)}</div>
        </ElectricCard>
        <ElectricCard className="p-6" semanticColor={COLORS.electricGreen} elevation={1}>
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">Total Income</div>
          <div className="text-3xl font-black text-white">${totalIncome.toFixed(2)}</div>
        </ElectricCard>
        <ElectricCard className="p-6" semanticColor={COLORS.electricBlue} elevation={1}>
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">Net</div>
          <div className={cn("text-3xl font-black", net >= 0 ? "text-emerald-400" : "text-red-400")}>
            {net >= 0 ? "+" : ""}${net.toFixed(2)}
          </div>
        </ElectricCard>
      </div>

      {/* ── Heatmap ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Calendar size={20} className="text-cyan-400" /> Spending Intensity
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 tracking-widest">
            <span>Less</span>
            <div className="flex gap-1">
              {["rgba(255,255,255,0.03)", `${COLORS.electricCyan}20`, `${COLORS.electricCyan}40`, `${COLORS.electricCyan}70`, COLORS.electricCyan].map((bg, i) => (
                <div key={i} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: bg }} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
        <ElectricCard className="p-8" elevation={0}>
          <Heatmap transactions={transactions} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </ElectricCard>
      </div>

      {/* ── Search + Filters + Add ── */}
      <div className="flex flex-row gap-4 items-center">
        <div className="relative w-80 flex-shrink-0 group">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101A2E] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-bold outline-none focus:border-cyan-500/30 transition-all placeholder:text-gray-600"
          />
        </div>

        <div className="flex items-center gap-3 flex-1">
          <FilterBar filters={filters} onChange={setFilters} onClear={() => setFilters(EMPTY_FILTERS)} />
        </div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: GLOWS.strong(COLORS.electricCyan) }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddPanelOpen(true)}
          className="flex-shrink-0 w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-[#0B1220] shadow-[0_0_20px_rgba(34,240,255,0.3)]"
        >
          <Plus size={22} strokeWidth={3} />
        </motion.button>
      </div>

      {/* ── Transaction List ── */}
      <div className="space-y-8">
        {loading && (
          <div className="text-center py-16 text-gray-600 text-xs font-black uppercase tracking-widest animate-pulse">
            Loading transactions...
          </div>
        )}

        {!loading && dates.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="text-gray-600 text-xs font-black uppercase tracking-widest">No transactions found</div>
            <div className="text-gray-700 text-xs">Add your first transaction using the + button.</div>
          </div>
        )}

        {dates.map((date) => (
          <div key={date} className="space-y-4">
            <button onClick={() => toggleGroup(date)} className="flex items-center gap-4 w-full text-left group">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 bg-[#101A2E] px-4 py-1 rounded-full border border-white/5">
                {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
              <div className="h-px flex-1 bg-white/[0.03]" />
              <ChevronDown size={16} className={cn("text-gray-600 transition-transform duration-300", !expandedGroups.includes(date) && "-rotate-90")} />
            </button>

            <AnimatePresence>
              {expandedGroups.includes(date) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  {grouped[date].map((tx) => {
                    const cat = getCategoryMeta(tx.category);
                    const isIncome = tx.direction === "income";
                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ x: -10, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        whileHover={{ scale: 1.005, backgroundColor: "rgba(255,255,255,0.02)" }}
                        className="bg-[#101A2E]/50 border border-white/[0.03] rounded-3xl p-5 flex items-center justify-between group/tx cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-5">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover/tx:scale-110"
                            style={{ backgroundColor: `${cat.color}15` }}
                          >
                            <cat.icon size={20} style={{ color: cat.color }} />
                          </div>
                          <div>
                            <h4 className="font-black text-white text-lg">{tx.description_raw || cat.label}</h4>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              <span>{cat.label}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-700" />
                              <span>{new Date(tx.occurred_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              {tx.satisfaction_rating && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                                  <span style={{ color: COLORS.electricCyan }}>★ {tx.satisfaction_rating}/10</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn("text-xl font-black", isIncome ? "text-emerald-400" : "text-white")}>
                            {isIncome ? "+" : "-"}${Math.abs(Number(tx.amount)).toFixed(2)}
                          </div>
                          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{tx.direction}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* ── Add Panel ── */}
      <AnimatePresence>
        {isAddPanelOpen && (
          <AddPanel onClose={() => setIsAddPanelOpen(false)} onAdded={handleAdded} />
        )}
      </AnimatePresence>
    </div>
  );
};