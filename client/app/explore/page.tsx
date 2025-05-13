import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white relative overflow-hidden">
      <Header />
      <main className="pt-24 pb-16 flex-1 w-full relative">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">Explore</h1>
          <div className="mb-8">
            <input type="text" placeholder="Search topics, people, or posts..." className="input input-bordered w-full bg-base-200/80" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card bg-base-200/80 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="card-body">
                  <h2 className="card-title text-lg text-teal-300">Trending Topic #{i + 1}</h2>
                  <p className="text-slate-300">This is a placeholder for a trending topic, person, or post. Replace with real data.</p>
                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-sm btn-primary">View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 