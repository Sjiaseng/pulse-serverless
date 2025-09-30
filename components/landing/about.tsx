import { Brain, Activity, Target, Info } from "lucide-react";
import Image from "next/image";

export function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#F5BE66]/10 border border-[#F5BE66]/20 rounded-full px-4 py-2">
                <Info className="w-4 h-4 text-[#F5BE66]" />
                <span className="font-montserrat text-sm font-medium text-[#F5BE66]">
                  About Our Information
                </span>
              </div>

              <h2 className="font-montserrat font-bold text-3xl sm:text-4xl text-gray-900 leading-tight">
                Making Heart Health
                <span className="text-[#F5BE66]"> Fun & Accessible</span>
              </h2>

              <p className="font-montserrat text-lg text-gray-600 leading-relaxed">
                Cardiovascular disease affects millions worldwide, but
                prevention doesn&apos;t have to be boring. Pulse gamifies heart
                health education, making it engaging and memorable through
                interactive pet care and quest-based learning.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#F5BE66]/5 to-transparent rounded-2xl">
                <div className="w-10 h-10 bg-[#F5BE66] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-montserrat font-semibold text-lg text-gray-900 mb-1">
                    Evidence-Based Learning
                  </h3>
                  <p className="font-montserrat text-gray-600 text-sm">
                    All content is backed by medical research and cardiovascular
                    health guidelines.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-red-50/50 to-transparent rounded-2xl">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-montserrat font-semibold text-lg text-gray-900 mb-1">
                    Interactive Engagement
                  </h3>
                  <p className="font-montserrat text-gray-600 text-sm">
                    Learn through caring for your heart pet and completing daily
                    health challenges.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50/50 to-transparent rounded-2xl">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-montserrat font-semibold text-lg text-gray-900 mb-1">
                    Personalized Goals
                  </h3>
                  <p className="font-montserrat text-gray-600 text-sm">
                    Set and track personal cardiovascular health goals with
                    guided support.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-[#F5BE66]/10 via-red-50/30 to-pink-50/20 rounded-3xl p-8 lg:p-12">
              <Image
                src="/frederick.png"
                alt="Heart health mascot Image"
                className="w-full h-auto rounded-2xl"
                width={400}
                height={400}
              />

              {/* Floating stats cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-3 shadow-lg border border-gray-100 animate-float">
                <div className="font-dela-gothic text-sm text-[#F5BE66]">
                  Heart Rate
                </div>
                <div className="font-montserrat text-xs text-gray-600">
                  72 BPM ✓
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-3 shadow-lg border border-gray-100 animate-float">
                <div className="font-dela-gothic text-sm text-green-600">
                  Daily Goal
                </div>
                <div className="font-montserrat text-xs text-gray-600">
                  Completed!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
