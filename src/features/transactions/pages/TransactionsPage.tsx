import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  Zap,
  Search,
  Filter,
  Plus,
  X,
  Calendar,
  Coffee,
  ShoppingBag,
  Car,
  Zap as ZapIcon,
  ChevronDown,
  Wallet,
  Clock,
} from "lucide-react";
import { COLORS, GLOWS } from "@/shared/theme";
import { ElectricCard } from "@/features/home/components/ElectricCard";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/components/ui/utils";

type Tx = {
  id: number;
  date: string;
  time: string;
  merchant: string;
  category: string;
  amount: number;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string;
};

const TRANSACTIONS: Tx[] = [
  { id: 1, date: "2026-02-21", time: "14:20", merchant: "Starbucks", category: "Food & Drink", amount: -6.5, icon: Coffee, color: COLORS.electricYellow },
  { id: 2, date: "2026-02-21", time: "12:15", merchant: "Salary Deposit", category: "Income", amount: 3200, icon: Wallet, color: COLORS.electricGreen },
  { id: 3, date: "2026-02-20", time: "19:30", merchant: "Amazon", category: "Shopping", amount: -42.99, icon: ShoppingBag, color: COLORS.electricBlue },
  { id: 4, date: "2026-02-20", time: "10:00", merchant: "Netflix", category: "Subscriptions", amount: -15.99, icon: ZapIcon, color: COLORS.electricRed },
  { id: 5, date: "2026-02-19", time: "18:45", merchant: "Uber", category: "Transport", amount: -18.2, icon: Car, color: COLORS.electricCyan },
  { id: 6, date: "2026-02-19", time: "09:12", merchant: "Whole Foods", category: "Groceries", amount: -84.32, icon: ShoppingBag, color: COLORS.electricGreen },
  { id: 7, date: "2026-02-18", time: "13:00", merchant: "Apple Store", category: "Tech", amount: -129, icon: ZapIcon, color: COLORS.electricPurple },
];

const HEATMAP_DATA = Array.from({ length: 91 }, (_, i) => ({
  date: new Date(2026, 1, 21 - (90 - i)).toISOString().split("T")[0],
  value: Math.floor(Math.random() * 500),
}));

