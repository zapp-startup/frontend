import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { OnboardingAPI, type OnboardingData } from "@/api/onboarding.api";
import { COLORS, GLOWS } from "@/shared/theme";
import { toast } from "sonner";

const TOTAL_STEPS = 5;

const defaultData: OnboardingData = {
  life_stage: "",
  household_size: null,
  location_zip: "",
  income_range: "",
  monthly_fixed_expenses: null,
  financial_goal: "",
  risk_tolerance: "",
  budget_style: "",
  value_priority_cost: 50,
  value_priority_quality: 50,
  value_priority_sustainability: 50,
  self_report_research_habit: null,
};

function OptionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-6 py-4 rounded-2xl border font-bold text-sm transition-all"
      style={{
        backgroundColor: selected ? `${COLORS.electricCyan}15` : "rgba(255,255,255,0.03)",
        borderColor: selected ? COLORS.electricCyan : "rgba(255,255,255,0.08)",
        color: selected ? COLORS.electricCyan : "#94a3b8",
        boxShadow: selected ? GLOWS.soft(COLORS.electricCyan) : "none",
      }}
    >
      {label}
    </button>
  );
}

function SliderInput({ label, question, value, onChange }: { label: string; question: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">{label}</div>
        <div className="text-white font-bold">{question}</div>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-cyan-400"
        />
        <span className="text-2xl font-black w-12 text-right" style={{ color: COLORS.electricCyan }}>
          {value}
        </span>
      </div>
    </div>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [data, setData] = React.useState<OnboardingData>(defaultData);
  const [submitting, setSubmitting] = React.useState(false);

  const set = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const goNext = () => { setDirection(1); setStep((s) => s + 1); };
  const goPrev = () => { setDirection(-1); setStep((s) => s - 1); };
  const handleSkip = () => navigate("/", { replace: true });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await OnboardingAPI.submit(data);
      toast.success("You're all set! Welcome to Zapp.");
      navigate("/", { replace: true });
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    // STEP 0 — Welcome
    <div className="space-y-6 text-center">
      <div className="text-5xl">⚡</div>
      <div>
        <h2 className="text-3xl font-black text-white mb-3">Let's set you up</h2>
        <p className="text-gray-400 leading-relaxed">
          Answer a few quick questions so Zapp can personalize your value scores and spending insights.
        </p>
      </div>
      <p className="text-xs text-gray-600 uppercase tracking-widest">Takes about 2 minutes</p>
    </div>,

    // STEP 1 — Identity + Financial Capacity
    <div className="space-y-6">
      <div>
        <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: COLORS.electricCyan }}>Section 1 of 4</div>
        <h2 className="text-2xl font-black text-white">About you</h2>
      </div>
      <div className="space-y-3">
        <div className="text-xs font-black uppercase tracking-widest text-gray-500">Life Stage</div>
        {["Student", "Early Career", "Mid Career", "Late Career", "Parent", "Retired"].map((opt) => (
          <OptionButton key={opt} label={opt} selected={data.life_stage === opt.toLowerCase().replace(" ", "_")} onClick={() => set("life_stage", opt.toLowerCase().replace(" ", "_"))} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-xs font-black uppercase tracking-widest text-gray-500">Household Size</div>
          <input
            type="number"
            min={1}
            placeholder="e.g. 2"
            value={data.household_size ?? ""}
            onChange={(e) => set("household_size", e.target.value ? Number(e.target.value) : null)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-cyan-500/50"
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-black uppercase tracking-widest text-gray-500">Zip Code</div>
          <input
            type="text"
            placeholder="e.g. 90210"
            value={data.location_zip}
            onChange={(e) => set("location_zip", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>
    </div>,

    // STEP 2 — Financial Capacity + Goals
    <div className="space-y-6">
      <div>
        <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: COLORS.electricCyan }}>Section 2 of 4</div>
        <h2 className="text-2xl font-black text-white">Your finances</h2>
      </div>
      <div className="space-y-3">
        <div className="text-xs font-black uppercase tracking-widest text-gray-500">Monthly Income</div>
        {["< $2k", "$2k–4k", "$4k–7k", "$7k–10k", "$10k+"].map((opt) => (
          <OptionButton key={opt} label={opt} selected={data.income_range === opt} onClick={() => set("income_range", opt)} />
        ))}
      </div>
      <div className="space-y-2">
        <div className="text-xs font-black uppercase tracking-widest text-gray-500">Monthly Fixed Expenses (optional)</div>
        <input
          type="number"
          placeholder="e.g. 1500"
          value={data.monthly_fixed_expenses ?? ""}
          onChange={(e) => set("monthly_fixed_expenses", e.target.value ? Number(e.target.value) : null)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-cyan-500/50"
        />
      </div>
    </div>,

    // STEP 3 — Goals + Style
    <div className="space-y-6">
      <div>
        <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: COLORS.electricCyan }}>Section 3 of 4</div>
        <h2 className="text-2xl font-black text-white">Your goals</h2>
      </div>
      <div className="space-y-3">
        <div className="text-xs font-black uppercase tracking-widest text-gray-500">Primary Financial Goal</div>
        {[
          { label: "Save more", value: "save_more" },
          { label: "Invest", value: "invest" },
          { label: "Reduce debt", value: "reduce_debt" },
          { label: "Build credit", value: "build_credit" },
          { label: "Control subscriptions", value: "control_subs" },
        ].map((opt) => (
          <OptionButton key={opt.value} label={opt.label} selected={data.financial_goal === opt.value} onClick={() => set("financial_goal", opt.value)} />
        ))}
      </div>
      <div className="space-y-3">
        <div className="text-xs font-black uppercase tracking-widest text-gray-500">Risk Tolerance</div>
        <div className="flex gap-3">
          {["low", "medium", "high"].map((opt) => (
            <OptionButton key={opt} label={opt.charAt(0).toUpperCase() + opt.slice(1)} selected={data.risk_tolerance === opt} onClick={() => set("risk_tolerance", opt)} />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-xs font-black uppercase tracking-widest text-gray-500">Budget Style</div>
        <div className="flex gap-3">
          {[
            { label: "Strict", value: "strict" },
            { label: "Flexible", value: "flexible" },
            { label: "Optimize value", value: "optimize_value" },
          ].map((opt) => (
            <OptionButton key={opt.value} label={opt.label} selected={data.budget_style === opt.value} onClick={() => set("budget_style", opt.value)} />
          ))}
        </div>
      </div>
    </div>,

    // STEP 4 — Value Sliders
    <div className="space-y-8">
      <div>
        <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: COLORS.electricCyan }}>Section 4 of 4</div>
        <h2 className="text-2xl font-black text-white">What matters to you?</h2>
        <p className="text-gray-400 text-sm mt-1">These sliders power your personalized value scores.</p>
      </div>
      <SliderInput label="Cost Sensitivity" question="How important is getting the lowest price?" value={data.value_priority_cost} onChange={(v) => set("value_priority_cost", v)} />
      <SliderInput label="Quality Importance" question="How important is product quality to you?" value={data.value_priority_quality} onChange={(v) => set("value_priority_quality", v)} />
      <SliderInput label="Sustainability" question="How important is sustainability / ethics in purchases?" value={data.value_priority_sustainability} onChange={(v) => set("value_priority_sustainability", v)} />
      <SliderInput label="Research Habit" question="How much do you research before buying something?" value={data.self_report_research_habit ?? 50} onChange={(v) => set("self_report_research_habit", v)} />
    </div>,
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-gray-600">
              {step === 0 ? "Welcome" : `Step ${step} of ${TOTAL_STEPS - 1}`}
            </span>
            <button onClick={handleSkip} className="text-xs font-black uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
              Skip for now
            </button>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: COLORS.electricCyan }}
              animate={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-[2rem] border border-white/[0.06] p-8 overflow-hidden"
          style={{ backgroundColor: "#101A2E", boxShadow: GLOWS.ambient() }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goPrev}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-white transition-colors disabled:opacity-0"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm transition-all hover:scale-105"
              style={{ backgroundColor: COLORS.electricCyan, color: "#0B1220" }}
            >
              {step === 0 ? "Get Started" : "Continue"} <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: COLORS.electricCyan, color: "#0B1220" }}
            >
              {submitting ? "Saving..." : "Finish Setup"} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}