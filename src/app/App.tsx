import * as React from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { 
  Home, 
  CreditCard, 
  BarChart2, 
  Search, 
  User, 
  Camera, 
  MessageCircle, 
  Plus, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Zap, 
  Heart, 
  AlertCircle,
  Clock,
  ChevronRight,
  Filter,
  DollarSign,
  Maximize2,
  TrendingDown,
  Sparkles,
  ZapOff
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  AreaChart,
  Area
} from "recharts";
import { toast, Toaster } from "sonner";
import { Button } from "./components/ui/button";
import { cn } from "./components/ui/utils";

/**
 * EXACT FLUORESCENT COLOR SYSTEM
 */
const COLORS = {
  bgPrimary: "#0B1220",
  bgCard: "#101A2E",
  bgCardHover: "#14203A",
  electricGreen: "#3CFF9E",
  electricRed: "#FF4D4D",
  electricBlue: "#3B82FF",
  electricCyan: "#22F0FF",
  electricTeal: "#00FFD1",
  electricPurple: "#B47CFF",
  electricYellow: "#FFE066"
};

const GLOWS = {
  soft: (color: string) => `0 0 12px ${color}40`,
  medium: (color: string) => `0 0 24px ${color}59`,
  strong: (color: string) => `0 0 40px ${color}8c`,
  inner: "inset 0 0 1px rgba(255,255,255,0.15)",
  ambient: (opacity = 0.6) => `0 20px 60px rgba(0,0,0,${opacity})`
};

// --- Types ---
type Page = "home" | "subscriptions" | "analytics" | "search";

// --- Components ---

/**
 * AMBIENT BACKGROUND
 */
