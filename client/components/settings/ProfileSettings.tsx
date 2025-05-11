'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProfileSettings() {
  // Example state (replace with real data/fetching in production)
  const [displayName, setDisplayName] = useState('maad9110');
  const [pronouns, setPronouns] = useState('');
  const [about, setAbout] = useState('');
  const [avatar, setAvatar] = useState('/default-avatar.png');
  const [bannerColor, setBannerColor] = useState('#06b6d4');

  return (
    <div className="max-w-5xl mx-auto mt-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Profiles</h1>
        <button
          className="flex flex-col items-center text-zinc-400 hover:text-white transition"
          title="Close"
        >
          <span className="text-2xl">✕</span>
          <span className="text-xs mt-1">ESC</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-zinc-800 mb-6">
        <button className="pb-2 border-b-2 border-teal-400 text-teal-300 font-medium">Main Profile</button>
        <button className="pb-2 text-zinc-400 hover:text-white transition">Per-server Profiles</button>
      </div>

      {/* Main Content: Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Editable Fields */}
        <div className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          {/* Pronouns */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Pronouns</label>
            <input
              type="text"
              value={pronouns}
              onChange={e => setPronouns(e.target.value)}
              placeholder="Add your pronouns"
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          {/* Avatar */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-zinc-300 font-medium">Avatar</label>
              <span className="ml-2 px-2 py-0.5 rounded bg-rose-500 text-xs text-white font-bold">NEW</span>
            </div>
            <div className="text-zinc-400 text-xs mb-2">You can now access up to 6 of your most <a href="#" className="text-teal-400 underline">recent avatars</a></div>
            <div className="flex items-center gap-4">
              <Image src={avatar} alt="Avatar" width={48} height={48} className="rounded-full border border-zinc-700" />
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-900 font-semibold shadow hover:opacity-90 transition"
              >
                Change Avatar
              </button>
            </div>
          </div>
          {/* Avatar Decoration */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Avatar Decoration</label>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-900 font-semibold shadow hover:opacity-90 transition"
            >
              Change Decoration
            </button>
          </div>
          {/* Nameplate */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-zinc-300 font-medium">Nameplate</label>
              <span className="ml-2 px-2 py-0.5 rounded bg-rose-500 text-xs text-white font-bold">NEW</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-900 font-semibold shadow hover:opacity-90 transition"
            >
              Change Nameplate
            </button>
          </div>
          {/* Profile Effect */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Profile Effect</label>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-900 font-semibold shadow hover:opacity-90 transition"
            >
              Change Effect
            </button>
          </div>
          {/* Banner Color */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Banner Color</label>
            <button
              type="button"
              className="w-10 h-10 rounded-lg border-2 border-zinc-700 flex items-center justify-center"
              style={{ background: bannerColor }}
              onClick={() => setBannerColor('#06b6d4')}
            >
              <svg width="20" height="20" fill="none"><rect width="20" height="20" rx="4" fill="#fff" fillOpacity="0.2" /></svg>
            </button>
          </div>
          {/* About Me */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1">About Me</label>
            <div className="text-zinc-400 text-xs mb-2">You can use markdown and links if you'd like.</div>
            <textarea
              value={about}
              onChange={e => setAbout(e.target.value)}
              rows={4}
              maxLength={190}
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            />
            <div className="text-right text-xs text-zinc-500">{190 - about.length}</div>
          </div>
        </div>

        {/* Right: Profile Preview */}
        <div>
          <div className="bg-zinc-900/80 rounded-2xl shadow-lg border border-zinc-800 overflow-hidden p-6 flex flex-col items-center">
            {/* Banner */}
            <div
              className="w-full h-24 rounded-xl mb-[-2.5rem]"
              style={{ background: bannerColor }}
            />
            {/* Avatar */}
            <div className="relative -top-10 mb-2">
              <Image src={avatar} alt="Avatar" width={80} height={80} className="rounded-full border-4 border-zinc-950 bg-zinc-800" />
            </div>
            {/* Display Name and Username */}
            <div className="text-center mt-2">
              <div className="text-xl font-bold text-white">{displayName}</div>
              <div className="text-zinc-400 text-sm">hammadahmed9110</div>
            </div>
            {/* Example Button */}
            <button className="mt-4 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition">
              Example Button
            </button>
          </div>
          {/* Nameplate Preview */}
          <div className="mt-6">
            <div className="flex items-center gap-2 bg-zinc-800/80 rounded-lg px-4 py-2">
              <Image src={avatar} alt="Avatar" width={24} height={24} className="rounded-full" />
              <span className="text-white font-medium">{displayName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
