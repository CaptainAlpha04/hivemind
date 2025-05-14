'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import Header from '@/components/ui/Navbar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Client-side authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('Not authenticated, redirecting from settings');
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
    } else if (status === 'authenticated') {
      // You now have access to the user ID
      console.log('User ID in settings:', session.user?.id);
    }
  }, [status, session, router, pathname]);

  const navItems = [
    { label: 'Profile', href: '/settings/profile' },
    { label: 'Account', href: '/settings/account' },
    { label: 'Privacy', href: '/settings/privacy' },
    { label: 'Preferences', href: '/settings/preferences' },
  ];

  // Show loading state during authentication check
  if (status === 'loading') {
    return (
      <>
        <div className="fixed top-0 left-0 w-full z-30 bg-transparent backdrop-blur-md">
          <Header />
        </div>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex pt-20 justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-teal-500/50 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-300">Loading settings...</p>
          </div>
        </div>
      </>
    );
  }

  // Prevent rendering if not authenticated
  if (status === 'unauthenticated') {
    return null; // Will redirect in the useEffect
  }

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-30 bg-transparent backdrop-blur-md">
        <Header />
      </div>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex pt-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 blur-3xl -top-40 -left-40 animate-pulse-slow"></div>
          <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/5 to-indigo-500/5 blur-3xl bottom-40 -right-40 animate-pulse-slow"></div>
        </div>
        
        {/* Sidebar */}
        <div className="w-72 border-r border-slate-800/50 p-6 relative backdrop-blur-sm bg-slate-900/30">
          <div className="mb-8">
            <span className="ml-2 font-bold text-lg bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">Settings</span>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg font-medium text-base transition-all mb-1
                  ${pathname === item.href 
                    ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 p-8 relative">
          {children}
        </div>
      </div>
    </>
  );
}