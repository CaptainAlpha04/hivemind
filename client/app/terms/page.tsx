import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white relative overflow-hidden">
      <Header />
      <main className="pt-24 pb-16 flex-1 w-full relative">
        {/* Modern Blur Gradient Elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl -top-20 -left-20 animate-pulse"></div>
          <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 blur-3xl bottom-40 -right-20 animate-pulse delay-1000"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-3xl top-1/2 left-1/3 animate-pulse delay-500"></div>
        </div>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>

        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white/5 rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent mb-2">Terms of Service</h1>
                <p className="text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-teal-300 hover:text-teal-200 transition-colors duration-300 text-sm font-medium"
              >
                <span className="hover:translate-x-[-4px] transition-transform duration-300">&larr;</span>
                Back to Home
              </Link>
            </div>

            <div className="space-y-12">
              <section className="group">
                <h2 className="text-2xl font-semibold mb-4 text-teal-300 group-hover:text-teal-200 transition-colors duration-300">1. Acceptance of Terms</h2>
                <p className="text-slate-300 leading-relaxed">By accessing and using HiveMind, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
              </section>

              <section className="group">
                <h2 className="text-2xl font-semibold mb-4 text-teal-300 group-hover:text-teal-200 transition-colors duration-300">2. Use License</h2>
                <p className="text-slate-300 leading-relaxed mb-4">Permission is granted to temporarily access HiveMind for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul className="list-none space-y-3">
                  {[
                    "Modify or copy the materials",
                    "Use the materials for any commercial purpose",
                    "Attempt to decompile or reverse engineer any software contained on HiveMind",
                    "Remove any copyright or other proprietary notations from the materials",
                    "Transfer the materials to another person or mirror the materials on any other server"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-300">
                      <span className="text-teal-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="group">
                <h2 className="text-2xl font-semibold mb-4 text-teal-300 group-hover:text-teal-200 transition-colors duration-300">3. User Content</h2>
                <p className="text-slate-300 leading-relaxed">Users may post content as long as it isn&apos;t illegal, obscene, threatening, defamatory, invasive of privacy, infringing of intellectual property rights, or otherwise injurious to third parties. We reserve the right to remove any content that violates these terms.</p>
              </section>

              <section className="group">
                <h2 className="text-2xl font-semibold mb-4 text-teal-300 group-hover:text-teal-200 transition-colors duration-300">4. Account Responsibilities</h2>
                <p className="text-slate-300 leading-relaxed">You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.</p>
              </section>

              <section className="group">
                <h2 className="text-2xl font-semibold mb-4 text-teal-300 group-hover:text-teal-200 transition-colors duration-300">5. Service Modifications</h2>
                <p className="text-slate-300 leading-relaxed">HiveMind reserves the right to modify or discontinue, temporarily or permanently, the service with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.</p>
              </section>

              <section className="group">
                <h2 className="text-2xl font-semibold mb-4 text-teal-300 group-hover:text-teal-200 transition-colors duration-300">6. Limitation of Liability</h2>
                <p className="text-slate-300 leading-relaxed">In no event shall HiveMind or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on HiveMind.</p>
              </section>

              <section className="group">
                <h2 className="text-2xl font-semibold mb-4 text-teal-300 group-hover:text-teal-200 transition-colors duration-300">7. Governing Law</h2>
                <p className="text-slate-300 leading-relaxed">These terms and conditions are governed by and construed in accordance with the laws of your jurisdiction and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
              </section>

              <section className="group">
                <h2 className="text-2xl font-semibold mb-4 text-teal-300 group-hover:text-teal-200 transition-colors duration-300">8. Changes to Terms</h2>
                <p className="text-slate-300 leading-relaxed">We reserve the right to revise these terms of service at any time without notice. By using HiveMind, you are agreeing to be bound by the then current version of these terms of service.</p>
              </section>

              <section className="group">
                <h2 className="text-2xl font-semibold mb-4 text-teal-300 group-hover:text-teal-200 transition-colors duration-300">9. Contact Information</h2>
                <p className="text-slate-300 leading-relaxed">If you have any questions about these Terms of Service, please contact us at <a href="mailto:support@hivemind.com" className="text-teal-300 hover:text-teal-200 underline transition-colors duration-300">support@hivemind.com</a>.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 