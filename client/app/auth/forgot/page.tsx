"use client";
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Navbar';
import { useRouter } from 'next/navigation';
import FooterAuth from '@/components/auth/FooterAuth';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  
  // API base URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Step 1: Request password reset code
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStep(2);
        setSuccess('If your email is registered, you will receive a reset code shortly.');
      } else {
        setError(data.message || 'Failed to send reset code.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify reset code
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/users/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStep(3);
        setSuccess('Code verified! Please enter your new password.');
      } else {
        setError(data.message || 'Invalid or expired code.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set new password
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmNewPassword) {
      setPasswordMatch(false);
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => router.push('/auth/login?reset=true'), 1500);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900 relative overflow-hidden">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-3xl bottom-40 -right-20"></div>
          <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl top-1/2 left-1/3"></div>
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="w-full max-w-md z-10 mt-24">
          <div className="glass-card">
            <div className="p-8 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-400/10 to-cyan-400/10 rounded-bl-full -z-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-400/10 to-cyan-400/10 rounded-tr-full -z-10"></div>
              <h2 className="text-2xl font-semibold text-white mb-2">Forgot Password</h2>
              <p className="mb-6 text-slate-300 text-sm">
                Remembered your password?{' '}
                <Link href="/auth/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
              
              {/* Progress indicator */}
              <div className="flex items-center mb-6">
                <div className={`h-2 w-1/3 ${step >= 1 ? 'bg-teal-500' : 'bg-slate-700'} rounded-l`}></div>
                <div className={`h-2 w-1/3 ${step >= 2 ? 'bg-teal-500' : 'bg-slate-700'}`}></div>
                <div className={`h-2 w-1/3 ${step >= 3 ? 'bg-teal-500' : 'bg-slate-700'} rounded-r`}></div>
              </div>
              
              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                  <p className="text-emerald-300 text-sm">{success}</p>
                </div>
              )}
              
              {/* Step 1: Enter Email */}
              {step === 1 && (
                <form onSubmit={handleStep1} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1.5">
                      Email address
                    </label>
                    <label className="input validator input-lg w-full">
                      <i className='fi fi-br-at text-sm text-gray-500'></i>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="Email address"
                        className='text-sm'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="modern-button mt-6 w-full"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending code...</span>
                      </div>
                    ) : (
                      'Send Reset Code'
                    )}
                  </button>
                </form>
              )}
              
              {/* Step 2: Enter Reset Code */}
              {step === 2 && (
                <form onSubmit={handleStep2} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-slate-200 mb-1.5">Reset Code</label>
                    <input
                      id="code"
                      type="text"
                      required
                      className="modern-input text-center text-lg tracking-wide"
                      placeholder="Enter the 6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      maxLength={6}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="modern-button mt-6 w-full"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      'Verify Code'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="text-teal-400 hover:text-teal-300 text-sm mt-2 w-full text-center"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    &larr; Back
                  </button>
                </form>
              )}
              
              {/* Step 3: Reset Password */}
              {step === 3 && (
                <form onSubmit={handleStep3} className="space-y-4">
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-slate-200 mb-1.5">New Password</label>
                    <input
                      id="new-password"
                      type="password"
                      required
                      className="modern-input"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordMatch(e.target.value === confirmNewPassword);
                      }}
                      minLength={8}
                    />
                    <p className="text-xs text-slate-400 mt-1">Password must be at least 8 characters</p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-200 mb-1.5">Confirm New Password</label>
                    <input
                      id="confirm-new-password"
                      type="password"
                      required
                      className="modern-input"
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => {
                        setConfirmNewPassword(e.target.value);
                        setPasswordMatch(newPassword === e.target.value);
                      }}
                    />
                    {!passwordMatch && confirmNewPassword && (
                      <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !passwordMatch}
                    className="modern-button mt-6 w-full"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Resetting password...</span>
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="text-teal-400 hover:text-teal-300 text-sm mt-2 w-full text-center"
                    onClick={() => setStep(2)}
                    disabled={isLoading}
                  >
                    &larr; Back
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <FooterAuth />
    </div>
  );
}
