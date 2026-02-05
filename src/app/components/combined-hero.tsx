import * as React from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Button } from "./ui/button";
import { ChevronLeft, Home, Zap, Sparkles, TrendingUp, Cpu, Target } from "lucide-react";
import { cn } from "./ui/utils";

export function CombinedHero() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <section className="relative min-h-screen bg-[#0a0e27] text-white overflow-hidden font-sans flex flex-col">
      {/* Background Gradients & Glows (Blend of Navy and Midnight) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#22c55e]/5 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Grid pattern overlay from Slide 1 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f1538_1px,transparent_1px),linear-gradient(to_bottom,#0f1538_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />

      {/* Top Navigation (Layout from Slide 2) */}
      <motion.nav 
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 mx-auto w-full max-w-7xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#22c55e] rounded-full shadow-[0_0_10px_#22c55e]" />
          <span className="font-bold text-xl tracking-tighter">Zapp</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400 bg-[#0f1538]/50 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 shadow-lg shadow-black/20">
          <a href="#" className="hover:text-white transition-colors">Buy Advisor</a>
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Philosophy</a>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <Button className="bg-[#14532d] hover:bg-[#166534] text-[#22c55e] border border-[#22c55e]/30 rounded-xl px-5 h-10 font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.15)]">
            Launch App
          </Button>
        </div>
      </motion.nav>

      {/* Main Content (Text from Slide 1, Layout from Slide 2) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-6xl mx-auto text-center py-32 md:py-40">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0f1538]/80 border border-cyan-500/20 text-[11px] uppercase tracking-[0.2em] text-cyan-400 mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Your Personal CFO
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-8 leading-[0.9] bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent"
        >
          Zapp
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-6 leading-relaxed font-medium"
        >
          Make smarter spending decisions <span className="text-[#22c55e] italic">before you buy</span>
        </motion.p>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Zapp helps you understand what spending actually delivers value — using personalized financial memory, 
          behavior analysis, and pre-purchase intelligence.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-24"
        >
          <Button 
            size="lg" 
            className="bg-[#22c55e] hover:bg-[#16a34a] text-[#0a0e27] rounded-2xl px-10 py-7 text-lg font-bold transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-105"
          >
            Try Buy Advisor
          </Button>
          <Button 
            size="lg" 
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl px-10 py-7 text-lg font-medium transition-all backdrop-blur-md hover:border-cyan-400/50"
          >
            See How It Works
          </Button>
        </motion.div>

        {/* Features Row (The Grid from Layout 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {[
            {
              title: "Pre-purchase Intelligence",
              desc: "Buy Advisor gives you instant feedback on potential spending before the money leaves your wallet.",
              icon: <Zap className="w-5 h-5 text-[#22c55e]" />
            },
            {
              title: "Value-Based Finance",
              desc: "We focus on what actually brings happiness and value, not just tracking every cent.",
              icon: <Target className="w-5 h-5 text-[#22c55e]" />
            },
            {
              title: "Financial Memory",
              desc: "Zapp remembers your past spending regrets so you don't repeat them twice.",
              icon: <Cpu className="w-5 h-5 text-[#22c55e]" />
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              className="group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all cursor-default backdrop-blur-sm"
            >
              <div className="mb-4 p-2 w-fit rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 group-hover:bg-[#22c55e]/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-[#22c55e] transition-colors">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Bottom Nav (Layout 2) */}
      <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-between px-8 pointer-events-none">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0f1538]/60 border border-white/10 backdrop-blur-2xl shadow-2xl"
        >
          <div className="p-1.5 rounded-lg bg-[#22c55e]/20 border border-[#22c55e]/20">
            <Home className="w-4 h-4 text-[#22c55e]" />
          </div>
          <span className="text-sm font-semibold text-white px-1">Overview</span>
        </motion.div>
        
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0f1538]/60 border border-white/10 backdrop-blur-2xl shadow-2xl"
        >
          <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/20">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-sm font-semibold text-white px-1">Stats</span>
        </motion.div>
      </div>
    </section>
  );
}
