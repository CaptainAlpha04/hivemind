"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn as clientSignIn } from 'next-auth/react'; // For client components
import { signInWithProvider } from '../actions'; // Keep this for OAuth
import Header from '@/components/Header';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  // Check if user was redirected after registration
  const justRegistered = searchParams.get('registered') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await clientSignIn('credentials', { // Use clientSignIn here
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('Invalid email or password');
        console.error('Login failed:', result.error);
      } else {
        // Success! Redirect to the callbackUrl
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google') => {
    setIsLoading(true);
    try {
      await signInWithProvider(provider, callbackUrl);
    } catch (error) {
      console.error('OAuth error:', error);
      setError('Failed to sign in with provider');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900 relative overflow-hidden">
      {/* Improved Header with glass effect */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        {/* Modern Blur Gradient Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large gradient blobs */}
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-3xl bottom-40 -right-20"></div>
          <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl top-1/2 left-1/3"></div>
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        {/* Login Card - Modernized */}
        <div className="w-full max-w-md z-10 mt-20">
          <div className="glass-card">
            <div className="p-8 relative">
              {/* Small decorative elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-400/10 to-cyan-400/10 rounded-bl-full -z-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-400/10 to-cyan-400/10 rounded-tr-full -z-10"></div>
              
              <h2 className="text-2xl font-semibold text-white mb-2">
                Sign in
              </h2>
              
              <p className="mb-6 text-slate-300 text-sm">
                New to HiveMind?{' '}
                <Link href="/auth/register" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                  Create an account
                </Link>
              </p>

              {justRegistered && (
                <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                  <p className="text-green-300 text-sm">
                    Account created successfully! You can now sign in.
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                      Password
                    </label>
                    <Link href="/auth/forgot-password" className="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors">
                      Forgot password?
                    </Link>
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
                </div>

                <div className="flex items-center">
                  <div className="modern-checkbox">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="sr-only"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className={`w-5 h-5 rounded border transition-colors duration-200 flex items-center justify-center ${rememberMe ? 'bg-teal-500 border-teal-500' : 'border-slate-500 bg-slate-800/50'}`}>
                      {rememberMe && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300 select-none cursor-pointer">
                    Remember me for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="modern-button"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span>Sign in</span>
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