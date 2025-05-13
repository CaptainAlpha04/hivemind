"use client";
import React, { useEffect, useState } from 'react';
import { useSession, signOut} from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Features from '@/components/home/Features';
import AppPreview from '@/components/home/AppPreview';
import AIFeatures from '@/components/home/AIFeatures';
import Cts from '@/components/Cts';


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
  } else if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-center space-y-4"> 
          <div className="relative">
            <div className="animate-spin mb-4 h-16 w-16 border-4 border-teal-400/30 border-t-teal-400 rounded-full mx-auto"></div>
            <div className="absolute inset-0 animate-pulse">
              <div className="h-16 w-16 rounded-full bg-teal-400/10 blur-xl"></div>
            </div>
            </div>
            <p className="text-teal-200 text-xl font-medium tracking-wide">Loading...</p>
          </div>
        </div>
    );
  } else if (status === "authenticated") {
      return(
        <>
        {/* Temporary Feed page after login */}
          <div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
            >
              Sign Out
            </button>
          </div>
        </>
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

        <Cts />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}