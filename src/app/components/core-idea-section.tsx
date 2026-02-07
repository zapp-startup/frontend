import * as React from "react";
import { Brain, Target, Zap } from "lucide-react";
import { Card } from "./ui/card";

export function CoreIdeaSection() {
  const features = [
    {
      icon: Brain,
      title: "Personal Financial Memory",
      description: "Zapp remembers every purchase, subscription, and how you felt about each one over time."
    },
    {
      icon: Target,
      title: "Personalized Value Model",
      description: "AI learns what brings you lasting value vs. regret based on your unique patterns and feedback."
    },
    {
      icon: Zap,
      title: "Predictive Guidance Before You Buy",
      description: "Get personalized recommendations the moment you're considering a purchase — not after."
    }
  ];

  return (
    <section className="relative py-24 px-6 bg-[#151b3d]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-cyan-400 mb-4 tracking-wide uppercase">The Zapp Difference</p>
          <h2 className="text-4xl md:text-5xl mb-4 text-white">
            From expense tracking to <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">value-based finance</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Traditional apps track dollars. Zapp tracks what matters — the actual value you get from your spending.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 backdrop-blur-sm p-8 rounded-3xl relative overflow-hidden group hover:border-cyan-500/50 transition-all duration-300"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-300" />
              
              <div className="relative z-10">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                  <feature.icon className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>

              {/* Step indicator */}
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                <span className="text-cyan-400">{index + 1}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Connecting lines visualization */}
        <div className="hidden md:flex justify-center items-center gap-4 mt-12 opacity-30">
          <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <div className="w-2 h-2 rounded-full bg-cyan-500" />
          <div className="h-0.5 w-32 bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent" />
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </div>
      </div>
    </section>
  );
}
