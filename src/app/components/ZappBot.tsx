import * as React from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { COLORS, GLOWS } from "../theme";

export function ZappBot() {
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
                  <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_#B47CFF]" style={{ backgroundColor: COLORS.electricPurple }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Zapp Intelligence</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed font-medium">
                I've analyzed your recent transactions. It looks like your subscription utility is shifting. Want to review your value score?
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
                    style={{ accentColor: value < 50 ? COLORS.electricRed : COLORS.electricGreen }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 rounded-full blur-md"
                    style={{
                      left: `calc(${value}% - 8px)`,
                      backgroundColor: value < 50 ? COLORS.electricRed : COLORS.electricGreen,
                      boxShadow: `0 0 15px ${value < 50 ? COLORS.electricRed : COLORS.electricGreen}`,
                    }}
                  />
                </div>
                <div
                  className="text-center text-3xl font-black transition-all"
                  style={{
                    color: value < 50 ? COLORS.electricRed : COLORS.electricGreen,
                    textShadow: `0 0 10px ${value < 50 ? COLORS.electricRed : COLORS.electricGreen}80`,
                  }}
                >
                  {value}
                </div>
              </div>
              <Button
                onClick={() => {
                  toast.success("Reflection logged. Your intentional streak continues!", {
                    style: { background: COLORS.bgCard, color: COLORS.electricGreen, border: `1px solid ${COLORS.electricGreen}33` },
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
        animate={{ y: [0, -4, 0], rotate: isHovered ? [0, -2, 2, 0] : 0 }}
        transition={{ y: { repeat: Infinity, duration: 4, ease: "easeInOut" }, rotate: { repeat: Infinity, duration: 0.2 } }}
        className="relative cursor-pointer group"
      >
        <div className="absolute inset-0 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: COLORS.electricPurple }} />
        <div className="relative w-20 h-20 bg-[#101A2E] border border-white/10 rounded-full flex items-center justify-center overflow-hidden shadow-2xl">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="transition-all duration-300">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={COLORS.electricPurple} strokeWidth="1.5" fill={isOpen || isHovered ? COLORS.electricYellow : "none"} className="transition-all" />
            <path d="M7 16L5 18" stroke={COLORS.electricPurple} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            <path d="M17 10L19 8" stroke={COLORS.electricPurple} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
          </svg>
          <div className="absolute top-[28px] left-[26px] flex gap-2">
            <motion.div style={{ x: eyeX, y: eyeY }} className="w-2 h-2 bg-[#0B1220] rounded-full flex items-center justify-center overflow-hidden">
              <motion.div animate={{ scaleY: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 5, times: [0, 0.95, 1] }} className="w-full h-full bg-[#0B1220]" />
            </motion.div>
            <motion.div style={{ x: eyeX, y: eyeY }} className="w-2 h-2 bg-[#0B1220] rounded-full flex items-center justify-center overflow-hidden">
              <motion.div animate={{ scaleY: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 5, times: [0, 0.95, 1] }} className="w-full h-full bg-[#0B1220]" />
            </motion.div>
          </div>
        </div>
        {!isOpen && !isHovered && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="absolute right-full mr-6 top-1/2 -translate-y-1/2 bg-[#101A2E]/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl whitespace-nowrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Need a quick value check?</span>
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#101A2E] border-r border-t border-white/10 rotate-45" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
