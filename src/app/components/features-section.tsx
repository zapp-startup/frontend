import { LayoutDashboard, Receipt, ThumbsUp, FileText, BarChart3, Bell } from "lucide-react";
import { Card } from "./ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: LayoutDashboard,
      title: "Personalized Dashboard",
      description: "See your spending insights, value scores, and trends at a glance."
    },
    {
      icon: Receipt,
      title: "Purchase & Subscription Tracking",
      description: "Keep tabs on all your spending in one place, with smart categorization."
    },
    {
      icon: ThumbsUp,
      title: "Lightweight Post-Purchase Feedback",
      description: "Quick prompts help Zapp learn what purchases bring you value."
    },
    {
      icon: FileText,
      title: "Deep Reflections",
      description: "Optional detailed reviews for major purchases and life decisions."
    },
    {
      icon: BarChart3,
      title: "Personalized Spending Analysis",
      description: "Understand your patterns, identify what matters, and where to cut back."
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Get nudges to review subscriptions, unused purchases, and potential savings."
    }
  ];

  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#0a0e27] to-[#151b3d]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4 text-white">
            Everything you need for <span className="text-cyan-400">intentional spending</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A complete suite of tools designed to help you spend with confidence and purpose.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-700/50 backdrop-blur-sm p-6 rounded-3xl hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group"
            >
              <div className="mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" />
              </div>
              <h3 className="text-lg mb-2 text-white group-hover:text-cyan-400 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
