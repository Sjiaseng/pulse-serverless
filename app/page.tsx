import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero";
import { AboutSection } from "@/components/landing/about";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { TeamSection } from "@/components/landing/team";
import { VisionMissionSection } from "@/components/landing/vision-mission";
import { Footer } from "@/components/landing/footer";
import BottomBanner from "@/components/landing/bottom-banner";
import AnimateOnView from "@/components/landing/animation";

export default async function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <AnimateOnView animation="slideDown">
          <HeroSection />
        </AnimateOnView>

        <AnimateOnView animation="slideLeft">
          <AboutSection />
        </AnimateOnView>

        <AnimateOnView animation="slideRight">
          <HowItWorksSection />
        </AnimateOnView>

        <AnimateOnView animation="slideDown">
          <TeamSection />
        </AnimateOnView>

        <AnimateOnView animation="slideUp">
          <VisionMissionSection />
        </AnimateOnView>

        <AnimateOnView animation="fadeIn" duration={2}>
          <BottomBanner />
        </AnimateOnView>
      </main>
      <AnimateOnView animation="slideUp">
        <Footer />
      </AnimateOnView>
    </div>
  );
}
