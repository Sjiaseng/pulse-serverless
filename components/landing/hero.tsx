"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Play, Sparkles } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export function HeroSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fullText = "Level Up Your Heart Health Daily!";
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const highlight = "Heart Health";
  const beforeHighlight = displayed.includes(highlight)
    ? displayed.slice(0, displayed.indexOf(highlight))
    : displayed;
  const highlightedText = displayed.includes(highlight)
    ? displayed.slice(
        displayed.indexOf(highlight),
        displayed.indexOf(highlight) + highlight.length,
      )
    : "";
  const afterHighlight = displayed.includes(highlight)
    ? displayed.slice(displayed.indexOf(highlight) + highlight.length)
    : "";

  return (
    <section
      id="home"
      className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-orange-50/30 to-yellow-50/50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#F5BE66]/10 border border-[#F5BE66]/20 rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-[#F5BE66]" />
                <span className="font-montserrat text-sm font-medium text-[#F5BE66]">
                  Your Heart&apos;s Best Friend
                </span>
              </div>

              <h1 className="font-montserrat text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-tight font-bold relative">
                <span className="invisible">{fullText}</span>{" "}
                {/* reserve full space */}
                <span className="absolute top-0 left-0">
                  {beforeHighlight}
                  <span className="text-[#F5BE66]">{highlightedText}</span>
                  {afterHighlight}
                  <span
                    className={`inline-block w-2.5 ml-1 bg-black transition-opacity duration-300 ${
                      displayed.length === fullText.length
                        ? "opacity-0"
                        : "animate-blink"
                    }`}
                  >
                    &nbsp;
                  </span>
                </span>
              </h1>
              <p className="font-montserrat text-lg text-gray-600 leading-relaxed max-w-xl">
                Play every day for a couple of minutes and improve your
                cardiovascular knowledge. Adopt your heart pet, complete fun
                quests, and build healthy habits that last.
              </p>
            </div>

            <div className="flex flex-col sm:w-50 w-full sm:flex-row gap-4">
              <Button
                variant="outline"
                size="lg"
                className="font-main cursor-pointer font-medium px-8 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 bg-white shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => setIsDialogOpen(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Our Demo
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
                <div className="font-dela-gothic text-2xl text-[#F5BE66]">
                  80%
                </div>
                <div className="font-montserrat text-xs text-gray-600">
                  Risk Reduced
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
                <div className="font-dela-gothic text-2xl text-[#F5BE66]">
                  25K+
                </div>
                <div className="font-montserrat text-xs text-gray-600">
                  Lives Improved
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
                <div className="font-dela-gothic text-2xl text-[#F5BE66]">
                  92%
                </div>
                <div className="font-montserrat text-xs text-gray-600">
                  Better Habits
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Main mascot card */}
            <div className="relative bg-gradient-to-br from-[#F5BE66] to-[#F5BE66]/80 rounded-3xl p-8 lg:p-12 shadow-2xl">
              <Image
                src="/han.png"
                alt="Pulse Heart Pet Mascot"
                className="w-full h-auto max-w-sm mx-auto"
                width={250}
                height={250}
              />

              {/* Floating achievement card */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 transform rotate-3 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-montserrat font-bold text-sm text-gray-900">
                      Good job!
                    </div>
                    <div className="font-montserrat text-xs text-gray-600">
                      +520 points
                    </div>
                  </div>
                </div>
              </div>

              {/* Welcome back card */}
              <div className="absolute -bottom-6 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 transform -rotate-2 animate-float">
                <div className="font-montserrat font-bold text-sm text-gray-900 mb-1">
                  Welcome back!
                </div>
                <div className="font-montserrat text-xs text-gray-600">
                  Ready for today&apos;s quest?
                </div>
                <div className="mt-2 bg-[#F5BE66] rounded-xl px-3 py-1">
                  <span className="font-montserrat text-xs font-semibold text-white">
                    Start
                  </span>
                </div>
              </div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute -z-10 top-8 right-8 w-32 h-32 bg-[#F5BE66]/10 rounded-full blur-2xl"></div>
            <div className="absolute -z-10 bottom-8 left-8 w-24 h-24 bg-red-200/30 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="font-dela-gothic text-2xl text-gray-900">
              See Pulse in Action
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/1Di8X2vRNRE?si=IYkPD18JGu6ORuu6?autoplay=1"
              title="ThePrimeAgen"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full object-cover"
            >
              <p className="font-montserrat text-gray-600 p-8 text-center">
                Your browser doesn&apos;t support video playback.
                <br />
                <span className="text-sm">
                  Please try a different browser or contact support.
                </span>
              </p>
            </iframe>
          </div>
          <div className="text-center pt-4">
            <p className="font-montserrat text-gray-600 text-sm">
              Experience how Pulse makes heart health fun and engaging through
              gamification
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
