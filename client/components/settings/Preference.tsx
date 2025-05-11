'use client';

import { useState } from 'react';

export default function Preference() {
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'dark',
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    autoPlay: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement preferences update logic
    console.log('Preferences update:', preferences);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        {/* Language Selection */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-zinc-400 mb-2">
            Language
          </label>
          <select
            id="language"
            value={preferences.language}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        {/* Theme Selection */}
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-zinc-400 mb-2">
            Theme
          </label>
          <select
            id="theme"
            value={preferences.theme}
            onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Notification Toggles */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Notifications</h3>
          
          <div className="flex items-center justify-between">
            <label htmlFor="emailNotifications" className="text-zinc-400">
              Email Notifications
            </label>
            <button
              type="button"
              onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.emailNotifications ? 'bg-teal-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="pushNotifications" className="text-zinc-400">
              Push Notifications
            </label>
            <button
              type="button"
              onClick={() => setPreferences({ ...preferences, pushNotifications: !preferences.pushNotifications })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.pushNotifications ? 'bg-teal-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Other Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Other Settings</h3>
          
          <div className="flex items-center justify-between">
            <label htmlFor="soundEnabled" className="text-zinc-400">
              Sound Effects
            </label>
            <button
              type="button"
              onClick={() => setPreferences({ ...preferences, soundEnabled: !preferences.soundEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.soundEnabled ? 'bg-teal-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="autoPlay" className="text-zinc-400">
              Auto-play Media
            </label>
            <button
              type="button"
              onClick={() => setPreferences({ ...preferences, autoPlay: !preferences.autoPlay })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.autoPlay ? 'bg-teal-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.autoPlay ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Save Preferences
        </button>
      </div>
    </form>
  );
}
