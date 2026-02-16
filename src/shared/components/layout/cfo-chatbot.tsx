import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "../ui/button";

export function CfoChatbot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState(50);

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      <div className="relative">
        {/* Chatbot Character */}
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative cursor-pointer group"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Lightning Bolt Body */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-full h-full text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] fill-[#0B1220]">
              <path 
                fill="currentColor" 
                stroke="currentColor" 
                strokeWidth="1.5"
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" 
              />
              {/* Eyes */}
              <circle cx="9" cy="11" r="1.5" fill="#0B1220" />
              <circle cx="14" cy="11" r="1.5" fill="#0B1220" />
            </svg>
            
            {/* Expressive Eyes Overlay for blinking */}
            <motion.div 
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.95, 1] }}
              className="absolute top-[42%] left-[35%] w-1.5 h-1.5 bg-cyan-900 rounded-full"
            />
            <motion.div 
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.95, 1] }}
              className="absolute top-[42%] left-[55%] w-1.5 h-1.5 bg-cyan-900 rounded-full"
            />
          </div>

          {/* Prompt Bubble */}
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap bg-cyan-500 text-[#0B1220] px-4 py-2 rounded-2xl text-xs font-bold shadow-lg"
              >
                How can I help you today?
                <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-500 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-20 right-0 w-80 bg-[#0F172A]/90 backdrop-blur-2xl border border-cyan-500/20 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_#4ade80]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Zapp Assistant</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 p-4 rounded-2xl text-sm leading-relaxed border border-white/5">
                  Hey! How did that last coffee purchase feel? Was it high value or just a quick fix?
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <span>Low Value</span>
                    <span>High Value</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={value} 
                    onChange={(e) => setValue(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="text-center text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                    {value}
                  </div>
                </div>

                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-[#0B1220] font-bold rounded-xl py-6">
                  Log Reflection
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
