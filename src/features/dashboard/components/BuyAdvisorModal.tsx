import * as React from "react";
import { motion } from "motion/react";
import { X, Zap, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { COLORS, GLOWS } from "@/shared/theme";

type BuyAdvisorModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function BuyAdvisorModal({ isOpen, onClose }: BuyAdvisorModalProps) {
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
              <div className="p-5 rounded-[1.5rem] border border-cyan-500/30" style={{ backgroundColor: `${COLORS.electricCyan}10`, boxShadow: GLOWS.medium(COLORS.electricCyan) }}>
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
              <div className="text-[100px] font-black leading-none" style={{ color: COLORS.electricRed, filter: `drop-shadow(0 0 30px ${COLORS.electricRed}80)` }}>
                72
              </div>
              <div className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-black">Personalized Value Fit</div>
            </div>
            <div className="p-10 rounded-[3rem] border space-y-6 text-left" style={{ backgroundColor: `${COLORS.electricRed}05`, borderColor: `${COLORS.electricRed}20` }}>
              <div className="flex items-center gap-4">
                <AlertCircle size={24} style={{ color: COLORS.electricRed }} />
                <h4 className="font-black text-2xl text-white">Delay Recommended</h4>
              </div>
              <p className="text-lg text-gray-400 leading-relaxed font-medium">
                "Your history shows 3 similar purchases this month, which ultimately led to a 68% regret score. Delaying this for 24 hours will likely increase your satisfaction."
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <Button variant="outline" className="rounded-3xl py-10 border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-600">
                Skip
              </Button>
              <Button className="rounded-3xl py-10 font-black uppercase tracking-widest text-[10px] transition-all" style={{ backgroundColor: `${COLORS.electricRed}15`, border: `1px solid ${COLORS.electricRed}33`, color: COLORS.electricRed }}>
                Delay 24h
              </Button>
              <Button className="rounded-3xl py-10 bg-white text-[#0B1220] font-black uppercase tracking-widest text-[10px] hover:bg-gray-100">
                Buy Now
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
