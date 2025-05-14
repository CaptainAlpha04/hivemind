
 export default function Faq(){
 return (
 <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-section">
 <div className="text-center mb-12">
   <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">Frequently Asked Questions</h2>
   <p className="text-xl text-gray-300 max-w-3xl mx-auto">
     Find quick answers to common questions about HiveMind.
   </p>
 </div>
 <div className="grid md:grid-cols-2 gap-6">
   <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-teal-500/20 hover:border-cyan-500/50 transition-all">
     <h3 className="text-2xl font-bold mb-3 text-teal-300">How quickly do you respond to inquiries?</h3>
     <p className="text-gray-300">We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please call our support line.</p>
   </div>
   <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-cyan-500/20 text-center">
     <h3 className="text-2xl font-bold mb-3 text-cyan-400">Do you offer technical support?</h3>
     <p className="text-gray-300">Yes, we provide 24/7 technical support for all our users. You can reach our support team through the in-app help center or via email.</p>
   </div>
   <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-emerald-500/20 text-center">
     <h3 className="text-2xl font-bold mb-3 text-emerald-400">Can I schedule a demo?</h3>
     <p className="text-gray-300">Absolutely! We&apos;d love to show you around. You can schedule a personalized demo by contacting our sales team through this form.</p>
   </div>
   <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-teal-500/20 hover:border-cyan-500/50 transition-all">
     <h3 className="text-2xl font-bold mb-3 text-teal-300">How can I join the HiveMind team?</h3>
     <p className="text-gray-300">We&apos;re always looking for talented individuals! Check out our careers page for current openings or send your resume to careers@hivemind.com.</p>
   </div>
 </div>
</section>
 );
}
