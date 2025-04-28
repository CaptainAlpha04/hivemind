"use client";
import { useState} from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Here you would typically make an API call to your authentication endpoint
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Login attempt with:', { email, password, rememberMe });
      // Redirect on success or handle the response
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background Boxes */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={`box-${i}`}
            className="absolute border border-teal-500/20 bg-teal-500/5 rounded-lg"
            style={{
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              opacity: Math.random() * 0.2 + 0.05,
              animation: `float ${Math.random() * 20 + 10}s infinite alternate ease-in-out`
            }}
          ></div>
        ))}
      </div>

      {/* HiveMind-style Grid Background */}
      <div className="absolute inset-0 opacity-10">
        {/* Grid Lines */}
        <div className="grid grid-cols-12 h-full w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`col-${i}`} className="border-r border-teal-500"></div>
          ))}
        </div>
        <div className="grid grid-rows-12 h-full w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`row-${i}`} className="border-b border-teal-400"></div>
          ))}
        </div>
      </div>

      {/* Subtle Teal Glow Spots */}
      <div className="absolute inset-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={`glow-${i}`}
            className="absolute rounded-full bg-teal-400/20 blur-2xl"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.1,
              animation: `pulse ${Math.random() * 10 + 5}s infinite alternate`
            }}
          ></div>
        ))}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.1; }
          100% { transform: scale(1.2); opacity: 0.3; }
        }
        
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) rotate(${Math.random() * 20}deg); }
          100% { transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) rotate(${Math.random() * -20}deg); }
        }
        
        @keyframes flowBorder {
          0% { border-image-source: linear-gradient(90deg, #2dd4bf, #14b8a6, #0d9488, #14b8a6, #2dd4bf); }
          50% { border-image-source: linear-gradient(90deg, #0d9488, #14b8a6, #2dd4bf, #14b8a6, #0d9488); }
          100% { border-image-source: linear-gradient(90deg, #2dd4bf, #14b8a6, #0d9488, #14b8a6, #2dd4bf); }
        }
        
        .flowing-border {
          border: 3px solid transparent;
          border-radius: 0.5rem;
          background-clip: padding-box;
          position: relative;
        }
        
        .flowing-border::before {
          content: '';
          position: absolute;
          top: -3px; right: -3px; bottom: -3px; left: -3px;
          background: linear-gradient(90deg, #2dd4bf, #14b8a6, #0d9488, #14b8a6, #2dd4bf);
          border-radius: 0.625rem;
          z-index: -1;
          animation: flowBorder 3s linear infinite;
          background-size: 200% 100%;
        }
      `}</style>

      {/* App Title - Similar to HiveMind */}
      <div className="absolute top-10 left-0 right-0 text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-teal-200">
          The Ultimate Authentication Experience
        </h1>
        <p className="text-teal-400 mt-2 text-lg">Secure Login Portal</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md z-10">
        <div className="flowing-border">
          <div className="bg-slate-950/90 backdrop-blur-md p-8 shadow-2xl ">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Sign in to your account
            </h2>

            <p className="mb-6 text-slate-400">
              Or{' '}
              <Link href="/auth/register" className="text-teal-400 hover:text-teal-300">
                create a new account
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-teal-500 focus:ring-teal-500 bg-slate-700 border-slate-600 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                    Remember me
                  </label>
                </div>

                <Link href="/auth/forgot-password" className="text-sm font-medium text-teal-400 hover:text-teal-300">
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 flowing-border relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </span>
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="flowing-border">
                  <div className="bg-slate-700 py-2 px-4 text-white flex justify-center items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                     
                    </svg>
                    Google
                  </div>
                </button>

                <button className="flowing-border">
                  <div className="bg-slate-700 py-2 px-4 text-white flex justify-center items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                     
                    </svg>
                    GitHub
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}