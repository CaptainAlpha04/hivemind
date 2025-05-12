"use client";
import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import {ChevronRight, Zap} from 'lucide-react';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Features from '@/components/home/Features';
import AppPreview from '@/components/home/AppPreview';
import AIFeatures from '@/components/home/AIFeatures';


export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  useEffect(() => {
    if (isSigningOut && status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, isSigningOut, router]);
  
  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: false });
  };

  if (isSigningOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin mb-4 h-16 w-16 border-4 border-teal-400/30 border-t-teal-400 rounded-full mx-auto"></div>
            <div className="absolute inset-0 animate-pulse">
              <div className="h-16 w-16 rounded-full bg-teal-400/10 blur-xl"></div>
            </div>
          </div>
          <p className="text-teal-200 text-xl font-medium tracking-wide">Signing out...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1E]">
      <Header />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[50rem] h-[50rem] rounded-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 blur-[120px] -top-40 -left-40 animate-pulse"></div>
        <div className="absolute w-[50rem] h-[50rem] rounded-full bg-gradient-to-r from-blue-500/5 to-indigo-500/5 blur-[120px] bottom-40 -right-40 animate-pulse delay-1000"></div>
        <div className="absolute w-[45rem] h-[45rem] rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-[120px] top-1/2 left-1/3 animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        
        {/* Hero Section */}
        <Hero />



       {/* Features Section */} 
        <Features />

     
        {/* App Preview Section */}
      <AppPreview />

        {/* AI Features Section */}
        
        <AIFeatures />
  

        {/* CTA Section */}
        <section className="py-24 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-teal-500/5 to-slate-900/0"></div>
          <div className="max-w-5xl mx-auto relative">
            <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-3xl p-12 text-center shadow-2xl shadow-teal-500/5">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm mb-6">
                <Zap size={14} className="mr-2" />
                <span>Join Our Community</span>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent mb-6">
                Ready to Connect with the World?
              </h2>
              <p className="text-slate-300/80 text-xl mb-8 max-w-2xl mx-auto">
                Join millions of users already transforming how they connect, share, and discover content that matters.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="group relative inline-flex overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-4 font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30"
                >
                  Get Started Now
                  <ChevronRight size={18} className="ml-2" />
                </button>
                <button className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-4 font-medium text-white transition-all duration-300 hover:bg-slate-800">
                  Learn More
                </button>
              </div>
              
              <div className="mt-12 flex items-center justify-center gap-8">
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-white mb-1">10M+</div>
                  <div className="text-slate-400">Active Users</div>
                </div>
                <div className="h-12 w-px bg-slate-700/50"></div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-white mb-1">150+</div>
                  <div className="text-slate-400">Countries</div>
                </div>
                <div className="h-12 w-px bg-slate-700/50"></div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
                  <div className="text-slate-400">User Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}