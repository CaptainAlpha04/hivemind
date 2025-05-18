import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Hero = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center relative pt-20">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-teal-500/30 to-cyan-500/30 blur-3xl -top-20 -left-20 animate-pulse-slow"></div>
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-3xl bottom-20 -right-20 animate-pulse-slow"></div>
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/15 blur-3xl top-1/2 left-1/3 animate-pulse-slow"></div>
        <div className="absolute w-full h-full bg-gradient-to-b from-black/40 to-transparent opacity-50"></div>
      </div>

      {/* Main Content - Enlarged */}
      <div className="container mx-auto px-4 pt-32 pb-16 z-10 flex flex-col items-center justify-center text-center flex-grow">
        {/* App Logo/Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br bg-transparent rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30 rotate-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"></div>
            <Image src="/images/logo.png" alt="HiveMind" width={40} height={40} />
          </div>
        </div>

        {/* Headline - Larger */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
          The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-400 animate-gradient">Social Media App</span>
        </h1>

        {/* Subheading - Enhanced */}
        <p className="text-gray-300 text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
          Connect, share, and engage with a vibrant community. Experience the next generation of social networking with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400 font-semibold">HiveMind</span>.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
          <div className="flex flex-col items-center p-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Stay Connected</h3>
            <p className="text-gray-400">Real-time messaging with friends and communities</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Share Moments</h3>
            <p className="text-gray-400">Share photos and stories with your network</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Discover Content</h3>
            <p className="text-gray-400">Find trending topics and personalized recommendations</p>
          </div>
        </div>

        {/* Call-to-Action Buttons - Enlarged */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/auth/register">
            <button className="relative overflow-hidden bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-zinc-900 px-10 py-5 rounded-full text-xl font-medium transition-all shadow-xl shadow-emerald-500/30 group hover:scale-105 duration-300">
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="bg-white/10 text-slate-100 px-10 py-5 rounded-full text-xl font-medium hover:bg-white/20 transition-all border border-teal-500/30 hover:border-teal-500/50 backdrop-blur-sm hover:scale-105 duration-300">
              Sign In
            </button>
          </Link>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-gray-400">
          <p className="mb-4 text-sm uppercase tracking-wider">Trusted by thousands of users worldwide</p>
          <div className="flex justify-center space-x-8">
            <div className="flex -space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-800"></div>
              <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-800"></div>
              <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-800"></div>
              <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center">
                <span className="text-xs font-medium">+2k</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero