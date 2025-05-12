import { Zap, Users, BarChart2, Shield } from 'lucide-react';


export default function features(){
return (
 <section className="py-24 px-4">
 <div className="max-w-7xl mx-auto">
   <div className="text-center mb-16 max-w-3xl mx-auto">
     <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm mb-4">
       <Zap size={14} className="mr-2" />
       <span>Powerful Features</span>
     </div>
     <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent mb-6">
       Everything you need to connect
     </h2>
     <p className="text-slate-300/80 text-lg">
       Our platform provides all the tools you need to build meaningful connections, share your story, and discover content that matters to you.
     </p>
   </div>
   
   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
     {[
       {
         title: "Real-time Connections",
         description: "Connect with friends and meet new people through our advanced matching algorithm",
         icon: <Users className="h-6 w-6 text-teal-400" />
       },
       {
         title: "Insightful Analytics",
         description: "Understand your audience and content performance with detailed analytics",
         icon: <BarChart2 className="h-6 w-6 text-teal-400" />
       },
       {
         title: "Privacy First",
         description: "Advanced privacy controls let you decide who sees your content",
         icon: <Shield className="h-6 w-6 text-teal-400" />
       }
     ].map((feature, index) => (
       <div key={index} className="backdrop-blur-xl bg-slate-800/20 border border-slate-700/50 rounded-2xl p-8 transform transition-all duration-300 hover:scale-[1.02] hover:bg-slate-800/30 group">
         <div className="p-3 bg-slate-800 rounded-xl inline-block mb-6 group-hover:bg-teal-500/20 transition-colors duration-300">
           {feature.icon}
         </div>
         <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
         <p className="text-slate-300/80">{feature.description}</p>
       </div>
     ))}
   </div>
 </div>
</section>
);

}
