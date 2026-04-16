import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Moon, Play, Sun } from "lucide-react";
import { toast } from "sonner";

import { submitWaitlistSignup } from "@/api/waitlist.api";
import "@/styles/landing.css";

const deckPdfUrl = "/presentation/Zapp_Team358.pdf";
const deckPptxUrl = "/presentation/Zapp_Team358.pptx";
const demoVideoUrl = (import.meta.env.VITE_DEMO_VIDEO_URL as string | undefined)?.trim() ?? "";

type Theme = "dark" | "light";

function toEmbedUrl(url: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    if (parsed.hostname.includes("vimeo.com") && !parsed.hostname.includes("player.")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : url;
    }

    return url;
  } catch {
    return null;
  }
}

function useMotionSafe() {
  const reduced = useReducedMotion();
  return {
    reduced: Boolean(reduced),
    stagger: reduced ? 0 : 0.08,
    duration: reduced ? 0.01 : 0.45,
    spring: reduced
      ? { type: "tween" as const, duration: 0.01 }
      : { type: "spring" as const, stiffness: 360, damping: 30 },
  };
}

function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="animate-zapp-aurora absolute -left-[20%] -top-[30%] h-[70vmin] w-[70vmin] rounded-full opacity-45 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(34,211,238,0.55), transparent 55%)",
        }}
      />
      <div
        className="animate-zapp-aurora-2 absolute -right-[15%] top-[10%] h-[60vmin] w-[60vmin] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(168,85,247,0.5), transparent 55%)",
        }}
      />
      <div
        className="animate-zapp-aurora absolute bottom-[-20%] left-[20%] h-[55vmin] w-[55vmin] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(74,222,128,0.35), transparent 60%)",
        }}
      />

      <div
        className="animate-zapp-grid absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.4] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
          backgroundSize: "220px 220px",
        }}
      />
    </div>
  );
}

function Navbar({
  theme,
  onThemeChange,
}: {
  theme: Theme;
  onThemeChange: (next: Theme) => void;
}) {
  const { reduced, duration } = useMotionSafe();

  return (
    <motion.header
      initial={reduced ? false : { y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-[var(--z-border)] bg-[color-mix(in_oklab,var(--z-canvas)_82%,transparent)] backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
        <a href="#top" className="flex items-center gap-3 self-start">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--z-border)] bg-[var(--z-surface)] shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)]">
            <span className="text-sm font-black tracking-tight text-gradient-electric">Z</span>
          </span>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-[var(--z-fg)]">Zapp</p>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--z-fg-muted)]">
              Product preview
            </p>
          </div>
        </a>

        <nav className="flex flex-wrap items-center justify-center gap-1 sm:justify-end md:flex-1">
          <a className="zapp-nav-link" href="#waitlist">
            Join waitlist
          </a>
          <a className="zapp-nav-link" href="#deck">
            View deck
          </a>
          <a className="zapp-nav-link" href="#demo">
            Watch demo
          </a>
        </nav>

        <button
          type="button"
          onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
          className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--z-border)] bg-[var(--z-surface)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--z-fg-muted)] transition hover:border-[var(--z-border-strong)] hover:text-[var(--z-fg)] md:self-auto"
          aria-pressed={theme === "light"}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </motion.header>
  );
}

