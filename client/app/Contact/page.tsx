"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';

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
      <header className="w-full py-4 px-6 flex items-center justify-between z-20 backdrop-blur-sm bg-slate-900/30 border-b border-teal-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <Image src="/Hivemind-removebg-preview.png" alt="HiveMind Logo" width={32} height={32} className="object-contain w-8 h-8" />
          </div>
          <span className="text-white font-semibold text-xl tracking-wide">HiveMind</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link href="/home" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium">Home</Link>
          <Link href="/about" className="text-teal-300 transition-colors duration-300 text-sm font-medium">About</Link>
          <Link href="/contact" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium">Contact</Link>
        </nav>
      </header>

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
            <div className="flex flex-col justify-between">
              <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-teal-500/20 shadow-xl mb-8">
                <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-teal-300">Email Us</h3>
                      <p className="text-gray-300">contact@hivemind.com</p>
                      <p className="text-gray-300">support@hivemind.com</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-cyan-400">Call Us</h3>
                      <p className="text-gray-300">+1 (555) 123-4567</p>
                      <p className="text-gray-300">Monday-Friday: 9AM-6PM EST</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-emerald-400">Location</h3>
                      <p className="text-gray-300">123 Innovation Drive</p>
                      <p className="text-gray-300">San Francisco, CA 94103</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-teal-500/20 shadow-xl">
                <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">Follow Us</h2>
                <p className="text-gray-300 mb-6">Stay connected with us on social media for the latest updates.</p>
                <div className="flex space-x-4">
                  <a href="#" className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors duration-300">
                    <svg className="w-6 h-6 text-teal-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors duration-300">
                    <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors duration-300">
                    <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors duration-300">
                    <svg className="w-6 h-6 text-teal-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      

        {/* FAQ Section */}
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

        {/* CTA Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center scroll-section">
          <div className="bg-gradient-to-r from-teal-900 to-cyan-900 rounded-3xl p-12 shadow-2xl border border-teal-500/20">
            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">Ready to Join the HiveMind?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Become part of our growing community and experience social media like never before.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/Register
              
              " className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-lg font-medium shadow-lg shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105">
                Sign Up Now
              </Link>
              <Link href="/about" className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium border border-teal-500/20 transition-all duration-300 transform hover:scale-105">
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 z-20 mt-auto backdrop-blur-sm bg-slate-900/30 border-t border-teal-500/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              {/* Replace with your logo if needed */}
              <span className="text-white font-semibold text-xl tracking-wide">HiveMind</span>
            </div>
            </div>
          <div className="flex space-x-8 mb-4 md:mb-0">
            <Link href="/home" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium">Home</Link>
            <Link href="/about" className="text-teal-300 transition-colors duration-300 text-sm font-medium">About</Link>
            <Link href="/contact" className="text-slate-200 hover:text-teal-300 transition-colors duration-300 text-sm font-medium">Contact</Link>
            </div>
          <div className="flex space-x-6">
            {/* ...social icons... */}
          </div>
            </div>
        <div className="mt-8 pt-8 border-t border-teal-500/20 text-center text-slate-400 text-sm">
          <p>© 2025 HiveMind. All rights reserved.</p>
            <div className="flex justify-center space-x-6 mt-4">
            <Link href="/privacy" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Terms</Link>
            <Link href="/help" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Help</Link>
          </div>
        </div>
      </footer>
    </div>
);
}

export default ContactPage;

