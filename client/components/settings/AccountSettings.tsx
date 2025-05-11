'use client';

import { useState } from 'react';

export default function AccountSettings() {
  const [emailForm, setEmailForm] = useState({
    currentEmail: '',
    newEmail: '',
    password: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email update logic
    console.log('Email update:', emailForm);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password update logic
    console.log('Password update:', passwordForm);
  };

  return (
    <div className="space-y-8">
      {/* Email Change Form */}
      <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
        <h2 className="text-xl font-semibold text-white mb-6">Change Email</h2>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentEmail" className="block text-sm font-medium text-zinc-400 mb-2">
              Current Email
            </label>
            <input
              type="email"
              id="currentEmail"
              value={emailForm.currentEmail}
              onChange={(e) => setEmailForm({ ...emailForm, currentEmail: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium text-zinc-400 mb-2">
              New Email
            </label>
            <input
              type="email"
              id="newEmail"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label htmlFor="emailPassword" className="block text-sm font-medium text-zinc-400 mb-2">
              Current Password
            </label>
            <input
              type="password"
              id="emailPassword"
              value={emailForm.password}
              onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Update Email
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
        <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-400 mb-2">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-400 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-400 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
