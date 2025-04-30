"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

const AboutPage = () => {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);
    
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach(section => {
      section.classList.add('opacity-0', 'translate-y-10');
      observer.observe(section);
    });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900 text-white relative overflow-hidden">
      {/* Header - Unified with Login/Register */}
      <header className="w-full py-4 px-6 flex items-center justify-between z-20 backdrop-blur-sm bg-slate-900/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <Image src="/Hivemind-removebg-preview.png" alt="HiveMind Logo" width={32} height={32} className="object-contain w-8 h-8" />
          </div>
          <span className="text-white font-semibold text-xl tracking-wide">HiveMind</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link href="/Home" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium">Home</Link>
          <Link href="/About" className="text-teal-300 transition-colors duration-300 text-sm font-medium">About</Link>
          <Link href="/Contact" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium">Contact</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full relative">
        {/* Modern Blur Gradient Elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 blur-3xl bottom-40 -right-20"></div>
          <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-3xl top-1/2 left-1/3"></div>
        </div>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>

        {/* Hero Section */}
        <section className="scroll-section relative container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-400">Our Story</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full mb-8"></div>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-gray-300">
            Discover the journey behind HiveMind, where technology meets human connection in ways never imagined before.
          </p>
          
          <div className="w-full max-w-5xl h-64 md:h-96 relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 backdrop-blur-sm border border-teal-500/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500 font-bold">Our Vision</div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="scroll-section relative container mx-auto px-4 py-16 z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 order-2 md:order-1">
                <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">Our Mission</h2>
                <p className="text-gray-300 mb-6">
                  At HiveMind, we&apos;re on a mission to redefine social connectivity for the digital age. We envision a world where technology enhances genuine human connection rather than replacing it.
                </p>
                <p className="text-gray-300 mb-6">
                  Founded in 2025, HiveMind began as a small experiment to create a more authentic social experience. Today, we&apos;ve grown into a community of millions who share, connect, and grow together.
                </p>
                <div className="flex gap-4 mt-8">
                  <button className="px-6 py-3 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-zinc-900 rounded-full hover:opacity-90 transition shadow-lg shadow-emerald-500/30">Learn More</button>
                </div>
              </div>
              <div className="w-full md:w-1/2 h-80 bg-gradient-to-r from-teal-900/40 to-cyan-900/40 rounded-2xl backdrop-blur-sm border border-teal-500/20 order-1 md:order-2 flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="scroll-section relative bg-gradient-to-r from-teal-900/30 to-cyan-900/30 py-20 z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">Our Core Values</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                The principles that guide everything we do at HiveMind
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-slate-900/60 backdrop-blur-sm p-8 rounded-2xl border border-teal-500/20 hover:border-cyan-500/50 transition-all">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Community First</h3>
                <p className="text-gray-400">
                  We believe in the power of communities to bring people together around shared interests and values. Every feature we build is designed to strengthen these connections.
                </p>
              </div>
              
              <div className="bg-slate-900/60 backdrop-blur-sm p-8 rounded-2xl border border-teal-500/20 hover:border-cyan-500/50 transition-all">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Privacy & Security</h3>
                <p className="text-gray-400">
                  We&apos;re committed to protecting your data and privacy. Our platform is built with security at its core, ensuring your information remains yours alone.
                </p>
              </div>
              
              <div className="bg-slate-900/60 backdrop-blur-sm p-8 rounded-2xl border border-teal-500/20 hover:border-cyan-500/50 transition-all">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Innovation</h3>
                <p className="text-gray-400">
                  We constantly push the boundaries of what social media can be. Our team of innovators is always exploring new ways to enhance your experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="scroll-section relative container mx-auto px-4 py-20 z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">Meet Our Team</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The brilliant minds behind HiveMind innovation and growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-teal-500/20 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">AI</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Ali Imran</h3>
              <p className="text-teal-400 mb-4">Founder & CEO</p>
              <p className="text-gray-400">
                Visionary tech leader with a passion for connecting people in meaningful ways.
              </p>
            </div>
            
            <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-cyan-500/20 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">SL</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Soeem Luhanna</h3>
              <p className="text-cyan-400 mb-4">Chief Product Officer</p>
              <p className="text-gray-400">
                Product genius with an eye for design and user experience that delights.
              </p>
            </div>
            
            <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-emerald-500/20 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">SK</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Saad Khan</h3>
              <p className="text-emerald-400 mb-4">CTO</p>
              <p className="text-gray-400">
                Technical mastermind behind HiveMind&apos;s cutting-edge technology stack.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="scroll-section relative bg-gradient-to-r from-teal-900/30 to-cyan-900/30 py-20 z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">By The Numbers</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  HiveMind has grown exponentially since our launch
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500 mb-2">0+</div>
                  <p className="text-gray-400">Active Users</p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-500 mb-2">1+</div>
                  <p className="text-gray-400">Countries</p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-500 mb-2">5+</div>
                  <p className="text-gray-400">Communities</p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-500 mb-2">99.9%</div>
                  <p className="text-gray-400">Uptime</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="scroll-section relative container mx-auto px-4 py-20 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">Ready to Join the HiveMind?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Become part of our growing community and experience social media like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/Register">
                <button className="relative overflow-hidden bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-zinc-900 px-8 py-4 rounded-full text-lg font-medium transition-all shadow-lg shadow-emerald-500/30 group">
                  <span className="relative z-10">Sign Up Now</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                </button>
              </Link>
              <button className="bg-white/10 text-slate-100 px-8 py-4 rounded-full text-lg font-medium hover:bg-white/20 transition-colors border border-teal-500/30 hover:border-teal-500/50 backdrop-blur-sm">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 z-20 mt-auto backdrop-blur-sm bg-slate-900/30 border-t border-teal-500/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <Image src="/Hivemind-removebg-preview.png" alt="HiveMind Logo" width={32} height={32} className="object-contain w-8 h-8" />
            </div>
            <span className="text-white font-semibold text-xl tracking-wide">HiveMind</span>
          </div>
          <div className="flex space-x-8 mb-4 md:mb-0">
            <Link href="/" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium">Home</Link>
            <Link href="/about" className="text-teal-300 transition-colors duration-300 text-sm font-medium">About</Link>
            <Link href="/contact" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium">Contact</Link>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
              </svg>
            </a>
            <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
              </svg>
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-teal-500/20 text-center text-slate-400 text-sm">
          <p>© 2025 HiveMind. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <Link href="/privacy" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Terms</Link>
            <Link href="/help" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;