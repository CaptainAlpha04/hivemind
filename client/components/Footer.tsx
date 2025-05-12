import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="py-16 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Logo and tagline section */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <Image src="/images/logo.png" alt="HiveMind Logo" width={36} height={36} className="object-contain w-8 h-8" />
        </div>
            <span className="text-white font-bold text-2xl tracking-tight">HiveMind</span>
          </div>
          <p className="text-slate-300 max-w-md text-lg font-light">
            Connect, share, and discover content that matters to you.
          </p>
        </div>

        {/* Social icons */}
        <div className="flex justify-center gap-6 mb-16">
          <a href="#" className="h-12 w-12 rounded-full bg-slate-800/60 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:bg-teal-500/20 hover:text-teal-300 transition-all duration-300 shadow-lg hover:shadow-teal-500/20 border border-slate-700/50 hover:border-teal-500/30">
            <Twitter size={20} />
            <span className="sr-only">Twitter</span>
          </a>
          <a href="#" className="h-12 w-12 rounded-full bg-slate-800/60 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:bg-teal-500/20 hover:text-teal-300 transition-all duration-300 shadow-lg hover:shadow-teal-500/20 border border-slate-700/50 hover:border-teal-500/30">
            <Facebook size={20} />
            <span className="sr-only">Facebook</span>
          </a>
          <a href="#" className="h-12 w-12 rounded-full bg-slate-800/60 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:bg-teal-500/20 hover:text-teal-300 transition-all duration-300 shadow-lg hover:shadow-teal-500/20 border border-slate-700/50 hover:border-teal-500/30">
            <Instagram size={20} />
            <span className="sr-only">Instagram</span>
          </a>
          <a href="#" className="h-12 w-12 rounded-full bg-slate-800/60 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:bg-teal-500/20 hover:text-teal-300 transition-all duration-300 shadow-lg hover:shadow-teal-500/20 border border-slate-700/50 hover:border-teal-500/30">
            <Linkedin size={20} />
            <span className="sr-only">LinkedIn</span>
          </a>
        </div>

        {/* Bottom footer with divider */}
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-8">
            <div className="h-1 w-24 bg-gradient-to-r from-teal-500/30 via-teal-400 to-teal-500/30 rounded-full"></div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8">
            <p className="text-slate-400 text-sm mb-6 md:mb-0">
              &copy; {new Date().getFullYear()} HiveMind. All rights reserved.
            </p>
            
            <div className="flex flex-wrap justify-center gap-8">
              <a href="#" className="text-slate-400 text-sm hover:text-teal-300 transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-400 text-sm hover:text-teal-300 transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-slate-400 text-sm hover:text-teal-300 transition-colors duration-300">
                Cookies
              </a>
              <a href="#" className="text-slate-400 text-sm hover:text-teal-300 transition-colors duration-300">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
  