function Heatmap({ data, onSelectDate }: { data: Array<{ date: string; value: number }>; onSelectDate: (date: string) => void }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const getColor = (value: number) => {
    if (value === 0) return "rgba(255, 255, 255, 0.03)";
    const intensity = value / maxValue;
    if (intensity < 0.25) return `${COLORS.electricCyan}20`;
    if (intensity < 0.5) return `${COLORS.electricCyan}40`;
    if (intensity < 0.75) return `${COLORS.electricCyan}70`;
    return COLORS.electricCyan;
  };

  return (
    <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
      {data.map((day, i) => (
        <motion.div
          key={day.date}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.005 }}
          className="w-3 h-3 rounded-[2px] cursor-pointer relative group"
          style={{ backgroundColor: getColor(day.value) }}
          onClick={() => onSelectDate(day.date)}
        >
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#101A2E] border border-white/10 rounded-md text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
            {day.date}: ${day.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const FinancialHealthScore = () => (
  <div className="relative w-40 h-40 group">
    <svg className="w-full h-full transform -rotate-90">
      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/[0.03]" />
      <motion.circle
        cx="80"
        cy="80"
        r="70"
        stroke={COLORS.electricGreen}
        strokeWidth="10"
        strokeDasharray={440}
        initial={{ strokeDashoffset: 440 }}
        animate={{ strokeDashoffset: 440 * (1 - 0.82) }}
        transition={{ duration: 2, ease: "easeOut" }}
        strokeLinecap="round"
        fill="transparent"
        style={{ filter: `drop-shadow(0 0 10px ${COLORS.electricGreen}80)` }}
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-4xl font-black text-white">82</span>
      <span className="text-[9px] uppercase font-black text-gray-500 tracking-widest">Health Score</span>
    </div>
  </div>
);

export const TransactionsPage = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddPanelOpen, setIsAddPanelOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>([]);

  const filteredTransactions = TRANSACTIONS.filter((tx) =>
    [tx.merchant, tx.category].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTransactions = filteredTransactions.reduce<Record<string, Tx[]>>((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {});

  const dates = Object.keys(groupedTransactions)
    .sort((a, b) => b.localeCompare(a))
    .filter((date) => !selectedDate || date === selectedDate);

  const toggleGroup = (date: string) => {
    setExpandedGroups((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]));
  };

  React.useEffect(() => {
    setExpandedGroups(dates);
  }, [selectedDate, searchQuery]);

  return (
    <div className="space-y-12 pb-40 relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <ElectricCard className="p-6" semanticColor={COLORS.electricCyan} elevation={1}>
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">Current Balance</div>
          <div className="text-3xl font-black text-white mb-2">$12,450.80</div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
            <span className="text-emerald-400 flex items-center gap-0.5"><TrendingUp size={12} /> 2.4%</span>
            <span>vs last week</span>
          </div>
        </ElectricCard>

        <ElectricCard className="p-6" semanticColor={COLORS.electricBlue} elevation={1}>
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">This Month</div>
          <div className="text-3xl font-black text-white mb-3">$2,840.00</div>
          <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} className="h-full bg-blue-500" style={{ boxShadow: `0 0 10px ${COLORS.electricBlue}` }} />
          </div>
        </ElectricCard>

        <ElectricCard className="p-6" semanticColor={COLORS.electricRed} elevation={1}>
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">Spend Delta</div>
          <div className="text-3xl font-black text-white mb-2">+12.5%</div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
            <TrendingUp size={14} className="text-red-400" />
            <span>More than Jan</span>
          </div>
        </ElectricCard>

        <ElectricCard className="p-6" semanticColor={COLORS.electricYellow} elevation={1}>
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">Top Category</div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-yellow-500/10"><Coffee size={18} className="text-yellow-400" /></div>
            <div className="text-xl font-black text-white">Food & Drink</div>
          </div>
          <div className="text-xs font-bold text-gray-400">$642.50 total</div>
        </ElectricCard>

        <ElectricCard className="p-6 bg-gradient-to-br from-[#101A2E] to-[#1a2b4a]" semanticColor={COLORS.electricCyan} glowIntensity="medium" elevation={2}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-cyan-400" />
            <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-black">AI Insight</span>
          </div>
          <p className="text-sm font-medium text-gray-200 leading-relaxed">
            "You spent <span className="text-cyan-400 font-bold">23% more</span> on dining out this week. Consider Zapping it."
          </p>
        </ElectricCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <Calendar size={20} className="text-cyan-400" />
                Spending Intensity
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-[2px] bg-white/[0.03]" />
                  <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: `${COLORS.electricCyan}20` }} />
                  <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: `${COLORS.electricCyan}40` }} />
                  <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: `${COLORS.electricCyan}70` }} />
                  <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: COLORS.electricCyan }} />
                </div>
                <span>More</span>
              </div>
            </div>
            <ElectricCard className="p-8" elevation={0}>
              <Heatmap data={HEATMAP_DATA} onSelectDate={setSelectedDate} />
            </ElectricCard>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96 group">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#101A2E] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-bold outline-none focus:border-cyan-500/30 transition-all placeholder:text-gray-600"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                {["Date Range", "Category", "Type", "Amount"].map((filter) => (
                  <button key={filter} className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-[#101A2E] border border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:border-white/10 transition-all flex items-center gap-2">
                    {filter}
                    <ChevronDown size={12} />
                  </button>
                ))}
                <button className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Filter size={16} />
                </button>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white"
                  >
                    Clear Date
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {dates.length === 0 && <p className="text-gray-500">No transactions match your filters.</p>}
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
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2">
                        {groupedTransactions[date].map((tx) => (
                          <motion.div
                            key={tx.id}
                            initial={{ x: -10, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.02)" }}
                            className="bg-[#101A2E]/50 border border-white/[0.03] rounded-3xl p-5 flex items-center justify-between group/tx cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover/tx:scale-110" style={{ backgroundColor: `${tx.color}15` }}>
                                <tx.icon size={20} style={{ color: tx.color }} />
                              </div>
                              <div>
                                <h4 className="font-black text-white text-lg">{tx.merchant}</h4>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                  <span>{tx.category}</span>
                                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                                  <span>{tx.time}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={cn("text-xl font-black", tx.amount > 0 ? "text-emerald-400" : "text-white")}>
                                {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                              </div>
                              <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Confirmed</div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <ElectricCard className="p-10 flex flex-col items-center text-center space-y-6" semanticColor={COLORS.electricGreen} elevation={2}>
            <h3 className="text-xl font-black text-white tracking-tight uppercase">Health Overview</h3>
            <FinancialHealthScore />
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400 leading-relaxed px-4">
                "Your savings rate is <span className="text-emerald-400 font-bold">12% higher</span> than your age group average. Keep it up!"
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                <div className="text-[9px] uppercase font-black text-gray-500 mb-1">Savings</div>
                <div className="text-xl font-black text-white">$4.2k</div>
              </div>
              <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                <div className="text-[9px] uppercase font-black text-gray-500 mb-1">Debt</div>
                <div className="text-xl font-black text-white">$0.00</div>
              </div>
            </div>
          </ElectricCard>

          <ElectricCard className="p-8" semanticColor={COLORS.electricPurple} elevation={1}>
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <Clock size={18} className="text-purple-400" />
              Pulse Events
            </h3>
            <div className="space-y-6">
              {[
                { label: "Unusual Spend", desc: "Starbucks twice in 4h", time: "2h ago", color: COLORS.electricYellow },
                { label: "Recurring Hit", desc: "Netflix Premium", time: "1d ago", color: COLORS.electricRed },
                { label: "Reward Earned", desc: "+$2.50 Cashback", time: "2d ago", color: COLORS.electricGreen },
              ].map((event, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-1 h-12 rounded-full transition-all group-hover:scale-y-110" style={{ backgroundColor: event.color }} />
                  <div>
                    <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{event.label}</div>
                    <div className="text-sm font-bold text-white">{event.desc}</div>
                    <div className="text-[10px] text-gray-600 font-bold mt-1">{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </ElectricCard>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.1, boxShadow: GLOWS.strong(COLORS.electricCyan) }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAddPanelOpen(true)}
        className="fixed bottom-10 right-10 w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center text-[#0B1220] z-[100] shadow-[0_0_40px_rgba(34,240,255,0.4)]"
      >
        <Plus size={36} strokeWidth={3} />
      </motion.button>

      <AnimatePresence>
        {isAddPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddPanelOpen(false)}
              className="fixed inset-0 bg-[#0B1220]/80 backdrop-blur-md z-[110]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#101A2E] border-l border-white/5 z-[120] p-12 shadow-2xl flex flex-col"
              style={{ boxShadow: `-20px 0 60px rgba(0,0,0,0.5), ${GLOWS.inner}` }}
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter">Add Transaction</h2>
                  <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 font-black mt-1">Manual Entry</div>
                </div>
                <button onClick={() => setIsAddPanelOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-all">
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="flex-1 space-y-10 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Quick Parse</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="$18.40 sushi dinner"
                      className="w-full bg-[#0B1220] border border-white/10 rounded-3xl py-8 px-8 text-2xl font-black text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-800"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="text-[10px] font-black bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">AI Ready</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount</label>
                    <input type="number" placeholder="0.00" className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Type</label>
                    <div className="flex bg-[#0B1220] rounded-2xl p-1.5 border border-white/10">
                      <button className="flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-cyan-500 text-[#0B1220]">Expense</button>
                      <button className="flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500">Income</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                  <button className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 px-6 text-left flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coffee size={18} className="text-gray-500" />
                      <span className="font-bold text-white">Select Category</span>
                    </div>
                    <ChevronDown size={18} className="text-gray-600" />
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Date</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="date" className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold outline-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Notes</label>
                  <textarea placeholder="Any specific details..." className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none h-32 resize-none" />
                </div>
              </div>

              <div className="pt-8 mt-auto">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-[#0B1220] rounded-[2rem] py-10 text-xl font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02]">
                  Add to My CFO
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