function Hero() {
  const { reduced, stagger, spring } = useMotionSafe();

  const container = {
    hidden: { opacity: reduced ? 1 : 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: reduced ? 0 : 0.06 },
    },
  };

  const item = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: spring,
    },
  };

  return (
    <section id="top" className="relative px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-4xl text-center"
      >
        <motion.p
          variants={item}
          className="mb-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--z-fg-muted)]"
        >
          Product preview
        </motion.p>

        <motion.h1
          variants={item}
          className="mb-6 text-balance text-[2rem] font-black leading-[1.08] tracking-tight text-[var(--z-fg)] sm:text-5xl md:text-6xl md:leading-[1.05]"
        >
          <span className="block sm:inline">Zapp</span>
          <span className="text-[var(--z-fg-muted)] sm:mx-1">—</span>{" "}
          <span className="text-gradient-electric">Your personal CFO</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mb-10 max-w-2xl text-pretty text-base leading-relaxed text-[var(--z-fg-muted)] md:text-lg"
        >
          Take the guesswork out of money management. See the full picture, get plain-English
          guidance, and make better spending decisions before the money leaves your account.
        </motion.p>

        <motion.div variants={item} className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <a href="#waitlist" className="zapp-btn-primary">
            Join waitlist
          </a>
          <a href="#demo" className="zapp-btn-ghost">
            Watch demo
          </a>
          <a href="#deck" className="zapp-btn-ghost">
            View deck
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

function MediaSection() {
  const { reduced, stagger, spring } = useMotionSafe();
  const embedSrc = toEmbedUrl(demoVideoUrl);

  const container = {
    hidden: { opacity: reduced ? 1 : 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: stagger },
    },
  };

  const card = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: spring },
  };

  return (
    <section id="media" className="scroll-mt-24 px-5 pb-20 md:px-8" aria-labelledby="media-heading">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-center"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--z-fg-muted)]">
            Demo display
          </p>
          <h2 id="media-heading" className="text-3xl font-extrabold tracking-tight text-[var(--z-fg)] md:text-4xl">
            Deck & video
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <motion.article
            variants={card}
            id="deck"
            className="zapp-glass zapp-glow-subtle scroll-mt-28 relative rounded-[2rem] p-8 md:p-10"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400/90">
                  Deck
                </p>
                <h3 className="text-xl font-bold text-[var(--z-fg)]">View deck</h3>
                <p className="mt-2 text-sm text-[var(--z-fg-muted)]">
                  Review the current Zapp deck in-page or open the source files directly.
                </p>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--z-border)] bg-[var(--z-input-bg)] text-cyan-300 shadow-[0_0_28px_-6px_rgba(34,211,238,0.45)]">
                <span className="text-xs font-black uppercase tracking-[0.16em]">PDF</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--z-border)] bg-[var(--z-input-bg)] shadow-inner">
              <iframe
                title="Presentation deck (PDF)"
                src={deckPdfUrl}
                className="h-[min(58vh,560px)] w-full border-0 bg-white/5"
              />
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
              <a href={deckPdfUrl} target="_blank" rel="noopener noreferrer" className="zapp-link-secondary">
                Open PDF in new tab
              </a>
              <a href={deckPptxUrl} target="_blank" rel="noopener noreferrer" className="zapp-link-secondary">
                Download PowerPoint
              </a>
            </div>
          </motion.article>

          <motion.article
            variants={card}
            id="demo"
            className="zapp-glass zapp-glow scroll-mt-28 relative overflow-hidden rounded-[2rem] p-8 md:p-10"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-violet-300/90">
                  Video
                </p>
                <h3 className="text-xl font-bold text-[var(--z-fg)]">Watch demo</h3>
                <p className="mt-2 text-sm text-[var(--z-fg-muted)]">
                  Quick walkthrough of how Zapp helps users make clearer financial decisions.
                </p>
              </div>
              <span className="rounded-full border border-[var(--z-border)] bg-[var(--z-input-bg)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--z-fg-muted)]">
                ~1 min
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--z-border)] bg-black/30 shadow-inner">
              {embedSrc ? (
                <div className="aspect-video w-full">
                  <iframe
                    title="Product demo video"
                    src={embedSrc}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <motion.div
                  className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/80 px-6 text-center"
                  initial={false}
                  whileHover={reduced ? undefined : { scale: 1.01 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute left-1/4 top-1/4 h-40 w-40 rounded-full bg-cyan-500/30 blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 h-36 w-36 rounded-full bg-violet-500/30 blur-3xl" />
                  </div>
                  <Play className="relative z-10 h-14 w-14 text-cyan-300 drop-shadow-[0_0_24px_rgba(34,211,238,0.55)]" />
                  <p className="relative z-10 text-sm font-semibold text-[var(--z-fg)]">
                    Demo video placeholder
                  </p>
                  <p className="relative z-10 max-w-xs text-xs text-[var(--z-fg-muted)]">
                    Add <code className="rounded bg-white/5 px-1.5 py-0.5 text-[11px]">VITE_DEMO_VIDEO_URL</code> to
                    embed the latest walkthrough here.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}

function WaitlistSection() {
  const { reduced, stagger, spring } = useMotionSafe();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">("idle");

  const container = {
    hidden: { opacity: reduced ? 1 : 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: stagger },
    },
  };

  const row = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: spring },
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email";

    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("loading");

    try {
      const response = await submitWaitlistSignup({
        name: name.trim(),
        email: email.trim(),
        source: "landing_page",
      });
      toast.success(response.created ? "You're on the waitlist." : "You're already on the waitlist.");
      setName("");
      setEmail("");
      setStatus("success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again in a moment.";
      toast.error(message);
      setStatus("idle");
    }
  }

  return (
    <section id="waitlist" className="scroll-mt-24 px-5 pb-24 md:px-8" aria-labelledby="waitlist-heading">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-center"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--z-fg-muted)]">
            Early access
          </p>
          <h2 id="waitlist-heading" className="text-3xl font-extrabold tracking-tight text-[var(--z-fg)] md:text-4xl">
            Join the waitlist
          </h2>
          <p className="mt-3 text-[var(--z-fg-muted)]">
            We&apos;ll reach out when spots open. No spam.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="zapp-glass zapp-glow-subtle rounded-[2rem] p-8 md:p-10"
        >
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <motion.div variants={row}>
              <label htmlFor="wl-name" className="zapp-label">
                Full name
              </label>
              <input
                id="wl-name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="zapp-input"
                placeholder="Alex Rivera"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "err-name" : undefined}
              />
              {errors.name && (
                <p id="err-name" className="mt-1.5 text-xs text-rose-400">
                  {errors.name}
                </p>
              )}
            </motion.div>

            <motion.div variants={row}>
              <label htmlFor="wl-email" className="zapp-label">
                Email
              </label>
              <input
                id="wl-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="zapp-input"
                placeholder="you@company.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "err-email" : undefined}
              />
              {errors.email && (
                <p id="err-email" className="mt-1.5 text-xs text-rose-400">
                  {errors.email}
                </p>
              )}
            </motion.div>

            <motion.div variants={row} className="pt-2">
              <motion.button
                type="submit"
                disabled={status === "loading"}
                className="zapp-submit w-full disabled:cursor-not-allowed disabled:opacity-60"
                whileTap={status === "loading" || reduced ? undefined : { scale: 0.985 }}
              >
                {status === "loading" ? "Sending…" : "Request access"}
              </motion.button>
            </motion.div>
          </form>

          {status === "success" && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center text-sm font-medium text-emerald-400/95"
            >
              Thanks — you&apos;re on the list. We&apos;ll be in touch soon.
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [theme, setTheme] = React.useState<Theme>("dark");

  React.useEffect(() => {
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return (
    <div className="zapp-landing-shell relative min-h-dvh font-sans antialiased" data-theme={theme}>
      <PageBackground />
      <Navbar theme={theme} onThemeChange={setTheme} />
      <main>
        <Hero />
        <MediaSection />
        <WaitlistSection />
      </main>
      <footer className="border-t border-[var(--z-border)] px-5 py-10 text-center text-xs text-[var(--z-fg-muted)] md:px-8">
        <p className="font-medium uppercase tracking-[0.2em]">Zapp · Demo display</p>
      </footer>
    </div>
  );
}
