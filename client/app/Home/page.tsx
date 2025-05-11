import React from 'react'

import Header from '@/components/Header'
import Hero from '@/components/Hero'
export default function page() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900 relative overflow-hidden">
     
      <Header />

      
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient blobs */}
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl -top-20 -left-20"></div>
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-3xl bottom-40 -right-20"></div>
        <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl top-1/2 left-1/3"></div>
      </div>
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 z-10">
        <div className="flex flex-col items-center space-y-6">
          {/* <Link href="/auth/login" className="text-teal-300 transition-colors duration-300 font-medium bg-white/10 hover:backdrop-blur-md px-8 py-3 rounded-full hover:bg-teal-900 hover:text-teal-200">Login</Link> */}
          {/* <Link href="/auth/register" className="text-teal-200 transition-colors duration-300 font-medium bg-teal-900/70 hover:backdrop-blur-md px-8 py-3 rounded-full hover:bg-teal-900 hover:text-teal-200">Sign up</Link> */}
          <Hero />
        </div>
      </main>
    </ div>
  )
}