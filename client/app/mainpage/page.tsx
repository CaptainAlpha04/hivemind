"use client";
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';

export default function MainPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Protect this route - redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-400 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Main content - only shown to authenticated users
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900">
      <Header />
      <div className="flex mt-[70px]">
        <Sidebar />
        <main className="flex-1 ml-[280px] px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Welcome to HiveMind</h1>
            
            <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Main Dashboard</h2>
              <p className="text-slate-300">
                This is a placeholder for the main page. Your authenticated content will appear here.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 