import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const exploreData = [
  {
    title: "AI Art Revolution",
    description: "Discover how generative AI is transforming the world of digital art and creativity.",
    button: "View"
  },
  {
    title: "Viral: #TechForGood",
    description: "See how people are using technology to make a positive impact in their communities.",
    button: "View"
  },
  {
    title: "Meet: Jane Doe",
    description: "Top creator this week! Jane shares her journey in building a supportive online community.",
    button: "View"
  },
  {
    title: "Debate: AI vs Human",
    description: "Join the hottest discussion: Can AI ever truly replace human connection?",
    button: "Join"
  },
  {
    title: "Trending: Virtual Hangouts",
    description: "Explore the best virtual spaces to connect, play, and collaborate with friends.",
    button: "Explore"
  },
  {
    title: "Spotlight: Mental Health",
    description: "Resources and stories to support your well-being in the digital age.",
    button: "Learn More"
  }
];

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
            {exploreData.map((item, i) => (
              <div key={i} className="card bg-base-200/80 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="card-body">
                  <h2 className="card-title text-lg text-teal-300">{item.title}</h2>
                  <p className="text-slate-300">{item.description}</p>
                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-sm btn-primary">{item.button}</button>
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