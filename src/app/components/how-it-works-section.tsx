import * as React from "react";
import { ShoppingBag, MessageSquare, TrendingUp, Lightbulb } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      icon: ShoppingBag,
      title: "Log purchases & subscriptions",
      description: "Quickly capture what you buy — from coffee to subscriptions. Manual or automated tracking."
    },
    {
      icon: MessageSquare,
      title: "Lightweight post-purchase feedback",
      description: "Share how you feel about purchases with simple prompts. Takes seconds, not surveys."
    },
    {
      icon: TrendingUp,
      title: "Behavioral and usage analysis",
      description: "Zapp tracks patterns over time: usage frequency, cancellations, repeat purchases, and more."
    },
    {
      icon: Lightbulb,
      title: "Personalized spending guidance",
      description: "Get smart recommendations before your next purchase — tailored to your unique value patterns."
    }
  ];

  return (
    <section className="relative py-24 px-6 bg-[#0a0e27]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4 text-white">
            Zapp learns <span className="text-cyan-400">with you</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            The more you use Zapp, the smarter it gets. Your personal CFO evolves alongside your spending habits.
          </p>
        </div>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500 hidden md:block" />

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6 items-start relative">
                {/* Step number circle */}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30 border-4 border-[#0a0e27]">
                  <step.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300 group">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl text-white group-hover:text-cyan-400 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <span className="text-sm text-gray-500 flex-shrink-0">Step {index + 1}</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="flex justify-center mt-16">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
