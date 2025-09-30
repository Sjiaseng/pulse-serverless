import { Download, Heart, Trophy, Share2 } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: Download,
      step: "01",
      title: "Download & Sign Up",
      description: "Get the Pulse app and create your personalized heart health profile.",
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Heart,
      step: "02",
      title: "Adopt Your Heart Pet",
      description: "Choose and customize your virtual heart companion that will grow with your health journey.",
      color: "bg-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: Trophy,
      step: "03",
      title: "Complete Quests",
      description: "Engage in daily challenges, learn about cardiovascular health, and earn rewards.",
      color: "bg-[#F5BE66]",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Share2,
      step: "04",
      title: "Share & Connect",
      description: "Share your progress, connect with the community, and inspire others on their journey.",
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#F5BE66]/10 border border-[#F5BE66]/20 rounded-full px-4 py-2 mb-4">
            <Trophy className="w-4 h-4 text-[#F5BE66]" />
            <span className="font-montserrat text-sm font-medium text-[#F5BE66]">Simple & Fun</span>
          </div>
          <h2 className="font-montserrat font-bold text-3xl sm:text-4xl text-gray-900 mb-4">How It <span className="text-[#F5BE66]">Works</span></h2>
          <p className="font-montserrat text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Getting started with Pulse is simple. Follow these four easy steps to begin your heart health journey.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 animate-float">
          {steps.map((step, index) => (
            <div key={index} className={`relative ${index % 2 === 1 ? "lg:mt-16" : ""}`}>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-12 h-1 bg-gradient-to-r from-[#F5BE66]/30 to-transparent transform translate-x-4 z-0 rounded-full" />
              )}

              <div
                className={`relative ${step.bgColor} rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white hover:scale-105 transform w-64`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center shadow-md`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="font-dela-gothic text-3xl text-gray-300">{step.step}</span>
                </div>

                <h3 className="font-montserrat font-bold text-xl text-gray-900 mb-3">{step.title}</h3>
                <p className="font-montserrat text-gray-700 text-sm leading-relaxed">{step.description}</p>

                {index === 1 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white" />
                  </div>
                )}
                {index === 2 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#F5BE66] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
