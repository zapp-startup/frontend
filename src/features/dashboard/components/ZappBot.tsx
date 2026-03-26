import * as React from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import { Send, X, Zap } from "lucide-react";
import { COLORS, GLOWS } from "@/shared/theme";
import { cn } from "@/shared/components/ui/utils";
import {
  AppButton,
  AppInput,
  IconBadge,
  StatusChip,
  Surface,
} from "@/shared/components/system";
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
  const conversationStorageKey = user?.supabaseUid
    ? `zapp_conversation_id_${user.supabaseUid}`
    : null;
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
  const createConversationPromiseRef = React.useRef<
    Promise<{ conversation_id: number }> | null
  >(null);

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
        if (!isNotFoundError(err)) throw err;
        if (conversationStorageKey) {
          localStorage.removeItem(conversationStorageKey);
        }
        setConversationId(null);
        createConversationPromiseRef.current = null;
        const freshCid = await createFreshConversation();
        resp = await sendMessage({ devUsername }, freshCid, prompt);
      }

      const assistantText = resp.assistant_message.content.includes(
        "LLM not connected yet"
      )
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
          text: "I couldn't reach the AI service. Try again in a moment.",
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
      animate={
        shouldReduceMotion
          ? undefined
          : { y: isRightPanelOpen ? 160 : 0, opacity: isRightPanelOpen ? 0 : 1 }
      }
      transition={{ type: "spring", damping: 26, stiffness: 220 }}
      className="fixed right-6 bottom-6 z-[100] flex flex-col items-end gap-4 sm:right-10 sm:bottom-10"
      style={{
        pointerEvents: isRightPanelOpen ? "none" : "auto",
        ...(shouldReduceMotion
          ? {
              transform: isRightPanelOpen ? "translateY(160px)" : undefined,
              opacity: isRightPanelOpen ? 0 : 1,
            }
          : {}),
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, scale: 0.97, y: 12, transformOrigin: "bottom right" }
            }
            animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.97, y: 12 }}
            className="w-full max-w-[min(24rem,calc(100vw-2rem))] sm:w-96"
          >
            <Surface
              variant="overlay"
              className="flex h-[32rem] flex-col overflow-hidden border-[color:color-mix(in_srgb,var(--app-accent-purple-soft)_20%,transparent)]"
              style={{ boxShadow: `${GLOWS.ambient(0.72)}, ${GLOWS.soft(COLORS.electricPurple)}` }}
            >
              <div className="flex items-center justify-between border-b border-[var(--app-color-border-subtle)] px-6 py-5">
                <div className="flex items-center gap-3">
                  <IconBadge tone="purple" size="sm" className="rounded-full">
                    <Zap />
                  </IconBadge>
                  <div className="space-y-1">
                    <div className="app-card-title">Zapp CFO</div>
                    <StatusChip tone="accent" className="px-2.5 py-1 text-[9px] tracking-[0.22em]">
                      Active intelligence
                    </StatusChip>
                  </div>
                </div>
                <AppButton
                  aria-label="Close assistant"
                  type="button"
                  variant="quiet"
                  size="icon"
                  className="size-10 rounded-[var(--app-radius-md)]"
                  onClick={() => setIsOpen(false)}
                >
                  <X />
                </AppButton>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6"
              >
                {messages.map((msg) => (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    key={msg.id}
                    className={cn(
                      "flex max-w-[85%] flex-col gap-2",
                      msg.sender === "user" ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <Surface
                      variant={msg.sender === "user" ? "panel" : "inset"}
                      padding="sm"
                      className={cn(
                        "max-w-full rounded-[1.4rem] text-sm leading-relaxed break-words",
                        msg.sender === "user"
                          ? "rounded-br-md border-[color:color-mix(in_srgb,var(--app-accent-purple-soft)_25%,transparent)] text-[var(--app-color-text-primary)]"
                          : "rounded-bl-md text-[var(--app-color-text-secondary)]"
                      )}
                      style={
                        msg.sender === "user"
                          ? {
                              backgroundColor: "color-mix(in srgb, var(--app-accent-purple-soft) 10%, transparent)",
                              borderColor: "color-mix(in srgb, var(--app-accent-purple-soft) 22%, transparent)",
                            }
                          : undefined
                      }
                    >
                      {msg.text}
                    </Surface>
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--app-color-text-faint)]">
                      {msg.sender === "user" ? "You" : "ZappBot"} •{" "}
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </motion.div>
                ))}

                {isTyping && (
                  <Surface
                    variant="inset"
                    padding="sm"
                    className="flex w-24 items-center gap-2 rounded-[1.4rem] rounded-bl-md"
                  >
                    {[0, 0.16, 0.32].map((delay) => (
                      <motion.div
                        key={delay}
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : { opacity: [0.45, 1, 0.45], y: [0, -2, 0] }
                        }
                        transition={{ repeat: Infinity, duration: 1, delay }}
                        className="size-2 rounded-full bg-[var(--app-color-text-tertiary)]"
                      />
                    ))}
                  </Surface>
                )}
              </div>

              <form
                onSubmit={handleSend}
                className="border-t border-[var(--app-color-border-subtle)] px-5 py-5 sm:px-6"
              >
                <div className="relative">
                  <AppInput
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask your CFO anything..."
                    disabled={isTyping}
                    className="h-14 rounded-[var(--app-radius-panel)] pr-16 text-sm font-semibold"
                  />
                  <AppButton
                    aria-label="Send message"
                    type="submit"
                    variant="primary"
                    size="icon"
                    disabled={!input.trim() || isTyping}
                    className="absolute top-1/2 right-2 size-10 -translate-y-1/2 rounded-full"
                    style={{ backgroundColor: "var(--app-accent-purple-soft)", color: "white" }}
                  >
                    <Send />
                  </AppButton>
                </div>
              </form>
            </Surface>
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
              className="absolute top-1/2 right-full mr-4 -translate-y-1/2"
            >
                <Surface
                  variant="overlay"
                  padding="sm"
                  className="relative whitespace-nowrap border-[color:color-mix(in_srgb,var(--app-accent-purple-soft)_20%,transparent)] px-4 py-2"
                >
                  <span className="app-label text-[var(--app-accent-cyan-soft)]">Ask a question</span>
                  <div className="absolute top-1/2 right-[-5px] size-2.5 -translate-y-1/2 rotate-45 border-t border-r border-[var(--app-color-border-strong)] bg-[var(--app-color-surface-overlay)]" />
                </Surface>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div
              data-testid="zappbot-hover-highlight"
              initial={shouldReduceMotion ? false : { scale: 0.95, opacity: 0 }}
              animate={shouldReduceMotion ? undefined : { scale: 1, opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { scale: 0.95, opacity: 0 }}
              className="absolute inset-[-12px] rounded-full"
              style={{
                background: `radial-gradient(circle, ${COLORS.electricPurple}1f 0%, transparent 70%)`,
                filter: "blur(14px)",
              }}
            />
          )}
        </AnimatePresence>

        <AppButton asChild variant="floating" size="icon">
          <motion.button
            aria-label="Open Zapp assistant"
            data-hovered={isHovered}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsOpen(true)}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-[color:color-mix(in_srgb,var(--app-accent-purple-soft)_20%,transparent)] bg-[var(--app-color-surface-overlay)]"
            style={{
              boxShadow: isHovered
                ? `${GLOWS.medium(COLORS.electricPurple)}, ${GLOWS.ambient(0.72)}`
                : GLOWS.ambient(0.62),
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
          </motion.button>
        </AppButton>
      </div>
    </motion.div>
  );
}
