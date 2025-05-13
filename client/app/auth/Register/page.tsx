"use client";
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Step 1: Email & Password
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setPasswordMatch(false);
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setIsLoading(true);
    try {

      {/*     // Send code to email
      const res = await fetch('http://localhost:5001/api/users/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setSuccess('A security code has been sent to your email.');
      } else {
        setError(data.message || 'Failed to send code.');
      }*/}
      // TEMPORARY: Skip API call and proceed to next step
      setStep(2);
      setSuccess('A security code has been sent to your email.');
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
    // TEMPORARY: Skip API call and proceed to next step
    setStep(3);
    setSuccess('Email verified! Please complete your profile.');
    // Uncomment below for real API call
    // setIsLoading(true);
    // try {
    //   const res = await fetch('http://localhost:5001/api/users/verify-code', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, code })
    //   });
    //   const data = await res.json();
    //   if (res.ok) {
    //     setStep(3);
    //     setSuccess('Email verified! Please complete your profile.');
    //   } else {
    //     setError(data.message || 'Invalid or expired code.');
    //   }
    // } catch {
    //   setError('Connection error. Please try again.');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  // Step 3: Name & Username
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => router.push('/auth/login?registered=true'), 1500);
      } else {
        setError(data.message || 'Failed to create account. Please try again.');
      }
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
              <h2 className="text-2xl font-semibold text-white mb-2">Sign Up</h2>
              <p className="mb-6 text-slate-300 text-sm">
                Already have an account?{' '}
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
                <label className="input validator input-lg w-full">
                    <i className='fi fi-br-lock text-sm text-gray-500'></i>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="Password"
                      className='text-sm'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                  <div>
                  <label className="input validator input-lg w-full">
                    <i className='fi fi-br-lock text-sm text-gray-500'></i>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="Confirm Password"
                      className='text-sm'
                      value={confirmPassword}
                      onChange={(e) => {                         
                        setConfirmPassword(e.target.value);
                        setPasswordMatch(password === e.target.value);   
                             }}            />           
                       {!passwordMatch && confirmPassword && (           
                      <p className="text-xs text-red-400 mt-1">Passwords do not match</p>      )}
                   
                  </label>
                     
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !passwordMatch}
                    className="modern-button mt-6 w-full"
                  >
                    {isLoading ? 'Sending code...' : 'Continue'}
                  </button>
                </form>
              )}
              {step === 2 && (
                <form onSubmit={handleStep2} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-slate-200 mb-1.5">Security Code</label>
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
                    <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-1.5">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      className="modern-input"
                      placeholder="Please enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-1.5">Username</label>
                    <input
                      id="username"
                      type="text"
                      required
                      className="modern-input"
                      placeholder="What do you want to be called?"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <label htmlFor="agree-terms" className="flex items-center mt-4 cursor-pointer select-none">
                    <div className="modern-checkbox">
                      <input
                        id="agree-terms"
                        type="checkbox"
                        className="sr-only"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        required
                      />
                      <div className={`w-5 h-5 rounded border transition-colors duration-200 flex items-center justify-center ${agreeToTerms ? 'bg-teal-500 border-teal-500' : 'border-slate-500 bg-slate-800/50'}`}>
                        {agreeToTerms && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 block text-sm text-slate-300">
                      I agree to the <Link href="/terms" className="text-teal-400 hover:text-teal-300">Terms of Service</Link> and <Link href="/privacy" className="text-teal-400 hover:text-teal-300">Privacy Policy</Link>
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="modern-button mt-6 w-full"
                  >
                    {isLoading ? 'Creating account...' : 'Create account'}
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