"use client";
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Navbar';
import { useRouter } from 'next/navigation';
import FooterAuth from '@/components/auth/FooterAuth';
import { signIn } from 'next-auth/react'; // Import signIn for OAuth

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
  

  // Step 1: Email & Password - Send verification code
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate password
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
      // Send verification code to email
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStep(2);
        setSuccess('A verification code has been sent to your email.');
      } else {
        setError(data.message || 'Failed to send verification code.');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
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
    
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStep(3);
        setSuccess('Email verified! Please complete your profile.');
      } else {
        setError(data.message || 'Invalid or expired verification code.');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('A new verification code has been sent to your email.');
      } else {
        setError(data.message || 'Failed to send verification code.');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Name & Username - Create account
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          username, 
          email, 
          password,
          verificationCode: code // Include verification code
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => router.push('/auth/login?registered=true'), 1500);
      } else {
        setError(data.message || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth Sign Up
  const handleOAuthSignup = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/home' });
    } catch (error) {
      console.error(`Error signing up with ${provider}:`, error);
      setError(`Error signing up with ${provider}. Please try again.`);
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
              <h2 className="text-2xl font-semibold text-white mb-2">
                {step === 1 && "Create Account"}
                {step === 2 && "Verify Email"}
                {step === 3 && "Complete Profile"}
              </h2>
              <p className="mb-6 text-slate-300 text-sm">
                Already have an account?{' '}
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
              
              {/* Step 1: Email & Password */}
              {step === 1 && (
                <div>
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
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">
                        Password
                      </label>
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
                      <p className="text-xs text-slate-400 mt-1">Must be at least 8 characters</p>
                    </div>
                    <div>
                      <label className="input validator input-lg w-full">
                        <i className='fi fi-br-lock text-sm text-gray-500'></i>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          placeholder="Confirm Password"
                          className='text-sm'
                          value={confirmPassword}
                          onChange={(e) => {                         
                            setConfirmPassword(e.target.value);
                            setPasswordMatch(password === e.target.value);   
                          }}            
                        />           
                        {!passwordMatch && confirmPassword && (           
                          <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                        )}
                      </label>
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
                          <span>Sending code...</span>
                        </div>
                      ) : (
                        'Continue'
                      )}
                    </button>
                  </form>

                  <div className="mt-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700/50"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-slate-900/70 text-slate-400 backdrop-blur-sm">Or continue with</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button 
                        className="social-button w-full justify-center"
                        onClick={() => handleOAuthSignup('google')}
                        disabled={isLoading}
                      >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Verification Code */}
              {step === 2 && (
                <form onSubmit={handleStep2} className="space-y-4">
                  <div className="text-center">
                    <p className="text-slate-300 mb-4">
                      We've sent a 6-digit code to{' '}
                      <span className="text-white font-semibold">{email}</span>
                    </p>
                  </div>
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-slate-200 mb-1.5">
                      Verification Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      required
                      maxLength={6}
                      className="modern-input text-center text-lg tracking-wide"
                      placeholder="6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-teal-400 hover:text-teal-300 text-sm font-medium"
                      disabled={isLoading}
                    >
                      Resend code
                    </button>
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
                      'Verify & Continue'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="text-teal-400 hover:text-teal-300 text-sm mt-2 w-full text-center"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    &larr; Back to Email
                  </button>
                </form>
              )}
              
              {/* Step 3: Profile Completion */}
              {step === 3 && (
                <form onSubmit={handleStep3} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-1.5">
                      Full Name
                    </label>
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
                    <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-1.5">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      required
                      className="modern-input"
                      placeholder="What do you want to be called?"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/g, ''))}
                    />
                    <p className="text-xs text-slate-400 mt-1">Only lowercase letters, numbers, and underscores</p>
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
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      'Create account'
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