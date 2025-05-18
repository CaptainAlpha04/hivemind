import React from 'react'
import Navbar from '@/components/ui/Navbar'
import Hero from '@/components/home/Hero'
import Footer from '@/components/ui/Footer'
import Features from '@/components/home/Features'
import AppPreview from '@/components/home/AppPreview'
import AIFeatures from '@/components/home/AIFeatures'
import Cts from '@/components/home/Cts'

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1E]">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[50rem] h-[50rem] rounded-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 blur-[120px] -top-40 -left-40" />
        <div className="absolute w-[50rem] h-[50rem] rounded-full bg-gradient-to-r from-blue-500/5 to-indigo-500/5 blur-[120px] bottom-40 -right-40" />
        <div className="absolute w-[45rem] h-[45rem] rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-[120px] top-1/2 left-1/3" />
      </div>
      
      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <div>
          <Hero />
        </div>
        
        {/* Features Section */}
        <div>
          <Features />
        </div>
        
        {/* App Preview Section */}
        <div>
          <AppPreview />
        </div>
        
        {/* AI Features Section */}
        <div>
          <AIFeatures />
        </div>
        
        {/* CTA Section */}
        <div>
          <Cts />
        </div>
      </main>
      
      {/* Footer */}
      <div>
        <Footer />
      </div>
    </div>
  );
}

export default LandingPage