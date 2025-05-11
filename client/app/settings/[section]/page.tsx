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

// Map of section names to their display titles and icons
const sectionConfig: Record<string, { title: string; description: string; icon: string }> = {
  profile: {
    title: 'Profile Settings',
    description: 'Manage your personal information and profile details',
    icon: '👤',
  },
  account: {
    title: 'Account Settings',
    description: 'Update your account settings and preferences',
    icon: '🔑',
  },
  preferences: {
    title: 'Preferences',
    description: 'Customize your application preferences and settings',
    icon: '⚙️',
  },
  privacy: {
    title: 'Privacy Settings',
    description: 'Manage your privacy settings and data preferences',
    icon: '🔒',
  },
};

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
  const sectionInfo = sectionConfig[section];

  // Simulate loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [section]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl">{sectionInfo.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {sectionInfo.title}
            </h1>
            <p className="text-zinc-400 mt-1">
              {sectionInfo.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
          <SettingsComponent />
        </div>
      </div>
    </div>
  );
}
