"use client";
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (confirmPassword) {
      setPasswordMatch(e.target.value === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(password === e.target.value);
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      console.error('Error during OAuth sign-in:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset any previous errors
    setError('');

    // Form validation
    if (password !== confirmPassword) {
      setPasswordMatch(false);
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Account created successfully!');
        router.push('/auth/login?registered=true');
      } else {
        // Handle specific error cases
        if (response.status === 400 && data.message.includes('Email already in use')) {
          setError('This email is already registered. Try logging in instead.');
        } else if (response.status === 400) {
          setError(data.message || 'Please check your information and try again.');
        } else if (response.status === 429) {
          setError('Too many attempts. Please try again later.');
        } else {
          setError(data.message || 'Failed to create account. Please try again.');
        }
        console.error('Registration failed:', data.message);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900 relative overflow-hidden">
      {/* Improved Header with glass effect */}
      <Header />
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {/* Modern Blur Gradient Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large gradient blobs */}
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-3xl bottom-40 -right-20"></div>
          <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl top-1/2 left-1/3"></div>
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        {/* Signup Card - Modernized */}
        <div className="w-full max-w-md z-10 mt-24">
          <div className="glass-card">
            <div className="p-8 relative">
              {/* Small decorative elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-400/10 to-cyan-400/10 rounded-bl-full -z-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-400/10 to-cyan-400/10 rounded-tr-full -z-10"></div>
              
              <h2 className="text-2xl font-semibold text-white mb-2">
                Sign Up
              </h2>
              
              <p className="mb-6 text-slate-300 text-sm">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
                
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      className="modern-input pl-10"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      className="modern-input pl-10"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      className="modern-input pl-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Password must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      className={`modern-input pl-10 ${!passwordMatch && confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                    />
                  </div>
                  {!passwordMatch && confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center mt-4">
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
                  <label htmlFor="agree-terms" className="ml-2 block text-sm text-slate-300 select-none cursor-pointer">
                    I agree to the <Link href="/terms" className="text-teal-400 hover:text-teal-300">Terms of Service</Link> and <Link href="/privacy" className="text-teal-400 hover:text-teal-300">Privacy Policy</Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !passwordMatch}
                  className="modern-button mt-6"
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
                    <span>Create account</span>
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
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={isLoading}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Clean and Modern */}
      <footer className="w-full py-6 px-6 z-20 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-slate-400 text-sm">© 2025 HiveMind. All rights reserved.</span>
          </div>
          <div className="flex space-x-8">
            <Link href="/privacy" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Terms</Link>
            <Link href="/help" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}