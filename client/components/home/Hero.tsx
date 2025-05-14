import React from 'react'
import Link from 'next/link'



const Hero = () => {
  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl -top-40 -left-40 animate-pulse-slow"></div>
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-3xl bottom-40 -right-40 animate-pulse-slow"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 z-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-400 animate-gradient">Social Media App</span>
        </h1>
        <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Connect, share, and engage with a vibrant community. Experience the next generation of social networking with HiveMind.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register">
            <button className="relative overflow-hidden bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-zinc-900 px-8 py-4 rounded-full text-lg font-medium transition-all shadow-lg shadow-emerald-500/30 group">
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="bg-white/10 text-slate-100 px-8 py-4 rounded-full text-lg font-medium hover:bg-white/20 transition-colors border border-teal-500/30 hover:border-teal-500/50 backdrop-blur-sm">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Hero