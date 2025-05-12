 import Image from 'next/image';
 import { Zap } from 'lucide-react';
      
      
     
export default function AppPreview(){
    return (
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-teal-500/5 to-slate-900/0"></div>
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm mb-4">
                <Zap size={14} className="mr-2" />
                <span>Seamless Experience</span>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent mb-6">
                Designed for modern social interaction
              </h2>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="md:w-1/2 space-y-8">
                {[
                  {
                    title: "Personalized Feed",
                    description: "Content tailored to your interests and connections"
                  },
                  {
                    title: "Seamless Messaging",
                    description: "Connect with friends through text, voice, and video"
                  },
                  {
                    title: "AI vs Human",
                    description: "A Literal AI vs Human Experience"
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-slate-800/30 transition-colors duration-300">
                    <div className="h-10 w-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">{item.title}</h3>
                      <p className="text-slate-300/80">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="md:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl rounded-full transform -translate-y-1/4 translate-x-1/4 opacity-30"></div>
                <div className="relative">
                  <Image 
                    src="/placeholder.svg?height=600&width=400" 
                    alt="App Interface" 
                    width={400} 
                    height={600} 
                    className="rounded-3xl border border-slate-700/50 shadow-2xl shadow-teal-500/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
    );
}
