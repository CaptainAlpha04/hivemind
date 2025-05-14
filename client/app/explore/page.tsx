import React from 'react';
import Header from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

const exploreData = [
  {
    title: "Tesla Autopilot Crashes",
    description: "Tesla’s Autopilot feature has been involved in several crashes. Despite being marketed as a driver assistance system, drivers have relied too heavily on it, leading to accidents and fatalities.",
    button: "View"
  },
  {
    title: "Generative AI Blunders",
    description: "In 2025, several generative AI models produced inappropriate and biased content, raising concerns about the ethical implications and the need for better content moderation.",
    button: "View"
  },
  {
    title: "Meet: Jane Doe",
    description: "Finally!! The identity of Joh Doe Finally Disclosed. Guess What!!! He is a humanoid currently run by OpenAI",
    button: "View"
  },
  {
    title: "Debate: AI vs Human",
    description: "Join the hottest discussion: Can AI ever truly replace human connection?",
    button: "Join"
  },
  {
    title: "Amazon’s Recruitment Tool",
    description: "Amazon developed an AI recruitment tool that was found to be biased against women. The tool penalized resumes that included the word “women’s,” leading to gender discrimination in hiring practices.",
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