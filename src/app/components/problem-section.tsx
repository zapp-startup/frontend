import { CreditCard, ShoppingCart, TrendingDown } from "lucide-react";
import { Card } from "./ui/card";

export function ProblemSection() {
  const problems = [
    {
      icon: CreditCard,
      title: "Tracks spending after the fact",
      description: "Traditional apps only show you what you've already spent — when it's too late to change your mind."
    },
    {
      icon: TrendingDown,
      title: "No sense of personal value",
      description: "Every dollar is treated the same. No insight into what purchases actually bring you joy or value."
    },
    {
      icon: ShoppingCart,
      title: "Repeated low-value purchases",
      description: "Subscriptions pile up. Impulse buys go unused. You have no way to learn from past mistakes."
    }
  ];

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#0a0e27] to-[#151b3d]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4 text-white">
            Spending is easy. <span className="text-gray-400">Spending well is hard.</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Most financial tools focus on tracking and budgeting. But they miss the most important question: 
            <span className="text-cyan-400"> Was it worth it?</span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <Card 
              key={index}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-700/50 backdrop-blur-sm p-8 rounded-3xl hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group"
            >
              <div className="mb-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-all duration-300">
                <problem.icon className="w-7 h-7 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" />
              </div>
              <h3 className="text-xl mb-3 text-white">{problem.title}</h3>
              <p className="text-gray-400 leading-relaxed">{problem.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
