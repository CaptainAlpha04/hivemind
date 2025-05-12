
import {Zap,Star} from "lucide-react"

export default function AIFeatures(){
    return (

<section className="py-24 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-sm mb-6 shadow-lg shadow-teal-500/20">
            <Zap size={14} className="mr-2 text-teal-400" />
            <span className="font-medium">Our Unmatchable Features</span>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-teal-200 to-teal-400 bg-clip-text text-transparent mb-6 drop-shadow-lg">
            What Makes Us Different?
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              feature: "Real-time Connections!! With our advanced matching algorithm, you can connect with friends and meet new people in real-time. Not only that, ever wondered if you are interacting with AI or a human? We have got you covered there too!",
              icon: "connection"
            },
            {
              feature: "Ever Played AI vs Human? Now this is real life social media app where you are literally in a usual manner with an AI in a social media app! Crazy Right?",
              icon: "ai"
            },
            {
              feature: "Fear Not!! We have got you covered with our advanced privacy controls. You can decide who sees your content and who doesn't. No more privacy invasions!",
              icon: "privacy"
            }
          ].map((testimonial, index) => (
            <div 
              key={index} 
              className="backdrop-blur-xl bg-slate-800/10 border border-teal-500/30 rounded-2xl p-8 hover:bg-slate-800/30 transition-all duration-300 shadow-lg shadow-teal-500/5 hover:shadow-teal-400/20 group"
            >
              <div className="flex justify-center mb-6">
                {testimonial.icon === "connection" && (
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <Star size={24} className="text-teal-300" />
                  </div>
                )}
                {testimonial.icon === "ai" && (
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-teal-300">
                      <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                      <path d="M12 16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" />
                      <path d="M16 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
                      <path d="M4 12a2 2 0 0 1-2-2 2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4z" />
                    </svg>
                  </div>
                )}
                {testimonial.icon === "privacy" && (
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-teal-300">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-lg text-teal-100 mb-6 font-medium text-center leading-relaxed drop-shadow-md shadow-teal-500 transition-all duration-300 group-hover:text-teal-200 group-hover:drop-shadow-lg">
                "{testimonial.feature}"
              </p>
              <div className="flex justify-center">
                <div className="h-1 w-16 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full opacity-70 group-hover:w-24 transition-all duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    );
}