"use client";
import React, { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Hero from '@/components/Hero';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Add debugging to see what's happening
  useEffect(() => {
    console.log("Auth status:", status);
    console.log("Session data:", session);
  }, [status, session]);
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900 relative overflow-hidden">
      <Header />
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient blobs */}
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl -top-20 -left-20"></div>
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-3xl bottom-40 -right-20"></div>
        <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl top-1/2 left-1/3"></div>
      </div>
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 z-10">
        <div className="flex flex-col items-center space-y-6">
          {status === "authenticated" && session ? (
            <div className="glass-card p-8 text-center max-w-md">
              <h1 className="text-2xl font-bold text-white mb-4">
                Hello, {session.user?.name || "User"}
              </h1>
              <p className="text-slate-300 mb-6">
                You are signed in as: {session.user?.email}
              </p>
              <button
                onClick={handleSignOut}
                className="text-teal-200 transition-colors duration-300 font-medium bg-teal-900/70 hover:backdrop-blur-md px-8 py-3 rounded-full hover:bg-teal-800 w-full"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Hero />
          )}
        </div>
      </main>
    </div>
  );
}