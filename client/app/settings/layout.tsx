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

  const navItems = [
    { label: 'Profile', href: '/settings/profile' },
    { label: 'Account', href: '/settings/account' },
    { label: 'Privacy', href: '/settings/privacy' },
    { label: 'Preferences', href: '/settings/preferences' },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-30 bg-transparent backdrop-blur-md">
        <Header />
      </div>
      <div className="min-h-screen bg-black text-white flex pt-20">
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-800 p-6">
          <div className="mb-8">
            <span className="ml-2 font-bold text-lg">Settings</span>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg font-medium text-base transition-all mb-1
                  ${pathname === item.href ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </>
  );
}