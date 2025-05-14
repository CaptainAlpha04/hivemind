"use client";
import React, { useEffect, useState } from 'react';
import { useSession, signOut} from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/home/page';
import MainPage from '@/components/main/feed';

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
          {/* Feeds Page */}
            <MainPage />
        </>
      );
  }
  return (
    <LandingPage />
  );
}