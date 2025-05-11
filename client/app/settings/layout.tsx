'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const settingsLinks = [
    { href: '/settings/profile', label: 'Profile', icon: '👤' },
    { href: '/settings/account', label: 'Account', icon: '🔑' },
    { href: '/settings/preferences', label: 'Preferences', icon: '⚙️' },
    { href: '/settings/privacy', label: 'Privacy', icon: '🔒' },
    // Add your fifth section here if needed, e.g.:
    // { href: '/settings/notifications', label: 'Notifications', icon: '🔔' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80">
      {/* Header with glass/blur effect */}
      <div className="fixed top-0 left-0 w-full z-30">
        <div className="backdrop-blur-md bg-transparent border-b border-slate-800/60">
          <Header />
        </div>
      </div>

      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 blur-3xl -top-40 -left-40 animate-pulse-slow"></div>
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/5 to-indigo-500/5 blur-3xl bottom-40 -right-40 animate-pulse-slow"></div>
      </div>

      <div className="container mx-auto px-2 md:px-6 py-8 relative pt-24">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-transparent backdrop-blur-md rounded-xl p-4 md:p-6 border border-zinc-800 shadow-md">
            <h2 className="text-xl font-semibold text-white mb-6">Settings</h2>
            <nav className="space-y-2">
              {settingsLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium text-base daisy-btn daisy-btn-ghost daisy-btn-block ${
                    pathname === link.href
                      ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400 daisy-btn-active'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-transparent backdrop-blur-md rounded-xl p-4 md:p-8 border border-zinc-800 shadow-md">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
