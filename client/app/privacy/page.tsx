import React from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white relative overflow-hidden">
      <Header />
      <main className="pt-24 pb-16 flex-1 w-full relative">
        {/* Modern Blur Gradient Elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 blur-3xl bottom-40 -right-20"></div>
          <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-3xl top-1/2 left-1/3"></div>
        </div>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>

        <div className="max-w-3xl mx-auto bg-white/5 rounded-2xl shadow-xl p-8 backdrop-blur-md border border-white/10">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">Privacy Policy</h1>
            <Link href="/" className="text-teal-300 hover:underline text-sm">&larr; Back to Home</Link>
          </div>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3 text-teal-300">Introduction</h2>
            <p className="text-slate-300">Welcome to HiveMind! Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our platform.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3 text-teal-300">Information We Collect</h2>
            <p className="text-slate-300">We collect information you provide directly (such as when you create an account, post content, or contact support), as well as data collected automatically (such as usage data, cookies, and device information).</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3 text-teal-300">How We Use Your Information</h2>
            <p className="text-slate-300">We use your information to provide and improve our services, personalize your experience, communicate with you, and ensure the security of our platform.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3 text-teal-300">Sharing of Information</h2>
            <p className="text-slate-300">We do not sell your personal information. We may share data with trusted partners who help us operate HiveMind, comply with legal obligations, or protect our rights.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3 text-teal-300">Data Security</h2>
            <p className="text-slate-300">We implement industry-standard security measures to protect your data. However, no method of transmission or storage is 100% secure.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3 text-teal-300">Your Rights</h2>
            <p className="text-slate-300">You have the right to access, update, or delete your personal information. Contact us if you wish to exercise these rights.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3 text-teal-300">Changes to This Policy</h2>
            <p className="text-slate-300">We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-teal-300">Contact Us</h2>
            <p className="text-slate-300">If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:support@hivemind.com" className="text-teal-300 hover:underline">support@hivemind.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
} 