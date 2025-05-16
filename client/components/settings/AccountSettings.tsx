'use client';

import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function AccountSettings() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

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
  
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState('');
  
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session?.user?.id}/email`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentEmail: emailForm.currentEmail,
        email: emailForm.newEmail,
      }),
    })

    if (res.ok) {
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
    } else {
      console.error('Failed to update email');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session?.user?.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setPasswordSuccess(true);
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordStrength(0);
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        setPasswordError(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('An error occurred while updating your password');
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPasswordForm({ ...passwordForm, newPassword });
    validatePassword(newPassword);
  };

  const getUserData = async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    // Fetch user data from the server
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
      'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      console.log('User data:', data);
      setEmailForm({ ...emailForm, currentEmail: data.email });
      setPasswordForm({ ...passwordForm, currentPassword: data.password });
    } else {
      console.error('Failed to fetch user data');
    }
  }

  if (status === 'authenticated' && loading) {
    getUserData();
    setLoading(false);
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-500/20 p-2 rounded-lg">
              <User className="h-7 w-7 text-teal-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Account Settings
            </h2>
          </div>
          <p className="text-zinc-400 font-light">
            Manage your account credentials and security settings
          </p>
          <div className="border-b border-white/5 pt-2"></div>
        </div>

        {/* Email Change Form */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-teal-500/10 p-2 rounded-lg">
              <Mail className="h-5 w-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Change Email</h2>
          </div>
          
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
            <label className="input validator input-lg w-full">
                    <i className='fi fi-br-at text-sm text-gray-500'></i>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Old Email address"
                      className='text-sm'
                      value={emailForm.currentEmail}
                      onChange={(e) => setEmailForm({ ...emailForm, currentEmail: e.target.value })}
                    />
                  </label>
            </div>
            
            <div className="space-y-2">
            <label className="input validator input-lg w-full">
                    <i className='fi fi-br-at text-sm text-gray-500'></i>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="New Email address"
                      className='text-sm'
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                    />
                  </label>
            </div>
            
            <div className="space-y-2">
            <label className="input validator input-lg w-full">
                    <i className='fi fi-br-lock text-sm text-gray-500'></i>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="Password"
                      className='text-sm'
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                    />
                  </label>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className={`btn px-6 py-2 rounded-lg font-medium text-white
                  ${emailSuccess 
                    ? 'bg-emerald-500 hover:bg-emerald-600' 
                    : 'bg-teal-500 hover:bg-teal-600'
                  }`}
              >
                <div className="flex items-center gap-2">
                  {emailSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
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
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-teal-500/10 p-2 rounded-lg">
              <Lock className="h-5 w-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Change Password</h2>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="input validator input-lg w-full flex items-center">
                <i className='fi fi-br-lock text-sm text-gray-500'></i>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  placeholder="Current Password"
                  className='text-sm flex-1 bg-transparent border-none outline-none'
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
                <button 
                  type="button"
                  className="ml-2 text-zinc-400 hover:text-white"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </label>
            </div>

            <div className="space-y-2">
              <label className="input validator input-lg w-full flex items-center">
                <i className='fi fi-br-lock text-sm text-gray-500'></i>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="New Password"
                  className='text-sm flex-1 bg-transparent border-none outline-none'
                  value={passwordForm.newPassword}
                  onChange={handleNewPasswordChange}
                />
                <button 
                  type="button"
                  className="ml-2 text-zinc-400 hover:text-white"
                  tabIndex={-1}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </label>
              {passwordForm.newPassword && (
                <div className="flex gap-1 mt-1">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 flex-1 rounded-full ${
                        i < passwordStrength 
                          ? passwordStrength === 1 
                            ? 'bg-red-500' 
                            : passwordStrength === 2 
                              ? 'bg-amber-500' 
                              : passwordStrength === 3 
                                ? 'bg-teal-500'
                                : 'bg-teal-500'
                          : 'bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="input validator input-lg w-full flex items-center">
                <i className='fi fi-br-lock text-sm text-gray-500'></i>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirm New Password"
                  className='text-sm flex-1 bg-transparent border-none outline-none'
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
                <button 
                  type="button"
                  className="ml-2 text-zinc-400 hover:text-white"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </label>
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Passwords don&apos;t match</span>
                </div>
              )}
            </div>
            
            {passwordError && (
              <div className="flex items-center gap-1 text-red-400 text-sm mt-2">
                <AlertCircle className="w-4 h-4" />
                <span>{passwordError}</span>
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className={`btn px-6 py-2 rounded-lg font-medium text-white
                  ${passwordSuccess 
                    ? 'bg-emerald-500 hover:bg-emerald-600' 
                    : 'bg-teal-500 hover:bg-teal-600'
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
                      <Check className="w-4 h-4" />
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
    </div>
  );
}