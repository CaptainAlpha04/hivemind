'use client';

import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

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

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Password validation
  const validatePassword = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement email update logic
    console.log('Email update:', emailForm);
    
    // Show success message
    setEmailSuccess(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setEmailSuccess(false);
    }, 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement password update logic
    console.log('Password update:', passwordForm);
    
    // Show success message
    setPasswordSuccess(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setPasswordSuccess(false);
    }, 3000);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPasswordForm({ ...passwordForm, newPassword });
    validatePassword(newPassword);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-500/20 p-2 rounded-lg">
              <User className="h-7 w-7 text-teal-400" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Account Settings
            </h2>
          </div>
          <p className="text-zinc-400 font-light">
            Manage your account credentials and security settings
          </p>
          <div className="border-b border-white/5 pt-2"></div>
        </div>

        {/* Email Change Form */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(20,184,166,0.12)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-teal-500/10 p-2 rounded-lg">
              <Mail className="h-5 w-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Change Email</h2>
          </div>
          
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div className="group">
              <label htmlFor="currentEmail" className="block text-sm font-medium text-zinc-300 mb-2">
                Current Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="currentEmail"
                  value={emailForm.currentEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, currentEmail: e.target.value })}
                  className="input input-bordered w-full bg-zinc-800/70 border-teal-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="your.current@email.com"
                />
              </div>
            </div>
            
            <div className="group">
              <label htmlFor="newEmail" className="block text-sm font-medium text-zinc-300 mb-2">
                New Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="newEmail"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                  className="input input-bordered w-full bg-zinc-800/70 border-teal-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="your.new@email.com"
                />
              </div>
            </div>
            
            <div className="group">
              <label htmlFor="emailPassword" className="block text-sm font-medium text-zinc-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="emailPassword"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  className="input input-bordered w-full bg-zinc-800/70 border-teal-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className={`btn px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-900
                  ${emailSuccess 
                    ? 'bg-emerald-500 hover:bg-emerald-600 border-none' 
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 border-none shadow-lg shadow-teal-500/20'
                  }`}
              >
                <div className="flex items-center gap-2">
                  {emailSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Email Updated</span>
                    </>
                  ) : (
                    <span>Update Email</span>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Password Change Form */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Lock className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Change Password</h2>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="group">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input input-bordered w-full bg-zinc-800/70 border-emerald-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-12"
                  placeholder="••••••••••••"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="group">
              <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handleNewPasswordChange}
                  className="input input-bordered w-full bg-zinc-800/70 border-emerald-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-12"
                  placeholder="••••••••••••"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {passwordForm.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mt-1">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < passwordStrength 
                            ? passwordStrength === 1 
                              ? 'bg-red-500' 
                              : passwordStrength === 2 
                                ? 'bg-amber-500' 
                                : passwordStrength === 3 
                                  ? 'bg-emerald-500'
                                  : 'bg-emerald-500'
                            : 'bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1 text-zinc-400">
                    {passwordStrength === 0 && "Very weak password"}
                    {passwordStrength === 1 && "Weak password"}
                    {passwordStrength === 2 && "Medium password"}
                    {passwordStrength === 3 && "Strong password"}
                    {passwordStrength === 4 && "Very strong password"}
                  </p>
                </div>
              )}
            </div>
            
            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input input-bordered w-full bg-zinc-800/70 border-emerald-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-12"
                  placeholder="••••••••••••"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Passwords don&apos;t match</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className={`btn px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-900
                  ${passwordSuccess 
                    ? 'bg-emerald-500 hover:bg-emerald-600 border-none' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-none shadow-lg shadow-emerald-500/20'
                  }`}
                disabled={
                  !passwordForm.currentPassword || 
                  !passwordForm.newPassword || 
                  !passwordForm.confirmPassword || 
                  passwordForm.newPassword !== passwordForm.confirmPassword
                }
              >
                <div className="flex items-center gap-2">
                  {passwordSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Password Updated</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Background Elements */}
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}