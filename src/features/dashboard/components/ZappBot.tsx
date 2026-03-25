import * as React from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { X, Send } from "lucide-react";
import { COLORS, GLOWS, UI_PATTERNS } from "@/shared/theme";
import { cn } from "@/shared/components/ui/utils";
import { createConversation, sendMessage } from "@/api/ai.api";
import { useAuth } from "@/features/auth";
import { usePanelState } from "../context/PanelContext";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export function ZappBot() {
  const promptDisplayMs = 3200;
  const { user } = useAuth();
  const { isRightPanelOpen } = usePanelState();
  const shouldReduceMotion = useReducedMotion();
  const conversationStorageKey = user?.supabaseUid ? `zapp_conversation_id_${user.supabaseUid}` : null;
  const devUsername = user?.username?.trim() ?? "";

  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const [showPrompt, setShowPrompt] = React.useState(true);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Zapp CFO. I've been monitoring your subscriptions. How can I help you optimize your value score today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [conversationId, setConversationId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!conversationStorageKey) {
      setConversationId(null);
      return;
    }
    const saved = localStorage.getItem(conversationStorageKey);
    setConversationId(saved ? Number(saved) : null);
  }, [conversationStorageKey]);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const createConversationPromiseRef = React.useRef<Promise<{ conversation_id: number }> | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const eyeX = useSpring(useTransform(mouseX, [0, 1920], [-2, 2]), { damping: 20 });
  const eyeY = useSpring(useTransform(mouseY, [0, 1080], [-1, 1]), { damping: 20 });

  React.useEffect(() => {
    if (shouldReduceMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, shouldReduceMotion]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  React.useEffect(() => {
    if (isOpen) {
      setShowPrompt(false);
      return;
    }

    const timeout = window.setTimeout(() => setShowPrompt(false), promptDisplayMs);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  const isNotFoundError = (err: unknown) =>
    err instanceof Error &&
    (err.message.includes("404") ||
      err.message.includes("sendMessage failed: 404") ||
      err.message.includes("AI API error: 404"));

  const createFreshConversation = async () => {
    if (!createConversationPromiseRef.current) {
      createConversationPromiseRef.current = createConversation(
        { devUsername },
        { context_type: "general" }
      );
    }
    const created = await createConversationPromiseRef.current;
    const cid = created.conversation_id;
    setConversationId(cid);
    if (conversationStorageKey) {
      localStorage.setItem(conversationStorageKey, String(cid));
    }
    createConversationPromiseRef.current = null;
    return cid;
  };

  const handleSend = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!input.trim() || isTyping) return;

    const prompt = input.trim();
    if (!devUsername) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 3).toString(),
          text: "AI chat is unavailable because no backend username is loaded for this session.",
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: prompt,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      let cid = conversationId;

      if (!cid) {
        cid = await createFreshConversation();
      }

      let resp;
      try {
        resp = await sendMessage({ devUsername }, cid, prompt);
      } catch (err) {
        // Conversation may be stale (deleted/migrated/user-context mismatch). Recreate once and retry.
        if (!isNotFoundError(err)) throw err;
        if (conversationStorageKey) {
          localStorage.removeItem(conversationStorageKey);
        }
        setConversationId(null);
        createConversationPromiseRef.current = null;
        const freshCid = await createFreshConversation();
        resp = await sendMessage({ devUsername }, freshCid, prompt);
      }

      const assistantText =
        resp.assistant_message.content.includes("LLM not connected yet")
          ? "Your message has been stored."
          : resp.assistant_message.content;

      const assistantMsg: Message = {
        id: String(resp.assistant_message.id ?? Date.now() + 1),
        text: assistantText,
        sender: "assistant",
        timestamp: new Date(resp.assistant_message.created_at ?? Date.now()),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      createConversationPromiseRef.current = null;
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: "⚠️ I couldn't reach the AI service. Try again in a moment.",
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      animate={shouldReduceMotion ? undefined : { y: isRightPanelOpen ? 200 : 0, opacity: isRightPanelOpen ? 0 : 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed bottom-10 right-10 z-[100] flex flex-col items-end"
      style={{
        pointerEvents: isRightPanelOpen ? "none" : "auto",
        ...(shouldReduceMotion ? { transform: isRightPanelOpen ? "translateY(200px)" : undefined, opacity: isRightPanelOpen ? 0 : 1 } : {}),
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="app-panel mb-6 flex h-[500px] w-96 flex-col overflow-hidden shadow-2xl"
            style={{ boxShadow: `${GLOWS.ambient(0.8)}, ${GLOWS.soft(COLORS.electricPurple)}` }}
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] p-6">
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 animate-pulse rounded-full"
                  style={{ backgroundColor: COLORS.electricPurple, boxShadow: `0 0 10px ${COLORS.electricPurple}` }}
                />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Zapp CFO</h3>
                  <span className={cn(UI_PATTERNS.eyebrow, "text-[9px]")}>Active Intelligence</span>
                </div>
              </div>
              <button aria-label="Close assistant" onClick={() => setIsOpen(false)} className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-white/5 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6 scrollbar-none">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id}
                  className={cn("flex max-w-[80%] flex-col", msg.sender === "user" ? "ml-auto items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "rounded-2xl p-4 text-sm font-medium leading-relaxed shadow-lg",
                      msg.sender === "user"
                        ? "rounded-br-none text-white"
                        : "rounded-bl-none border border-white/5 bg-white/5 text-gray-200"
                    )}
                    style={msg.sender === "user" ? { backgroundColor: COLORS.electricPurple } : {}}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-2 text-[8px] font-black uppercase tracking-widest text-[var(--app-text-faint)]">
                    {msg.sender === "user" ? "You" : "ZappBot"} • {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex w-20 items-center gap-2 rounded-2xl rounded-bl-none border border-white/5 bg-white/5 p-4">
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="border-t border-white/5 bg-white/[0.02] p-6">
              <div className="group relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your CFO anything..."
                  disabled={isTyping}
                  className="app-input w-full py-4 pr-14 pl-6 text-xs font-bold outline-none transition-all placeholder:text-gray-700 focus:border-purple-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                />
                <button
                  aria-label="Send message"
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="app-button absolute top-1/2 right-2 -translate-y-1/2 rounded-xl p-2.5 text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:grayscale disabled:opacity-50"
                  style={{ backgroundColor: COLORS.electricPurple }}
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <AnimatePresence>
          {showPrompt && !isOpen && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, x: 12 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, x: 12 }}
              className="absolute top-1/2 right-full mr-6 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-white/10 bg-[var(--app-surface)]/95 px-4 py-2 backdrop-blur-xl"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Ask a question</span>
              <div className="absolute top-1/2 right-[-4px] h-2 w-2 -translate-y-1/2 rotate-45 border-t border-r border-white/10 bg-[var(--app-surface)]" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div
              data-testid="zappbot-hover-highlight"
              initial={shouldReduceMotion ? false : { scale: 0.92, opacity: 0 }}
              animate={shouldReduceMotion ? undefined : { scale: 1, opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { scale: 0.92, opacity: 0 }}
              className="absolute inset-[-10px] rounded-full"
              style={{
                background: `radial-gradient(circle, ${COLORS.electricPurple}26 0%, transparent 70%)`,
                filter: "blur(12px)",
              }}
            />
          )}
        </AnimatePresence>

        <motion.button
          aria-label="Open Zapp assistant"
          data-hovered={isHovered}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsOpen(true)}
          whileTap={{ scale: 0.95 }}
          className="app-panel relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full shadow-2xl"
          style={{
            boxShadow: isHovered ? `${GLOWS.medium(COLORS.electricPurple)}, ${GLOWS.ambient(0.8)}` : GLOWS.ambient(0.7),
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
              stroke={COLORS.electricPurple}
              strokeWidth="1.5"
              fill={isHovered ? COLORS.electricYellow : "none"}
            />
          </svg>

          <div className="absolute top-[28px] left-[26px] flex gap-2">
            <motion.div style={shouldReduceMotion ? undefined : { x: eyeX, y: eyeY }} className="h-2 w-2 rounded-full bg-[#0B1220]" />
            <motion.div style={shouldReduceMotion ? undefined : { x: eyeX, y: eyeY }} className="h-2 w-2 rounded-full bg-[#0B1220]" />
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
