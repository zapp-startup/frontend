import * as React from "react";
import { GraduationCap, Users, Target } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function WhoItsForSection() {
  return (
    <section className="relative py-24 px-6 bg-[#151b3d]">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1760351065294-b069f6bcadc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFkdWx0JTIwc3R1ZGVudCUyMGxhcHRvcCUyMGNvZmZlZXxlbnwxfHx8fDE3NzAyNDI2NzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Young professional using laptop"
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151b3d] via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl mb-4 text-white">
                Built for <span className="text-cyan-400">mindful spenders</span>
              </h2>
              <p className="text-lg text-gray-400">
                Zapp is designed for anyone who wants to make smarter financial decisions, 
                especially those on a limited budget who value intentional spending.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                  <GraduationCap className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white mb-1">Students</h4>
                  <p className="text-gray-400">
                    Making every dollar count while building healthy financial habits for the future.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white mb-1">Young Professionals</h4>
                  <p className="text-gray-400">
                    Navigating early career finances and learning what spending truly adds value to your life.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                  <Target className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white mb-1">Intentional Spenders</h4>
                  <p className="text-gray-400">
                    Anyone who wants to align their spending with their values and long-term goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
