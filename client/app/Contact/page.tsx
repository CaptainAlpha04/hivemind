"use client";

import { useState, useEffect } from 'react';

import Footer from '@/components/ui/Footer';
import Header from '@/components/ui/Navbar';
import Faq from '@/components/contact/Faq';
import Cts from '@/components/home/Cts';
import Info from '@/components/contact/Info';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Mock form submission
    setFormStatus({
      submitted: true,
      error: false,
      message: 'Thank you for reaching out! We will get back to you shortly.'
    });
    
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Reset form status after 5 seconds
    setTimeout(() => {
      setFormStatus({
        submitted: false,
        error: false,
        message: ''
      });
    }, 5000);
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach(section => {
      section.classList.add('opacity-0', 'translate-y-10');
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900 text-white relative overflow-hidden">
      {/* Header - Unified with About Page */}

<Header />

      {/* Main Content */}
      <main className="pt-24 pb-16 flex-1 w-full relative">
        {/* Modern Blur Gradient Elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 blur-3xl bottom-40 -right-20"></div>
          <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-3xl top-1/2 left-1/3"></div>
        </div>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>

        {/* Hero Section */}
        <section className="scroll-section relative container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-400">Get In Touch</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full mb-8"></div>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-gray-300">
            Have questions, feedback, or just want to say hello? We&apos;d love to hear from you. Our team is always ready to connect.
            </p>
        </section>

        {/* Contact Form Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-section">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-teal-500/20 shadow-xl">
              <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">Send Us a Message</h2>
              <p className="text-gray-300 mb-8">Fill out the form below and we&apos;ll get back to you as soon as possible.</p>
              {formStatus.submitted && (
                <div className="bg-emerald-900 bg-opacity-80 text-emerald-100 rounded-lg p-4 mb-6">
                  {formStatus.message}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800 border border-teal-500/20 rounded-lg py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800 border border-teal-500/20 rounded-lg py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800 border border-teal-500/20 rounded-lg py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={5} 
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800 border border-teal-500/20 rounded-lg py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-lg font-medium shadow-lg shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            </div>
            
{/* Info Section */}
<Info />

          </div>
        </section>

      

        {/* FAQ Section */}
        <Faq />

        {/* CTA Section */}
        
        <Cts />

      </main>

      {/* Footer */}
      <Footer />

    </div>
);
}

export default ContactPage;

