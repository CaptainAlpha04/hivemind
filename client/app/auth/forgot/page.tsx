"use client";
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

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

  // Step 1: Email
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      // Uncomment for real API call
      // const res = await fetch('http://localhost:5001/api/forgot-password/send-code', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      // const data = await res.json();
      // if (res.ok) {
      //   setStep(2);
      //   setSuccess('A reset code has been sent to your email.');
      // } else {
      //   setError(data.message || 'Failed to send code.');
      // }
      // TEMPORARY: Skip API call and proceed to next step
      setStep(2);
      setSuccess('A reset code has been sent to your email.');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Code
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Uncomment for real API call
    // setIsLoading(true);
    // try {
    //   const res = await fetch('http://localhost:5001/api/forgot-password/verify-code', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, code })
    //   });
    //   const data = await res.json();
    //   if (res.ok) {
    //     setStep(3);
    //     setSuccess('Code verified! Please enter your new password.');
    //   } else {
    //     setError(data.message || 'Invalid or expired code.');
    //   }
    // } catch {
    //   setError('Connection error. Please try again.');
    // } finally {
    //   setIsLoading(false);
    // }
    // TEMPORARY: Skip API call and proceed to next step
    setStep(3);
    setSuccess('Code verified! Please enter your new password.');
  };

  // Step 3: New Password
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
      // Uncomment for real API call
      // const response = await fetch('http://localhost:5001/api/forgot-password/reset', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, code, newPassword })
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   setSuccess('Password reset successfully! Redirecting to login...');
      //   setTimeout(() => router.push('/auth/login?reset=true'), 1500);
      // } else {
      //   setError(data.message || 'Failed to reset password. Please try again.');
      // }
      // TEMPORARY: Simulate success
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => router.push('/auth/login?reset=true'), 1500);
    } catch {
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
                    {isLoading ? 'Sending code...' : 'Send Reset Code'}
                  </button>
                </form>
              )}
              {step === 2 && (
                <form onSubmit={handleStep2} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-slate-200 mb-1.5">Reset Code</label>
                    <input
                      id="code"
                      type="text"
                      required
                      className="modern-input"
                      placeholder="Enter the code sent to your email"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="modern-button mt-6 w-full"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button
                    type="button"
                    className="text-teal-400 hover:text-teal-300 text-sm mt-2"
                    onClick={() => setStep(1)}
                  >
                    &larr; Back
                  </button>
                </form>
              )}
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
                    />
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
                    {isLoading ? 'Resetting password...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full py-6 px-6 z-20 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-slate-400 text-sm">© 2025 HiveMind. All rights reserved.</span>
          </div>
          <div className="flex space-x-8">
            <Link href="/privacy" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Terms of Service</Link>
            <Link href="/contact" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
