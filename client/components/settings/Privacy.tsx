'use client';

import { useState } from 'react';
import { Shield, Eye, Globe, Users, ChevronDown } from 'lucide-react';

export default function Privacy() {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    showLastSeen: true,
    allowTagging: true,
    allowMessages: 'everyone',
    dataCollection: true,
    analytics: true,
    closeFriends: false,
    blocked: false,
    hideStory: false,
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
              <Shield className="h-7 w-7 text-teal-400" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Privacy Settings
            </h2>
          </div>
          <p className="text-zinc-400 font-light">
            Control your privacy and data preferences
          </p>
          <div className="border-b border-white/5 pt-2"></div>
        </div>

        {/* Glassy Card */}
        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(20,184,166,0.12)] transition-all duration-300 space-y-8"
        >
          {/* Profile Visibility */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-medium text-white">Profile Visibility</span>
            </div>
            <div className="dropdown w-full">
              <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between bg-zinc-800 text-zinc-300 border-teal-700 hover:bg-zinc-700">
                {privacySettings.profileVisibility.charAt(0).toUpperCase() + privacySettings.profileVisibility.slice(1)}
                <ChevronDown className="h-4 w-4" />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-zinc-800 rounded-box w-full">
                <li><a onClick={() => setPrivacySettings({ ...privacySettings, profileVisibility: 'public' })}>Public</a></li>
                <li><a onClick={() => setPrivacySettings({ ...privacySettings, profileVisibility: 'friends' })}>Friends Only</a></li>
                <li><a onClick={() => setPrivacySettings({ ...privacySettings, profileVisibility: 'private' })}>Private</a></li>
              </ul>
            </div>
          </div>

          {/* Activity Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-medium text-white">Activity Status</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Show Online Status</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary [--tglbg:theme(colors.teal.600)] [--tglchecked:theme(colors.teal.500)]"
                  checked={privacySettings.showOnlineStatus}
                  onChange={() => setPrivacySettings({ ...privacySettings, showOnlineStatus: !privacySettings.showOnlineStatus })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Show Last Seen</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary [--tglbg:theme(colors.teal.600)] [--tglchecked:theme(colors.teal.500)]"
                  checked={privacySettings.showLastSeen}
                  onChange={() => setPrivacySettings({ ...privacySettings, showLastSeen: !privacySettings.showLastSeen })}
                />
              </div>
            </div>
          </div>

          {/* Interaction Settings */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-medium text-white">Interaction</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Allow Tagging</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary [--tglbg:theme(colors.teal.600)] [--tglchecked:theme(colors.teal.500)]"
                  checked={privacySettings.allowTagging}
                  onChange={() => setPrivacySettings({ ...privacySettings, allowTagging: !privacySettings.allowTagging })}
                />
              </div>
              <div className="form-control w-full">
                <div className="dropdown w-full">
                  <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between bg-zinc-800 text-zinc-300 border-teal-700 hover:bg-zinc-700">
                    {privacySettings.allowMessages === 'everyone' ? 'Everyone can message you' : 
                     privacySettings.allowMessages === 'friends' ? 'Only friends can message you' : 
                     'No one can message you'}
                    <ChevronDown className="h-4 w-4" />
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-zinc-800 rounded-box w-full">
                    <li><a onClick={() => setPrivacySettings({ ...privacySettings, allowMessages: 'everyone' })}>Everyone can message you</a></li>
                    <li><a onClick={() => setPrivacySettings({ ...privacySettings, allowMessages: 'friends' })}>Only friends can message you</a></li>
                    <li><a onClick={() => setPrivacySettings({ ...privacySettings, allowMessages: 'none' })}>No one can message you</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Privacy Options */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-medium text-white">More Privacy Options</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Close Friends</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary [--tglbg:theme(colors.teal.600)] [--tglchecked:theme(colors.teal.500)]"
                  checked={privacySettings.closeFriends}
                  onChange={() => setPrivacySettings({ ...privacySettings, closeFriends: !privacySettings.closeFriends })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Blocked</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary [--tglbg:theme(colors.teal.600)] [--tglchecked:theme(colors.teal.500)]"
                  checked={privacySettings.blocked}
                  onChange={() => setPrivacySettings({ ...privacySettings, blocked: !privacySettings.blocked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Hide story and live</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary [--tglbg:theme(colors.teal.600)] [--tglchecked:theme(colors.teal.500)]"
                  checked={privacySettings.hideStory}
                  onChange={() => setPrivacySettings({ ...privacySettings, hideStory: !privacySettings.hideStory })}
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
                  <span>Save Changes</span>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}