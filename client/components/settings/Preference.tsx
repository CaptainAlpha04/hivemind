'use client';

import { useState } from 'react';
import { Settings, Globe, Palette, Bell, ChevronDown } from 'lucide-react';

export default function Preference() {
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'dark',
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    autoPlay: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-500/20 p-2 rounded-lg">
              <Settings className="h-7 w-7 text-teal-400" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Preferences
            </h2>
          </div>
          <p className="text-zinc-400 font-light">
            Customize your experience with these personal settings
          </p>
          <div className="border-b border-white/5 pt-2"></div>
        </div>

        {/* Glassy Card */}
        <form 
          onSubmit={handleSubmit} 
          className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(20,184,166,0.12)] transition-all duration-300 space-y-8"
        >
          {/* Language Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-medium text-white">Language</span>
            </div>
            <div className="dropdown w-full">
              <label tabIndex={0} className="btn btn-outline w-full justify-between bg-zinc-800 text-zinc-300 border-teal-700 hover:bg-zinc-700">
                {preferences.language === 'en' ? 'English' :
                 preferences.language === 'es' ? 'Spanish' :
                 preferences.language === 'fr' ? 'French' : 'German'}
                <ChevronDown className="h-4 w-4" />
              </label>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-zinc-800 rounded-box w-full">
                <li><a onClick={() => setPreferences({ ...preferences, language: 'en' })}>English</a></li>
                <li><a onClick={() => setPreferences({ ...preferences, language: 'es' })}>Spanish</a></li>
                <li><a onClick={() => setPreferences({ ...preferences, language: 'fr' })}>French</a></li>
                <li><a onClick={() => setPreferences({ ...preferences, language: 'de' })}>German</a></li>
              </ul>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-medium text-white">Theme</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label 
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer
                  ${preferences.theme === 'dark' 
                    ? 'bg-zinc-800 border-teal-500 shadow-md shadow-teal-500/20' 
                    : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                  }`}
                onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
              >
                <div className="w-full h-12 bg-zinc-900 rounded-md mb-2"></div>
                <span className={preferences.theme === 'dark' ? 'text-teal-400' : 'text-zinc-400'}>Dark</span>
                <input 
                  type="radio" 
                  name="theme" 
                  value="dark" 
                  checked={preferences.theme === 'dark'} 
                  onChange={() => {}} 
                  className="radio radio-primary sr-only"
                />
              </label>
              <label 
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer
                  ${preferences.theme === 'light' 
                    ? 'bg-zinc-800 border-teal-500 shadow-md shadow-teal-500/20' 
                    : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                  }`}
                onClick={() => setPreferences({ ...preferences, theme: 'light' })}
              >
                <div className="w-full h-12 bg-zinc-300 rounded-md mb-2"></div>
                <span className={preferences.theme === 'light' ? 'text-teal-400' : 'text-zinc-400'}>Light</span>
                <input 
                  type="radio" 
                  name="theme" 
                  value="light" 
                  checked={preferences.theme === 'light'} 
                  onChange={() => {}} 
                  className="radio radio-primary sr-only"
                />
              </label>
              <label 
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer
                  ${preferences.theme === 'system' 
                    ? 'bg-zinc-800 border-teal-500 shadow-md shadow-teal-500/20' 
                    : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                  }`}
                onClick={() => setPreferences({ ...preferences, theme: 'system' })}
              >
                <div className="w-full h-12 bg-gradient-to-r from-zinc-300 to-zinc-900 rounded-md mb-2"></div>
                <span className={preferences.theme === 'system' ? 'text-teal-400' : 'text-zinc-400'}>System</span>
                <input 
                  type="radio" 
                  name="theme" 
                  value="system" 
                  checked={preferences.theme === 'system'} 
                  onChange={() => {}} 
                  className="radio radio-primary sr-only"
                />
              </label>
            </div>
          </div>

          {/* Notification Toggles */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-medium text-white">Notifications</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Email Notifications</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={preferences.emailNotifications}
                  onChange={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Push Notifications</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={preferences.pushNotifications}
                  onChange={() => setPreferences({ ...preferences, pushNotifications: !preferences.pushNotifications })}
                />
              </div>
            </div>
          </div>

          {/* Other Preferences */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Settings className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-medium text-white">Other Settings</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Sound Effects</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={preferences.soundEnabled}
                  onChange={() => setPreferences({ ...preferences, soundEnabled: !preferences.soundEnabled })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Auto-play Media</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={preferences.autoPlay}
                  onChange={() => setPreferences({ ...preferences, autoPlay: !preferences.autoPlay })}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className={`btn px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-900
                ${saved 
                  ? 'bg-emerald-500 hover:bg-emerald-600 border-none' 
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 border-none shadow-lg shadow-teal-500/20'
                }`}
              disabled={saved}
            >
              <div className="flex items-center gap-2">
                {saved ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Saved</span>
                  </>
                ) : (
                  <span>Save Preferences</span>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}