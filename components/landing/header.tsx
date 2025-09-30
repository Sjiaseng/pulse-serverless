"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart } from "lucide-react";
import Link from "next/link";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navItems = useMemo(
    () => [
      { name: "Home", href: "#home" },
      { name: "About Us", href: "#about" },
      { name: "How it Works", href: "#how-it-works" },
      { name: "Our Team", href: "#team" },
      { name: "Vision & Mission", href: "#vision-mission" },
    ],
    [],
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      navItems.forEach((item) => {
        const section = document.querySelector(item.href);
        if (section) {
          const top =
            section.getBoundingClientRect().top + window.scrollY - 100;
          const bottom = top + section.clientHeight;
          if (scrollY >= top && scrollY < bottom) {
            setActiveSection(item.href.slice(1));
          }
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection, navItems]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F5BE66] rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-main font-medium text-xl text-gray-900">
              Pulse
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                <a
                  href={item.href}
                  className={`font-montserrat text-gray-700 transition-colors duration-200 ${
                    activeSection === item.href.slice(1) ? "text-[#F5BE66]" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#F5BE66] transition-all duration-300 group-hover:w-full"></span>
              </div>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/sign-in">
              <Button
                variant="default"
                className="hover:opacity-90 font-headline font-medium"
              >
                Start Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="font-montserrat text-gray-700 hover:text-[#F5BE66] transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <Link href="/sign-in">
                <Button
                  style={{ backgroundColor: "#F5BE66" }}
                  className="text-white hover:opacity-90 font-montserrat font-medium mt-4 w-full"
                >
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
