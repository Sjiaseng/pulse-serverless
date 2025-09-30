import { Target, Eye, Heart } from "lucide-react"

export function VisionMissionSection() {
  return (
    <section id="vision-mission" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-3xl sm:text-4xl text-gray-900 mb-4">Vision <span className="bg-gradient-to-r from-black to-[#F5BE66] bg-clip-text text-transparent">&</span> <span className="text-[#F5BE66]">Mission</span></h2>
          <p className="font-montserrat text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our commitment to transforming cardiovascular health through innovation, education, and community.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Vision */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F5BE66] rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-montserrat font-bold text-2xl text-gray-900">Our Vision</h3>
            </div>
            <p className="font-montserrat text-gray-600 leading-relaxed text-lg">
              To create a world where cardiovascular health education is accessible, engaging, and effective for
              everyone. We envision a future where heart disease prevention is not just understood but actively
              practiced through innovative digital experiences.
            </p>

            <div className="bg-gradient-to-r from-[#F5BE66]/10 to-red-100/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-5 h-5 text-[#F5BE66]" />
                <span className="font-dela-gothic text-[#F5BE66]">Impact Goal</span>
              </div>
              <p className="font-montserrat text-gray-700 text-sm">
                Reduce cardiovascular disease risk by 30% among our user community through gamified health education.
              </p>
            </div>
          </div>

          {/* Mission */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-montserrat font-bold text-2xl text-gray-900">Our Mission</h3>
            </div>
            <p className="font-montserrat text-gray-600 leading-relaxed text-lg">
              To revolutionize cardiovascular health education by combining evidence-based medical knowledge with
              engaging gamification. We make learning about heart health fun, interactive, and personally meaningful
              through virtual pet companions and rewarding quest systems.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#F5BE66] rounded-full mt-2 flex-shrink-0"></div>
                <p className="font-montserrat text-gray-700 text-sm">
                  <strong>Educate:</strong> Provide scientifically accurate cardiovascular health information
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#F5BE66] rounded-full mt-2 flex-shrink-0"></div>
                <p className="font-montserrat text-gray-700 text-sm">
                  <strong>Engage:</strong> Create immersive experiences that motivate healthy behaviors
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#F5BE66] rounded-full mt-2 flex-shrink-0"></div>
                <p className="font-montserrat text-gray-700 text-sm">
                  <strong>Empower:</strong> Give users tools and knowledge to take control of their heart health
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
