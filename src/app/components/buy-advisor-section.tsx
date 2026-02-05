import { CheckCircle2, XCircle, Clock, Camera } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

export function BuyAdvisorSection() {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#151b3d] to-[#0a0e27]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/30 px-4 py-1 rounded-full">
            Key Feature
          </Badge>
          <h2 className="text-4xl md:text-5xl mb-4 text-white">
            Buy Advisor — <span className="text-cyan-400">Pre-Purchase Intelligence</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Get personalized guidance before you spend, not after. Zapp analyzes your past behavior 
            to predict if a purchase will bring lasting value.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Mock interface */}
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 backdrop-blur-sm p-8 rounded-3xl">
            <div className="space-y-6">
              {/* Item preview */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white mb-1">Premium Coffee Subscription</h4>
                  <p className="text-gray-400">Monthly delivery</p>
                  <p className="text-cyan-400 mt-2">$29.99/month</p>
                </div>
              </div>

              {/* Value score */}
              <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Personalized Value Score</span>
                  <span className="text-3xl text-cyan-400">73</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[73%] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                </div>
              </div>

              {/* Analysis */}
              <div className="p-6 bg-slate-800/60 rounded-2xl border border-slate-700/50">
                <p className="text-sm text-gray-400 mb-2">Based on your history:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    You used your last coffee subscription consistently
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Similar purchases had high satisfaction
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <XCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    Above your typical monthly subscription budget
                  </li>
                </ul>
              </div>

              {/* Recommended actions */}
              <div className="space-y-3">
                <button className="w-full p-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                  Go for it — Good value match
                </button>
                <button className="w-full p-4 bg-slate-800/80 text-gray-300 rounded-2xl hover:bg-slate-700/80 transition-all duration-300 flex items-center justify-center gap-2 border border-slate-700">
                  <Clock className="w-5 h-5" />
                  Delay — Wait for a better time
                </button>
              </div>
            </div>
          </Card>

          {/* Feature highlights */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-white mb-2">Smart Analysis</h4>
                <p className="text-gray-400">
                  Zapp compares the purchase to your past spending patterns, usage data, and satisfaction feedback 
                  to predict its long-term value.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-white mb-2">Personalized Insights</h4>
                <p className="text-gray-400">
                  Every recommendation is unique to you. What's valuable for one person might not be for another — 
                  Zapp learns your preferences.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-white mb-2">Clear Recommendations</h4>
                <p className="text-gray-400">
                  No complex financial jargon. Just simple, actionable advice: Buy, Delay, or Skip — 
                  with clear reasoning behind each suggestion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
