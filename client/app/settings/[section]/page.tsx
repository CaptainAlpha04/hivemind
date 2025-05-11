'use client';

import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProfileSettings from '@/components/settings/ProfileSettings';
import AccountSettings from '@/components/settings/AccountSettings';
import Preference from '@/components/settings/Preference';
import Privacy from '@/components/settings/Privacy';

interface SettingsPageProps {
  params: {
    section: string;
  };
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const { section } = params;
  const [isLoading, setIsLoading] = useState(true);

  // Map of valid sections to their components
  const settingsComponents: Record<string, React.ComponentType> = {
    profile: ProfileSettings,
    account: AccountSettings,
    preferences: Preference,
    privacy: Privacy,
  };

  // Check if the section is valid
  if (!settingsComponents[section]) {
    notFound();
  }

  const SettingsComponent = settingsComponents[section];

  // Simulate loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [section]);

  return (
    <div className="w-full animate-fade-in">
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}> 
        <div className="bg-zinc-800/80 rounded-2xl p-8 border border-zinc-700 shadow-lg max-w-3xl mx-auto">
          <SettingsComponent />
        </div>
      </div>
    </div>
  );
}
 