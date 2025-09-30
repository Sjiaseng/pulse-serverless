import { Heart, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F5BE66] rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white font-bold" />
              </div>
              <span className="font-montserrat font-bold text-xl">Pulse</span>
            </div>
            <p className="font-montserrat text-gray-400 text-sm leading-relaxed">
              Your digital companion for cardiovascular health. Making heart health education fun, interactive, and
              rewarding.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-dela-gothic text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "About Us", "How it Works", "Our Team", "Vision & Mission"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(/\s+/g, "-").replace("&", "")}`}
                    className="font-montserrat text-gray-400 hover:text-[#F5BE66] transition-colors duration-200 text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-dela-gothic text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              {["Help Center", "Privacy Policy", "Terms of Service", "Contact Us", "FAQ"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="font-montserrat text-gray-400 hover:text-[#F5BE66] transition-colors duration-200 text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-dela-gothic text-lg mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#F5BE66]" />
                <span className="font-montserrat text-gray-400 text-sm">admin@pulse.health</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#F5BE66]" />
                <span className="font-montserrat text-gray-400 text-sm">+60 11-2089 4395</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#F5BE66]" />
                <span className="font-montserrat text-gray-400 text-sm">Kuala Lumpur, Malaysia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-montserrat text-gray-400 text-sm">© 2025 Pulse. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="font-montserrat text-gray-400 hover:text-[#F5BE66] transition-colors duration-200 text-sm"
            >
              Privacy
            </a>
            <a
              href="#"
              className="font-montserrat text-gray-400 hover:text-[#F5BE66] transition-colors duration-200 text-sm"
            >
              Terms
            </a>
            <a
              href="#"
              className="font-montserrat text-gray-400 hover:text-[#F5BE66] transition-colors duration-200 text-sm"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
