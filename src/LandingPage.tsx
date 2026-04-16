import * as React from "react";
import { motion } from "motion/react";
import { ArrowRight, Camera, Upload } from "lucide-react";
import { toast } from "sonner";

import { submitWaitlistSignup } from "@/api/waitlist.api";
import { ElectricCard } from "@/features/home";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { COLORS, GLOWS } from "@/shared/theme";

const demoScore = 34;

function getScoreState(score: number) {
  if (score < 40) {
    return {
      accent: "#FF7B7B",
      soft: "rgba(255, 123, 123, 0.11)",
      border: "rgba(255, 123, 123, 0.18)",
      response: "Skip this purchase.",
    };
  }

  if (score <= 70) {
    return {
      accent: COLORS.electricBlue,
      soft: "rgba(59, 130, 255, 0.12)",
      border: "rgba(59, 130, 255, 0.18)",
      response: "Think twice before buying.",
    };
  }

  return {
    accent: COLORS.electricGreen,
    soft: "rgba(60, 255, 158, 0.12)",
    border: "rgba(60, 255, 158, 0.18)",
    response: "High value for you.",
  };
}

function WaitlistForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Please add your name.");
      return;
    }

    if (!email.trim()) {
      toast.error("Please add your email.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitWaitlistSignup({
        name: name.trim(),
        email: email.trim(),
        source: "landing_page",
      });

      toast.success(response.created ? "You're on the waitlist." : "You're already on the waitlist.");
      setName("");
      setEmail("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3.5 text-left">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
          Name
        </Label>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          placeholder="Enter your name"
          className="h-11 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-gray-600"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
          Email
        </Label>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="Enter your email"
          className="h-11 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-gray-600"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="mt-1 h-11 w-full rounded-2xl border-0 text-[11px] font-black uppercase tracking-[0.22em] text-[#08111E] transition-all duration-300 hover:scale-[1.01]"
        style={{
          backgroundColor: COLORS.electricCyan,
          boxShadow: `0 0 0 1px rgba(34,240,255,0.1), ${GLOWS.soft(COLORS.electricCyan)}`,
        }}
      >
        {submitting ? "Joining..." : "Join the Waitlist"}
        <ArrowRight size={15} />
      </Button>
    </form>
  );
}

function ProductDemoCard() {
  const scoreState = getScoreState(demoScore);

  return (
    <ElectricCard
      semanticColor={scoreState.accent}
      elevation={1}
      className="w-full max-w-3xl border border-white/6 bg-[#101A2E]/92 p-5 text-left sm:p-6"
    >
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/58">
            Product Demo
          </p>
          <h2 className="mt-1 text-[1.4rem] font-black tracking-[-0.04em] text-white sm:text-[1.55rem]">
            Check before you buy.
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-[1.5rem] border border-white/6 bg-[#0B1220] px-4 py-4">
            <div className="flex items-start gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/6"
                style={{ backgroundColor: `${COLORS.electricBlue}14` }}
              >
                <Camera size={18} style={{ color: COLORS.electricBlue }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                  User Input
                </p>
                <p className="mt-1 text-sm font-medium leading-6 text-gray-200">
                  Snap the item or ask Zapp if it&apos;s worth it.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/6 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-gray-300">
                  <Upload size={13} />
                  Upload a product image
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-[1.5rem] border px-4 py-4"
            style={{
              borderColor: scoreState.border,
              background: `linear-gradient(180deg, ${scoreState.soft}, rgba(11,18,32,0.92))`,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{ color: scoreState.accent }}
                >
                  Result
                </p>
                <p className="mt-1 text-lg font-black tracking-[-0.03em] text-white">
                  {scoreState.response}
                </p>
              </div>

              <div
                className="rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em]"
                style={{
                  borderColor: scoreState.border,
                  backgroundColor: scoreState.soft,
                  color: scoreState.accent,
                }}
              >
                Zapp Score
              </div>
            </div>

            <div className="mt-5 flex items-end gap-3">
              <p className="text-5xl font-black tracking-[-0.07em] text-white">{demoScore}</p>
              <p className="pb-1 text-sm text-gray-300">out of 100</p>
            </div>
          </div>
        </div>
      </div>
    </ElectricCard>
  );
}

const features = [
  {
    title: "ASK BEFORE YOU BUY",
    body: "Get a value score before you spend.",
  },
  {
    title: "SNAP AND DECIDE",
    body: "Take a picture and let Zapp judge it.",
  },
  {
    title: "KEEP IT SIMPLE",
    body: "Lower score = lower value. Higher score = better value.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1220] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[-8%] top-[-12%] h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ backgroundColor: `${COLORS.electricBlue}16` }}
        />
        <div
          className="absolute right-[-10%] top-[0%] h-[24rem] w-[24rem] rounded-full blur-3xl"
          style={{ backgroundColor: `${COLORS.electricCyan}12` }}
        />
        <div
          className="absolute bottom-[-12%] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: `${COLORS.electricPurple}10` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_56%)]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-6 px-5 py-14 text-center sm:px-8 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-3"
        >
          <h1 className="text-6xl font-black tracking-[-0.09em] text-white sm:text-7xl lg:text-[5.6rem]">
            Zapp
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-100/60">
            Waitlist Open
          </p>
        </motion.div>

        <div className="space-y-4">
          <h2 className="mx-auto max-w-4xl text-4xl font-black tracking-[-0.065em] text-white sm:text-5xl lg:text-6xl">
            We don&apos;t waste money.
            <br />
            We misjudge value.
          </h2>
          <p className="mx-auto max-w-2xl text-base font-medium leading-7 text-gray-300 sm:text-lg">
            Zapp helps you judge whether something is actually worth buying before you spend.
          </p>
        </div>

        <ElectricCard
          semanticColor={COLORS.electricCyan}
          elevation={1}
          className="w-full max-w-md border border-white/6 bg-[#101A2E]/92 p-4 sm:p-5"
        >
          <WaitlistForm />
        </ElectricCard>

        <ProductDemoCard />

        <div className="grid w-full max-w-4xl gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <ElectricCard
              key={feature.title}
              semanticColor={index === 0 ? COLORS.electricCyan : index === 1 ? COLORS.electricBlue : COLORS.electricPurple}
              elevation={0}
              className="flex min-h-[150px] h-full flex-col gap-3 border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(16,26,46,0.88))] p-5 text-left"
            >
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100/60">
                {feature.title}
              </p>
              <p className="max-w-[18rem] text-sm leading-6 text-gray-300">{feature.body}</p>
            </ElectricCard>
          ))}
        </div>

        <footer className="pt-2 text-center text-sm text-gray-200">
          <p>Zapp © 2026</p>
          <p className="mt-1">
            <span className="font-semibold text-white">Contact:</span> siddhantshankar@zappai.com
          </p>
        </footer>
      </main>
    </div>
  );
}