const AmbientEnergyLines = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-0">
    <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
      <motion.path
        d="M -100 500 Q 250 300 500 500 T 1100 500"
        stroke={COLORS.electricCyan}
        strokeWidth="1"
        fill="none"
        animate={{
          d: [
            "M -100 500 Q 250 300 500 500 T 1100 500",
            "M -100 500 Q 250 700 500 500 T 1100 500",
            "M -100 500 Q 250 300 500 500 T 1100 500",
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.path
        d="M -100 200 Q 300 500 600 200 T 1100 200"
        stroke={COLORS.electricPurple}
        strokeWidth="1"
        fill="none"
        animate={{
          d: [
            "M -100 200 Q 300 500 600 200 T 1100 200",
            "M -100 200 Q 300 -100 600 200 T 1100 200",
            "M -100 200 Q 300 500 600 200 T 1100 200",
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 1 }}
      />
    </svg>
  </div>
);

/**
 * ELEVATED LIGHTNING CURSOR
 */
const LightningCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);
  const [isInput, setIsInput] = React.useState(false);

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest('button, a, [role="button"]'));
      setIsInput(!!target.closest('input, textarea, select'));
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (isInput) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] hidden lg:block"
      style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
    >
      <motion.div
        animate={{
          scale: isClicked ? 0.8 : isHovering ? 1.4 : 1,
          rotate: isHovering ? [0, -3, 3, 0] : [0, 0.5, -0.5, 0],
          x: isHovering ? [0, 1, -1, 0] : 0,
        }}
        transition={{
          rotate: { repeat: Infinity, duration: isHovering ? 0.15 : 2 },
          x: { repeat: Infinity, duration: 0.1 }
        }}
        className="relative"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z" 
            stroke={isHovering ? COLORS.electricCyan : COLORS.electricCyan + "80"} 
            strokeWidth="1.5"
            fill={isClicked ? COLORS.electricYellow : "none"}
            className="transition-colors duration-100"
            style={{ 
              filter: isHovering ? `drop-shadow(0 0 8px ${COLORS.electricCyan}80)` : "none" 
            }}
          />
        </svg>
        <AnimatePresence>
          {isHovering && !isClicked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.1 }}
              className="absolute inset-0"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M11 2L13 4M5 14L3 16M19 10L21 8" stroke={COLORS.electricCyan} strokeWidth="0.5" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {isClicked && (
          <motion.div 
            initial={{ scale: 0.1, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            className="absolute inset-0 rounded-full border-2 border-electric-yellow blur-sm"
            style={{ borderColor: COLORS.electricYellow }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * ZAPPBOT — PERSONAL CFO CHARACTER
 */
const ZappBot = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState(50);
  const [isHovered, setIsHovered] = React.useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const eyeX = useSpring(useTransform(mouseX, [0, 1920], [-2, 2]), { damping: 20 });
  const eyeY = useSpring(useTransform(mouseY, [0, 1080], [-1, 1]), { damping: 20 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-6 w-80 bg-[#101A2E]/95 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl"
            style={{ boxShadow: `${GLOWS.ambient()}, ${GLOWS.soft(COLORS.electricPurple)}` }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-electric-purple rounded-full shadow-[0_0_8px_#B47CFF]" style={{ backgroundColor: COLORS.electricPurple }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Zapp Intelligence</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed font-medium">
                "I've analyzed your recent transactions. It looks like your subscription utility is shifting. Want to review your value score?"
              </p>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <span style={{ color: value < 50 ? COLORS.electricRed : "inherit" }}>Low Value</span>
                  <span style={{ color: value >= 50 ? COLORS.electricGreen : "inherit" }}>High Value</span>
                </div>
                
                <div className="relative group/slider h-10 flex items-center">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={value} 
                    onChange={(e) => setValue(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer outline-none"
                    style={{ 
                      accentColor: value < 50 ? COLORS.electricRed : COLORS.electricGreen,
                    }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 rounded-full blur-md"
                    style={{ 
                      left: `calc(${value}% - 8px)`, 
                      backgroundColor: value < 50 ? COLORS.electricRed : COLORS.electricGreen,
                      boxShadow: `0 0 15px ${value < 50 ? COLORS.electricRed : COLORS.electricGreen}`
                    }}
                  />
                </div>
                
                <div className="text-center text-3xl font-black transition-all" style={{ 
                  color: value < 50 ? COLORS.electricRed : COLORS.electricGreen,
                  textShadow: `0 0 10px ${value < 50 ? COLORS.electricRed : COLORS.electricGreen}80`
                }}>
                  {value}
                </div>
              </div>

              <Button 
                onClick={() => {
                  toast.success("Reflection logged. Your intentional streak continues!", {
                    style: { background: COLORS.bgCard, color: COLORS.electricGreen, border: `1px solid ${COLORS.electricGreen}33` }
                  });
                  setIsOpen(false);
                }}
                className="w-full bg-white/5 hover:bg-white/10 text-white rounded-2xl py-6 font-bold uppercase tracking-widest text-xs border border-white/5 transition-all"
              >
                Log Reflection
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
        animate={{ 
          y: [0, -4, 0],
          rotate: isHovered ? [0, -2, 2, 0] : 0 
        }}
        transition={{ 
          y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 0.2 }
        }}
        className="relative cursor-pointer group"
      >
        <div 
          className="absolute inset-0 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ backgroundColor: COLORS.electricPurple }}
        />
        
        <div className="relative w-20 h-20 bg-[#101A2E] border border-white/10 rounded-full flex items-center justify-center overflow-hidden shadow-2xl">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="transition-all duration-300">
            <path 
              d="M13 2L3 14H12L11 22L21 10H12L13 2Z" 
              stroke={COLORS.electricPurple} 
              strokeWidth="1.5"
              fill={isOpen || isHovered ? COLORS.electricYellow : "none"}
              className="transition-all"
            />
            <path d="M7 16L5 18" stroke={COLORS.electricPurple} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            <path d="M17 10L19 8" stroke={COLORS.electricPurple} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
          </svg>

          <div className="absolute top-[28px] left-[26px] flex gap-2">
            <motion.div 
              style={{ x: eyeX, y: eyeY }}
              className="w-2 h-2 bg-[#0B1220] rounded-full flex items-center justify-center overflow-hidden"
            >
               <motion.div 
                animate={{ scaleY: [1, 0, 1] }} 
                transition={{ repeat: Infinity, duration: 5, times: [0, 0.95, 1] }}
                className="w-full h-full bg-[#0B1220]"
              />
            </motion.div>
            <motion.div 
              style={{ x: eyeX, y: eyeY }}
              className="w-2 h-2 bg-[#0B1220] rounded-full flex items-center justify-center overflow-hidden"
            >
               <motion.div 
                animate={{ scaleY: [1, 0, 1] }} 
                transition={{ repeat: Infinity, duration: 5, times: [0, 0.95, 1] }}
                className="w-full h-full bg-[#0B1220]"
              />
            </motion.div>
          </div>
        </div>

        {!isOpen && !isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-full mr-6 top-1/2 -translate-y-1/2 bg-[#101A2E]/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl whitespace-nowrap"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Need a quick value check?</span>
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#101A2E] border-r border-t border-white/10 rotate-45" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

/**
 * SHADOWY FLUORESCENT CARD
 * Enhanced with Elevation Prop for Command Desk metaphor
 */
const ElectricCard = ({ 
  children, 
  className, 
  delay = 0, 
  semanticColor = COLORS.electricCyan,
  glowIntensity = "soft",
  elevation = 1 // 0: Surface, 1: Standard, 2: Floating
}: { 
  children: React.ReactNode, 
  className?: string, 
  delay?: number,
  semanticColor?: string,
  glowIntensity?: "soft" | "medium" | "strong",
  elevation?: 0 | 1 | 2
}) => {
  const elevationStyles = {
    0: {
      shadow: GLOWS.ambient(0.2),
      y: 0,
      scale: 1
    },
    1: {
      shadow: GLOWS.ambient(0.6),
      y: 0,
      scale: 1
    },
    2: {
      shadow: GLOWS.ambient(0.8),
      y: -8,
      scale: 1.01
    }
  }[elevation];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: elevationStyles.y }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "relative group bg-[#101A2E] rounded-[2.5rem] border border-white/[0.03] p-8 transition-all duration-500",
        className
      )}
      style={{
        boxShadow: `${elevationStyles.shadow}, ${GLOWS.inner}, ${GLOWS[glowIntensity](semanticColor)}`
      }}
      whileHover={{
        y: elevationStyles.y - 4,
        boxShadow: `${GLOWS.ambient(0.8)}, ${GLOWS.inner}, ${GLOWS.medium(semanticColor)}`,
        borderColor: `${semanticColor}20`,
        rotateX: elevation === 2 ? 1 : 0,
        rotateY: elevation === 2 ? 1 : 0
      }}
    >
      {children}
    </motion.div>
  );
};

const ReflectionPulse = ({ active, color = COLORS.electricGreen }: { active: boolean, color?: string }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        initial={{ scale: 0.8, opacity: 0.8 }}
        animate={{ scale: 2.5, opacity: 0 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none rounded-[2.5rem] border-4 z-10"
        style={{ borderColor: color, boxShadow: `0 0 60px ${color}80` }}
      />
    )}
  </AnimatePresence>
);

// --- Page Components ---

const HomeDashboard = () => {
  const [pulseActive, setPulseActive] = React.useState(false);

  const triggerPulse = () => {
    setPulseActive(true);
    setTimeout(() => setPulseActive(false), 1200);
    toast.success("Reflection complete. Streak maintained!", {
      style: { background: COLORS.bgCard, color: COLORS.electricGreen, border: `1px solid ${COLORS.electricGreen}33` }
    });
  };

  return (
    <div className="space-y-12 pb-32 relative z-10">
      {/* Financial Health Snapshot - High Elevation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <ElectricCard className="md:col-span-8 overflow-hidden" semanticColor={COLORS.electricBlue} elevation={2}>
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_#3B82FF]" style={{ backgroundColor: COLORS.electricBlue }} />
                <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">Financial Health</h2>
              </div>
              <div className="text-6xl font-black tracking-tight text-white">$2,450.00</div>
              <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
                <TrendingUp size={16} className="text-electric-green" style={{ color: COLORS.electricGreen }} />
                <span>Monthly spending is 12% more intentional</span>
              </div>
            </div>
            
            <div className="relative group/meter">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/[0.03]" />
                <motion.circle 
                  cx="80" cy="80" r="72" 
                  stroke={COLORS.electricGreen} 
                  strokeWidth="12" 
                  strokeDasharray={452} 
                  initial={{ strokeDashoffset: 452 }}
                  animate={{ strokeDashoffset: 452 * (1 - 0.88) }}
                  transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
                  strokeLinecap="round" 
                  fill="transparent" 
                  style={{ filter: `drop-shadow(0 0 12px ${COLORS.electricGreen}80)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">88</span>
                <span className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Value Score</span>
              </div>
              <div className="absolute inset-0 rounded-full bg-electric-green/5 blur-3xl -z-10 group-hover:bg-electric-green/10 transition-colors" />
            </div>
          </div>

          <div className="h-48 mt-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { n: "1", v: 400 }, { n: "2", v: 380 }, { n: "3", v: 520 }, { n: "4", v: 450 }, { n: "5", v: 600 }, { n: "6", v: 580 }, { n: "7", v: 720 }
              ]}>
                <defs>
                  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.electricBlue} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.electricBlue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="v" 
                  stroke={COLORS.electricBlue} 
                  strokeWidth={4} 
                  fill="url(#areaGlow)" 
                  animationDuration={2500}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: COLORS.bgCard, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px" }} 
                  itemStyle={{ color: COLORS.electricBlue, fontWeight: "900" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ElectricCard>

        <div className="md:col-span-4 flex flex-col gap-8">
          <ElectricCard className="flex-1 flex flex-col justify-center gap-2" semanticColor={COLORS.electricCyan} glowIntensity="soft" elevation={1}>
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5" 
                style={{ backgroundColor: `${COLORS.electricCyan}15`, boxShadow: GLOWS.soft(COLORS.electricCyan) }}
              >
                <TrendingUp size={28} style={{ color: COLORS.electricCyan }} />
              </div>
              <div>
                <div className="text-4xl font-black text-white">12 Days</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Intentional Streak</div>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "85%" }}
                className="h-full rounded-full"
                style={{ backgroundColor: COLORS.electricCyan, boxShadow: `0 0 10px ${COLORS.electricCyan}` }}
              />
            </div>
          </ElectricCard>
          
          <ElectricCard className="flex-1 flex flex-col justify-center gap-2" semanticColor={COLORS.electricRed} elevation={1}>
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5" 
                style={{ backgroundColor: `${COLORS.electricRed}15`, boxShadow: GLOWS.soft(COLORS.electricRed) }}
              >
                <AlertCircle size={28} style={{ color: COLORS.electricRed }} />
              </div>
              <div>
                <div className="text-4xl font-black text-white">3 Alerts</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Spending Alerts</div>
              </div>
            </div>
          </ElectricCard>
        </div>
      </div>

      {/* Breakdown & History - Standard Elevation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <ElectricCard className="lg:col-span-4" semanticColor={COLORS.electricTeal} elevation={1}>
          <div className="flex items-center gap-2 mb-10">
            <Sparkles size={16} style={{ color: COLORS.electricTeal }} />
            <h3 className="text-lg font-black text-white">Category Breakdown</h3>
          </div>
          
          <div className="h-64 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-electric-teal/5 blur-3xl rounded-full" style={{ backgroundColor: `${COLORS.electricTeal}10` }} />
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "High Value", value: 65, color: COLORS.electricGreen },
                    { name: "Regret", value: 15, color: COLORS.electricRed },
                    { name: "Utility", value: 20, color: COLORS.electricBlue },
                  ]}
                  innerRadius={75}
                  outerRadius={95}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {[0, 1, 2].map((i) => (
                    <Cell key={i} fill={[COLORS.electricGreen, COLORS.electricRed, COLORS.electricBlue][i]} style={{ filter: `drop-shadow(0 0 8px ${[COLORS.electricGreen, COLORS.electricRed, COLORS.electricBlue][i]}40)` }} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Status</div>
              <div className="text-xl font-black text-white">Optimized</div>
            </div>
          </div>

          <div className="mt-12 space-y-3">
            {[
              { label: "Intentionality", val: 88, color: COLORS.electricGreen },
              { label: "Regret Risk", val: 12, color: COLORS.electricRed },
              { label: "Utility Focus", val: 74, color: COLORS.electricBlue },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">{stat.label}</span>
                <span className="text-lg font-black" style={{ color: stat.color }}>{stat.val}%</span>
              </div>
            ))}
          </div>
        </ElectricCard>

        <ElectricCard className="lg:col-span-8 overflow-hidden" semanticColor={COLORS.electricGreen} elevation={1}>
          <ReflectionPulse active={pulseActive} />
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black">Recent Spending History</h3>
            <button className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 border-b border-cyan-400/30 pb-1">View Timeline</button>
          </div>
          
          <div className="space-y-4">
            {[
              { id: 1, name: "Specialty Coffee", date: "Today", price: 6.50, score: 32, status: "regret" },
              { id: 2, name: "Cloud Infrastructure", date: "Yesterday", price: 45.00, score: 92, status: "high-value" },
              { id: 3, name: "Mental Health App", date: "2 days ago", price: 12.00, score: 88, status: "high-value" },
              { id: 4, name: "Mechanical Keyboard", date: "4 days ago", price: 159.00, score: 96, status: "high-value" },
            ].map((item) => (
              <div 
                key={item.id} 
                onClick={triggerPulse}
                className="group relative flex items-center justify-between p-6 rounded-[2.5rem] bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-8">
                  <div className={cn(
                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center border transition-all group-hover:scale-110",
                    item.status === "regret" ? "bg-electric-red/10 border-electric-red/20 text-electric-red" : "bg-electric-green/10 border-electric-green/20 text-electric-green"
                  )} style={{ 
                    color: item.status === "regret" ? COLORS.electricRed : COLORS.electricGreen,
                    backgroundColor: item.status === "regret" ? `${COLORS.electricRed}15` : `${COLORS.electricGreen}15`,
                    borderColor: item.status === "regret" ? `${COLORS.electricRed}33` : `${COLORS.electricGreen}33`,
                    boxShadow: item.status === "regret" ? GLOWS.soft(COLORS.electricRed) : GLOWS.soft(COLORS.electricGreen)
                  }}>
                    {item.status === "regret" ? <TrendingDown size={32} /> : <TrendingUp size={32} />}
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight">{item.name}</div>
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-2">{item.date} • ${item.price.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <div className="text-4xl font-black tracking-tighter transition-all" style={{ 
                      color: item.score > 70 ? COLORS.electricGreen : COLORS.electricRed,
                      filter: `drop-shadow(0 0 10px ${item.score > 70 ? COLORS.electricGreen : COLORS.electricRed}80)`
                    }}>{item.score}</div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-600 font-black">Score</div>
                  </div>
                  <ChevronRight size={24} className="text-gray-800 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </ElectricCard>
      </div>
    </div>
  );
};

const BuyAdvisorModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = React.useState<"input" | "loading" | "result">("input");
  
  const handleAnalyze = () => {
    setStep("loading");
    setTimeout(() => setStep("result"), 2800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0B1220]/90 backdrop-blur-2xl"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-[#101A2E] border border-cyan-500/30 rounded-[3.5rem] p-12 shadow-2xl overflow-hidden"
        style={{ boxShadow: `${GLOWS.ambient()}, ${GLOWS.strong(COLORS.electricCyan)}` }}
      >
        <div className="absolute top-0 right-0 p-10">
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>

        {step === "input" && (
          <div className="space-y-10">
            <div className="flex items-center gap-6">
              <div 
                className="p-5 rounded-[1.5rem] border border-cyan-500/30"
                style={{ backgroundColor: `${COLORS.electricCyan}10`, boxShadow: GLOWS.medium(COLORS.electricCyan) }}
              >
                <Zap size={40} style={{ color: COLORS.electricCyan }} />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tighter">Buy Advisor</h2>
                <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 font-black mt-1">Pre-Purchase Intelligence</div>
              </div>
            </div>
            
            <p className="text-xl text-gray-400 leading-relaxed font-medium">
              "Tell me what you're thinking of spending. I'll access your past satisfaction data to see if this aligns with your long-term values."
            </p>
            
            <div className="space-y-8">
              <div className="group p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 flex flex-col items-center justify-center border-dashed cursor-pointer hover:bg-white/[0.05] hover:border-cyan-500/50 transition-all">
                <Camera size={48} className="text-gray-600 mb-6 group-hover:text-cyan-400 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Scan Product or Receipt</span>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-black">Predicted Price</label>
                  <input type="text" placeholder="$0.00" className="w-full bg-[#0B1220] border border-white/10 rounded-2xl px-8 py-5 text-xl font-black outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-800" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-black">Target Category</label>
                  <select className="w-full bg-[#0B1220] border border-white/10 rounded-2xl px-8 py-5 text-xl font-black outline-none focus:border-cyan-500/50 appearance-none cursor-pointer">
                    <option>Lifestyle</option>
                    <option>Utility</option>
                    <option>Experience</option>
                  </select>
                </div>
              </div>
            </div>
            
            <Button onClick={handleAnalyze} className="w-full bg-cyan-400 hover:bg-cyan-500 text-[#0B1220] rounded-3xl py-10 text-2xl font-black tracking-tight shadow-2xl transition-all hover:scale-[1.02]">
              Consult My CFO
            </Button>
          </div>
        )}

        {step === "loading" && (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-10">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-40 h-40 border-[8px] border-white/5 border-t-cyan-400 rounded-full"
                style={{ borderTopColor: COLORS.electricCyan }}
              />
              <Zap size={48} style={{ color: COLORS.electricCyan }} className="absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-white">Analyzing Financial Memory...</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Processing satisfaction score</p>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="space-y-12 py-6 text-center">
            <div className="space-y-4">
              <div className="text-[100px] font-black leading-none" style={{ color: COLORS.electricRed, filter: `drop-shadow(0 0 30px ${COLORS.electricRed}80)` }}>72</div>
              <div className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-black">Personalized Value Fit</div>
            </div>
            
            <div 
              className="p-10 rounded-[3rem] border space-y-6 text-left"
              style={{ backgroundColor: `${COLORS.electricRed}05`, borderColor: `${COLORS.electricRed}20` }}
            >
              <div className="flex items-center gap-4">
                <AlertCircle size={24} style={{ color: COLORS.electricRed }} />
                <h4 className="font-black text-2xl text-white">Delay Recommended</h4>
              </div>
              <p className="text-lg text-gray-400 leading-relaxed font-medium">
                "Your history shows 3 similar purchases this month, which ultimately led to a 68% regret score. Delaying this for 24 hours will likely increase your satisfaction."
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <Button variant="outline" className="rounded-3xl py-10 border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-600">Skip</Button>
              <Button className="rounded-3xl py-10 font-black uppercase tracking-widest text-[10px] transition-all" style={{ backgroundColor: `${COLORS.electricRed}15`, border: `1px solid ${COLORS.electricRed}33`, color: COLORS.electricRed }}>Delay 24h</Button>
              <Button className="rounded-3xl py-10 bg-white text-[#0B1220] font-black uppercase tracking-widest text-[10px] hover:bg-gray-100">Buy Now</Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const SubscriptionsPage = () => {
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  const subs = [
    { id: 1, name: "Netflix", cost: 15.99, score: 42, status: "Underused", color: COLORS.electricRed },
    { id: 2, name: "ChatGPT Plus", cost: 20.00, score: 95, status: "Active", color: COLORS.electricGreen },
    { id: 3, name: "Spotify", cost: 9.99, score: 88, status: "Active", color: COLORS.electricGreen },
    { id: 4, name: "AWS Infrastructure", cost: 52.99, score: 91, status: "Optimal", color: COLORS.electricBlue },
  ];

  return (
    <div className="space-y-12 pb-32 relative z-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight">Active Subscriptions</h2>
          <div className="text-gray-500 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" style={{ backgroundColor: COLORS.electricGreen }} />
            Monitoring 12 active connections
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-2xl h-14 px-8 border-white/10 hover:bg-white/5 gap-3 font-black uppercase tracking-widest text-xs">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button className="bg-cyan-500 text-[#0B1220] rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/20" style={{ backgroundColor: COLORS.electricCyan }}>Add Subscription</Button>
        </div>
      </div>

      {/* ABSTRACT WALLET METAPHOR */}
      <div className="relative perspective-[2000px] py-10">
        <motion.div 
          initial={{ rotateX: 20, opacity: 0 }}
          animate={{ rotateX: 5, opacity: 1 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="relative max-w-4xl mx-auto space-y-[-40px]"
        >
          {subs.map((sub, index) => (
            <motion.div
              key={sub.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ 
                y: -60, 
                zIndex: 50,
                rotateX: 0,
                scale: 1.02
              }}
              onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
              className={cn(
                "relative group cursor-pointer transition-all duration-500",
                expandedId === sub.id ? "z-[60] !translate-y-[-100px]" : `z-[${10 - index}]`
              )}
            >
              <div 
                className="bg-[#101A2E] rounded-[2rem] border border-white/5 p-8 shadow-2xl flex items-center justify-between"
                style={{ 
                  boxShadow: `${GLOWS.ambient(0.4)}, ${GLOWS.inner}, ${GLOWS.soft(sub.color)}`,
                  borderColor: `${sub.color}20`
                }}
              >
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/[0.02] border border-white/5">
                    <CreditCard size={32} style={{ color: sub.color }} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white">{sub.name}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{sub.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-16">
                  <div className="text-center">
                    <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Cost</div>
                    <div className="text-2xl font-black text-white">${sub.cost.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Value</div>
                    <div className="text-3xl font-black" style={{ color: sub.color, filter: `drop-shadow(0 0 8px ${sub.color}60)` }}>{sub.score}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
                      <TrendingUp size={20} />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded-xl text-gray-500 hover:text-red-400 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === sub.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8"
                  >
                    <div className="grid grid-cols-3 gap-8">
                      <div>
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Usage Insight</div>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium">You've accessed this service 4 times this month. Cost per use: ${(sub.cost / 4).toFixed(2)}.</p>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Value Trend</div>
                        <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
                      </div>
                      <div className="flex items-center justify-end">
                        <Button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl px-8 py-4 text-xs font-black uppercase tracking-widest">Cancel Service</Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const AnalyticsPage = () => (
  <div className="space-y-12 pb-32 relative z-10">
    {/* LEDGER / STACK METAPHOR */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
      <div className="lg:col-span-8 space-y-8">
        <ElectricCard semanticColor={COLORS.electricBlue} className="relative z-20">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">Utility Overlap Analysis</h3>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black mt-2">Subscription Stacking</div>
            </div>
          </div>
          <div className="space-y-14 px-4">
            {[
              { name: "Development Tools", val: 85, color: COLORS.electricGreen, sub: "Essential Utility" },
              { name: "Content Streaming", val: 32, color: COLORS.electricRed, sub: "High Overlap Risk" },
              { name: "Lifestyle Apps", val: 58, color: COLORS.electricBlue, sub: "Healthy Engagement" },
            ].map((bar, i) => (
              <div key={i} className="space-y-5">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-2xl font-black text-white tracking-tight">{bar.name}</div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{bar.sub}</div>
                  </div>
                  <div className="text-4xl font-black" style={{ color: bar.color, filter: `drop-shadow(0 0 10px ${bar.color}60)` }}>{bar.val}%</div>
                </div>
                <div className="h-5 bg-white/[0.03] rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.val}%` }}
                    transition={{ duration: 2, delay: i * 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: bar.color, boxShadow: `0 0 25px ${bar.color}` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ElectricCard>

        {/* Layered Plane Metaphor */}
        <div className="relative h-[400px]">
          <ElectricCard semanticColor={COLORS.electricCyan} className="absolute inset-0 z-10 translate-y-8 translate-x-4 opacity-40 grayscale pointer-events-none" elevation={0}>
             <div className="h-40" />
          </ElectricCard>
          <ElectricCard semanticColor={COLORS.electricCyan} className="absolute inset-0 z-30">
            <h3 className="text-2xl font-black mb-10 tracking-tight">Transaction History</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group flex items-center justify-between p-6 hover:bg-white/[0.02] rounded-[2.5rem] transition-all cursor-pointer border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-8">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_12px_#22F0FF]" style={{ backgroundColor: COLORS.electricCyan }} />
                    <span className="text-xl font-black text-gray-200 group-hover:text-cyan-400 transition-colors tracking-tight">AWS Infrastructure</span>
                  </div>
                  <div className="flex items-center gap-12">
                    <span className="text-2xl font-black text-white">$12.45</span>
                    <ChevronRight size={20} className="text-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          </ElectricCard>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-8">
        <div className="flex items-center gap-2 px-6">
          <div className="w-1.5 h-1.5 bg-electric-purple rounded-full" style={{ backgroundColor: COLORS.electricPurple }} />
          <h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-600 font-black">Zapp CFO Intelligence</h3>
        </div>
        
        <ElectricCard className="p-10 border-l-4" style={{ borderLeftColor: COLORS.electricGreen }} semanticColor={COLORS.electricGreen} elevation={1}>
          <div className="flex items-center gap-5 mb-8">
            <div className="p-4 rounded-2xl" style={{ backgroundColor: `${COLORS.electricGreen}10` }}>
              <TrendingUp size={28} style={{ color: COLORS.electricGreen }} />
            </div>
            <h4 className="font-black text-2xl tracking-tight">Efficiency Insight</h4>
          </div>
          <p className="text-lg text-gray-400 leading-relaxed font-medium">
            "Your ChatGPT Plus usage has reached <span className="text-white font-black">$0.14/query</span>. This aligns perfectly with your goals."
          </p>
        </ElectricCard>

        <ElectricCard className="p-10 border-l-4" style={{ borderLeftColor: COLORS.electricRed }} semanticColor={COLORS.electricRed} elevation={1}>
          <div className="flex items-center gap-5 mb-8">
            <div className="p-4 rounded-2xl" style={{ backgroundColor: `${COLORS.electricRed}10` }}>
              <ZapOff size={28} style={{ color: COLORS.electricRed }} />
            </div>
            <h4 className="font-black text-2xl tracking-tight">Low Value Item</h4>
          </div>
          <p className="text-lg text-gray-400 leading-relaxed font-medium">
            "Your Disney+ utility has dropped 80% this month. Cost per hour is now <span className="text-white font-black">$12.40</span>."
          </p>
        </ElectricCard>
      </div>
    </div>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [activePage, setActivePage] = React.useState<Page>("home");
  const [isBuyAdvisorOpen, setIsBuyAdvisorOpen] = React.useState(false);

  const activeColor = {
    home: COLORS.electricGreen,
    subscriptions: COLORS.electricBlue,
    analytics: COLORS.electricCyan,
    search: COLORS.electricTeal
  }[activePage];

  return (
    <div className="min-h-screen bg-[#0B1220] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 cursor-none relative overflow-x-hidden">
      <Toaster position="top-center" theme="dark" richColors />
      <LightningCursor />
      <AmbientEnergyLines />
      
      <motion.div 
        animate={{ backgroundColor: activeColor }}
        transition={{ duration: 1.5 }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 blur-[100px] opacity-20 pointer-events-none z-0"
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1220]/60 backdrop-blur-3xl border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-12 h-24 flex items-center justify-between">
          <div className="flex items-center gap-16">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActivePage("home")}>
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-60 transition-all" 
                  style={{ backgroundColor: COLORS.electricCyan }}
                />
                <div className="relative w-5 h-5 bg-electric-cyan rounded-full shadow-[0_0_20px_#22F0FF]" style={{ backgroundColor: COLORS.electricCyan }} />
              </div>
              <span className="text-4xl font-black tracking-tighter uppercase italic group-hover:text-cyan-400 transition-colors">Zapp</span>
            </div>
            
            <div className="hidden lg:flex items-center gap-4">
              {[
                { id: "home", label: "Dashboard", icon: Home },
                { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
                { id: "analytics", label: "Analytics", icon: BarChart2 },
                { id: "search", label: "Search", icon: Search },
              ].map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button 
                    key={item.id}
                    onClick={() => setActivePage(item.id as Page)}
                    className={cn(
                      "relative flex items-center gap-3 px-8 py-3 rounded-2xl transition-all font-black uppercase tracking-[0.3em] text-[10px]",
                      isActive ? "text-white" : "text-gray-600 hover:text-gray-300"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="nav-bg"
                        className="absolute inset-0 bg-white/[0.05] rounded-2xl border border-white/10"
                      />
                    )}
                    <item.icon className={cn("w-4 h-4 transition-colors relative z-10", isActive ? "text-cyan-400 drop-shadow-[0_0_12px_#22F0FF]" : "text-gray-600")} />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 pl-4 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Alex Chen</div>
                <div className="text-[9px] font-black text-cyan-500 uppercase">Intentional Tier</div>
              </div>
              <div 
                className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-electric-cyan to-electric-blue border border-white/20 cursor-pointer hover:scale-105 transition-all shadow-2xl" 
                style={{ backgroundImage: `linear-gradient(to bottom right, ${COLORS.electricCyan}, ${COLORS.electricBlue})` }}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-12 pt-44 min-h-screen relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -15 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {activePage === "home" && <HomeDashboard />}
            {activePage === "subscriptions" && <SubscriptionsPage />}
            {activePage === "analytics" && <AnalyticsPage />}
            {activePage === "search" && (
              <div className="max-w-5xl mx-auto space-y-20 py-10">
                <div className="text-center space-y-6">
                  <h2 className="text-6xl font-black tracking-tighter text-white">Decision Engine</h2>
                  <p className="text-gray-500 text-2xl font-medium max-w-2xl mx-auto">Analyze spending decisions before you commit. Access your personalized value data.</p>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                    <Search size={40} className="text-gray-800 group-focus-within:text-cyan-400 transition-all drop-shadow-[0_0_20px_#22F0FF20]" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search for product or service..." 
                    className="w-full bg-[#101A2E]/60 backdrop-blur-3xl border-2 border-white/5 rounded-[4rem] pl-28 pr-12 py-14 text-4xl font-black text-white outline-none focus:border-cyan-500/20 focus:shadow-[0_0_100px_rgba(34,240,255,0.05)] transition-all placeholder:text-gray-800"
                  />
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <button className="bg-cyan-400 text-[#0B1220] px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all">Evaluate</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <ElectricCard semanticColor={COLORS.electricGreen} className="p-12" elevation={1}>
                    <div className="flex items-center gap-5 mb-10">
                      <Zap size={32} style={{ color: COLORS.electricGreen }} />
                      <h4 className="font-black text-2xl tracking-tight">Predicted Optimal Fit</h4>
                    </div>
                    <div className="space-y-6">
                      {[
                        { n: "Mechanical Keyboard", s: 96, c: COLORS.electricGreen },
                        { n: "AWS Infrastructure", s: 89, c: COLORS.electricGreen },
                        { n: "Productivity Suite", s: 92, c: COLORS.electricGreen },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-electric-green transition-all" style={{ borderColor: `${item.c}10` }}>
                          <span className="font-black text-xl text-gray-300">{item.n}</span>
                          <span className="font-black text-3xl" style={{ color: item.c, filter: `drop-shadow(0 0 10px ${item.c}60)` }}>{item.s}</span>
                        </div>
                      ))}
                    </div>
                  </ElectricCard>

                  <ElectricCard semanticColor={COLORS.electricRed} className="p-12" elevation={1}>
                    <div className="flex items-center gap-5 mb-10">
                      <TrendingDown size={32} style={{ color: COLORS.electricRed }} />
                      <h4 className="font-black text-2xl tracking-tight">High Regret Risk</h4>
                    </div>
                    <div className="space-y-6">
                      {[
                        { n: "Food Delivery", s: 12, c: COLORS.electricRed },
                        { n: "Impulse Purchase", s: 31, c: COLORS.electricRed },
                        { n: "Micro-subscriptions", s: 24, c: COLORS.electricRed },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-electric-red transition-all" style={{ borderColor: `${item.c}10` }}>
                          <span className="font-black text-xl text-gray-300">{item.n}</span>
                          <span className="font-black text-3xl" style={{ color: item.c, filter: `drop-shadow(0 0 10px ${item.c}60)` }}>{item.s}</span>
                        </div>
                      ))}
                    </div>
                  </ElectricCard>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed bottom-10 left-10 z-[100]">
        <motion.button 
          whileHover={{ scale: 1.1, boxShadow: GLOWS.soft(COLORS.electricCyan) }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsBuyAdvisorOpen(true)}
          className="w-14 h-14 bg-[#101A2E] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-2xl"
        >
          <Camera size={24} />
        </motion.button>
      </div>

      <ZappBot />
      <BuyAdvisorModal isOpen={isBuyAdvisorOpen} onClose={() => setIsBuyAdvisorOpen(false)} />
    </div>
  );
}
