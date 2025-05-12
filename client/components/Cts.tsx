import { Zap, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Cts() {
  const router = useRouter();
  
  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-teal-500/5 to-slate-900/0"></div>
      <div className="max-w-5xl mx-auto relative">
        <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-3xl p-12 text-center shadow-2xl shadow-teal-500/5">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm mb-6">
            <Zap size={14} className="mr-2" />
            <span>Join Our Community</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent mb-6">
            Ready to Connect with the World?
          </h2>
          <p className="text-slate-300/80 text-xl mb-8 max-w-2xl mx-auto">
            Join millions of users already transforming how they connect, share, and discover content that matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="group relative inline-flex overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-4 font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30"
            >
              Get Started Now
              <ChevronRight size={18} className="ml-2" />
            </button>
            <button className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-4 font-medium text-white transition-all duration-300 hover:bg-slate-800">
              Learn More
            </button>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-white mb-1">10M+</div>
              <div className="text-slate-400">Active Users</div>
            </div>
            <div className="h-12 w-px bg-slate-700/50"></div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-white mb-1">150+</div>
              <div className="text-slate-400">Countries</div>
            </div>
            <div className="h-12 w-px bg-slate-700/50"></div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
              <div className="text-slate-400">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}