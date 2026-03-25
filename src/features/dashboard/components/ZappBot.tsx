import * as React from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { X, Send } from "lucide-react";
import { COLORS, GLOWS } from "@/shared/theme";
import { cn } from "@/shared/components/ui/utils";
import { createConversation, sendMessage } from "@/api/ai.api";
import { useAuth } from "@/features/auth";
import { usePanelContext } from "../context/PanelContext";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export function ZappBot() {
  const { user } = useAuth();
  const { isRightPanelOpen } = usePanelContext();
  const conversationStorageKey = user?.supabaseUid ? `zapp_conversation_id_${user.supabaseUid}` : null;
  const devUsername = user?.username?.trim() ?? "";

  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
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
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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
      animate={{ y: isRightPanelOpen ? 200 : 0, opacity: isRightPanelOpen ? 0 : 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed bottom-10 right-10 z-[100] flex flex-col items-end"
      style={{ pointerEvents: isRightPanelOpen ? "none" : "auto" }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-6 h-[500px] w-96 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#101A2E]/95 shadow-2xl backdrop-blur-3xl flex flex-col"
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
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Active Intelligence</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-white/5 hover:text-white">
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
                  <span className="mt-2 text-[8px] font-black uppercase tracking-widest text-gray-600">
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
                  className="w-full rounded-2xl border border-white/10 bg-[#0B1220] py-4 pr-14 pl-6 text-xs font-bold text-white outline-none transition-all placeholder:text-gray-700 focus:border-purple-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-xl p-2.5 text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:grayscale disabled:opacity-50"
                  style={{ backgroundColor: COLORS.electricPurple }}
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
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
        <div className="absolute inset-0 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40" style={{ backgroundColor: COLORS.electricPurple }} />
        <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-[#101A2E] flex items-center justify-center shadow-2xl">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
              stroke={COLORS.electricPurple}
              strokeWidth="1.5"
              fill={isOpen || isHovered ? COLORS.electricYellow : "none"}
            />
          </svg>

          <div className="absolute top-[28px] left-[26px] flex gap-2">
            <motion.div style={{ x: eyeX, y: eyeY }} className="h-2 w-2 rounded-full bg-[#0B1220]" />
            <motion.div style={{ x: eyeX, y: eyeY }} className="h-2 w-2 rounded-full bg-[#0B1220]" />
          </div>
        </div>

        {!isOpen && !isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-1/2 right-full mr-6 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-white/10 bg-[#101A2E]/80 px-4 py-2 backdrop-blur-xl"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Ask a question</span>
            <div className="absolute top-1/2 right-[-4px] h-2 w-2 -translate-y-1/2 rotate-45 border-t border-r border-white/10 bg-[#101A2E]" />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
