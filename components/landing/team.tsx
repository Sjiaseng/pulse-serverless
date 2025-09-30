import Image from "next/image";

export function TeamSection() {
  const teamMembers = [
    {
      name: "Johnson Chin Hong Wei",
      role: "Frontend Developer",
      image: "/images/johnson.png",
      bio: "guy that builds 100 apps",
      traits: ["Full-stack developer", "Foodie", "Sleepy"],
      social: {
        linkedin: "https://www.linkedin.com/in/johnson-chin1009/",
        github: "https://github.com/JohnsonChin1009",
      },
    },
    {
      name: "Sia Jun Ian",
      role: "Full Stack Developer",
      image: "/images/ian.png",
      bio: "Full-stack developer passionate about creating health-focused digital solutions.",
      traits: ["add here", "just add anything", "addddddd"],
      social: {
        linkedin: "https://www.linkedin.com/in/sia-jun-ian-357646277/",
        github: "https://github.com/Hopplers",
      },
    },
    {
      name: "Soh Jia Seng",
      role: "Developer",
      image: "/images/soh.png",
      bio: "Design expert specializing in gamification and health app user experiences.",
      traits: ["I want sleep", "I need food", "I am bored"],
      social: {
        linkedin: "https://www.linkedin.com/in/soh-jia-seng-39403b274/",
        github: "https://github.com/Sjiaseng",
      },
    },
  ];

  return (
    <section
      id="team"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden"
    >
      <div className="absolute top-10 left-10 w-20 h-20 bg-[#F5BE66]/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-[#F5BE66]/5 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-[#F5BE66] rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-[#F5BE66] rounded-full animate-pulse delay-1000"></div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-3xl sm:text-4xl text-gray-900 mb-4">
            Our <span className="text-[#F5BE66]">Team</span>
          </h2>
          <p className="font-montserrat text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Meet the passionate professionals behind Pulse, combining medical
            expertise with innovative technology to revolutionize heart health
            education.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#F5BE66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

              <div className="relative mb-6">
                <div className="relative">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-white shadow-md"
                  />
                </div>
              </div>

              <h3 className="font-dela-gothic text-lg text-gray-900 mb-1">
                {member.name}
              </h3>
              <p className="font-montserrat text-[#F5BE66] font-medium text-sm mb-3">
                {member.role}
              </p>
              <p className="font-montserrat text-gray-600 text-sm leading-relaxed mb-4">
                {member.bio}
              </p>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1 justify-center">
                  {member.traits.map((trait, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-[#F5BE66]/10 text-[#F5BE66] text-xs px-2 py-1 rounded-full font-montserrat font-medium"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto relative z-10">
                {Object.entries(member.social).map(([platform, link]) => (
                  <a
                    key={platform}
                    href={link}
                    className="w-8 h-8 bg-[#F5BE66]/10 hover:bg-[#F5BE66] rounded-full flex items-center justify-center transition-colors duration-200 group/social"
                    target="_blank"
                  >
                    <span className="text-[#F5BE66] group-hover/social:text-white text-xs font-bold">
                      {platform === "linkedin"
                        ? "in"
                        : platform === "github"
                          ? "gh"
                          : ""}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
