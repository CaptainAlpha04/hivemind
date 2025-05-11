'use client';

import { useState } from 'react';

export default function Privacy() {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    showLastSeen: true,
    allowTagging: true,
    allowMessages: 'everyone',
    dataCollection: true,
    analytics: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement privacy settings update logic
    console.log('Privacy settings update:', privacySettings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        {/* Profile Visibility */}
        <div>
          <label htmlFor="profileVisibility" className="block text-sm font-medium text-zinc-400 mb-2">
            Profile Visibility
          </label>
          <select
            id="profileVisibility"
            value={privacySettings.profileVisibility}
            onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="public">Public</option>
            <option value="friends">Friends Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Activity Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Activity Status</h3>
          
          <div className="flex items-center justify-between">
            <label htmlFor="showOnlineStatus" className="text-zinc-400">
              Show Online Status
            </label>
            <button
              type="button"
              onClick={() => setPrivacySettings({ ...privacySettings, showOnlineStatus: !privacySettings.showOnlineStatus })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.showOnlineStatus ? 'bg-teal-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="showLastSeen" className="text-zinc-400">
              Show Last Seen
            </label>
            <button
              type="button"
              onClick={() => setPrivacySettings({ ...privacySettings, showLastSeen: !privacySettings.showLastSeen })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.showLastSeen ? 'bg-teal-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.showLastSeen ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Interaction Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Interaction Settings</h3>
          
          <div className="flex items-center justify-between">
            <label htmlFor="allowTagging" className="text-zinc-400">
              Allow Tagging
            </label>
            <button
              type="button"
              onClick={() => setPrivacySettings({ ...privacySettings, allowTagging: !privacySettings.allowTagging })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.allowTagging ? 'bg-teal-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.allowTagging ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label htmlFor="allowMessages" className="block text-sm font-medium text-zinc-400 mb-2">
              Who Can Message You
            </label>
            <select
              id="allowMessages"
              value={privacySettings.allowMessages}
              onChange={(e) => setPrivacySettings({ ...privacySettings, allowMessages: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="none">No One</option>
            </select>
          </div>
        </div>

        {/* Data Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Data Settings</h3>
          
          <div className="flex items-center justify-between">
            <label htmlFor="dataCollection" className="text-zinc-400">
              Data Collection
            </label>
            <button
              type="button"
              onClick={() => setPrivacySettings({ ...privacySettings, dataCollection: !privacySettings.dataCollection })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.dataCollection ? 'bg-teal-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.dataCollection ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="analytics" className="text-zinc-400">
              Analytics
            </label>
            <button
              type="button"
              onClick={() => setPrivacySettings({ ...privacySettings, analytics: !privacySettings.analytics })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.analytics ? 'bg-teal-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.analytics ? 'translate-x-6' : 'translate-x-1'
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
          Save Privacy Settings
        </button>
      </div>
    </form>
  );
}
