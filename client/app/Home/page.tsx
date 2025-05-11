// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import { useEffect } from 'react';
// import Header from '../../components/Header';

// const HomePage = () => {
//   useEffect(() => {
//     const observerOptions = {
//       root: null,
//       rootMargin: '0px',
//       threshold: 0.1
//     };
//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           entry.target.classList.add('animate-fade-in-up');
//           entry.target.classList.remove('opacity-0', 'translate-y-10');
//         }
//       });
//     }, observerOptions);
//     const sections = document.querySelectorAll('.scroll-section');
//     sections.forEach(section => {
//       section.classList.add('opacity-0', 'translate-y-10');
//       observer.observe(section);
//     });
//     return () => observer.disconnect();
//   }, []);

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-teal-900 relative overflow-hidden">
      
//       {/* Header - Unified with Login/Register */}
//       <Header />

//       {/* Main Content */}
//       <main className="flex-1 w-full relative">
//         {/* Modern Blur Gradient Elements */}
//         <div className="absolute inset-0 overflow-hidden -z-10">
//           <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl -top-20 -left-20"></div>
//           <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-3xl bottom-40 -right-20"></div>
//           <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl top-1/2 left-1/3"></div>
//         </div>
//         {/* Subtle grid overlay */}
//         <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>

//         {/* Hero Section - Replaced GIF with additional content */}
//         <section className="min-h-[70vh] flex flex-col md:flex-row items-center justify-between px-6 pt-24 pb-12 container mx-auto scroll-section">
//           <div className="max-w-2xl mb-12 md:mb-0">
//             <h1 className="text-5xl md:text-6xl font-bold text-slate-100 leading-[0.9] mb-8">
//               The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-300 via-cyan-400 to-emerald-400 animate-gradient">Social Media App</span>
//             </h1>
//             <p className="text-gray-300 text-xl mb-8 leading-relaxed">
//               HiveMind is a groundbreaking social media platform designed to function as a modern social Turing test. Don&apos;t wait to join the most advanced social media app of the age!
//             </p>
//             <div className="flex flex-wrap gap-4">
//               <Link href="/auth/register">
//                 <button className="relative overflow-hidden bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-zinc-900 px-8 py-4 rounded-full text-lg font-medium transition-all shadow-lg shadow-emerald-500/30 group">
//                   <span className="relative z-10">Sign Up</span>
//                   <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
//                 </button>
//               </Link>
//               <Link href="/auth/login">
//                 <button className="bg-white/10 text-slate-100 px-8 py-4 rounded-full text-lg font-medium hover:bg-white/20 transition-colors border border-teal-500/30 hover:border-teal-500/50 backdrop-blur-sm">
//                   Login
//                 </button>
//               </Link>
//             </div>
//           </div>
//           <div className="relative w-full md:w-[500px] h-[350px] md:h-[400px] scroll-section">
//             <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-cyan-500/20 to-emerald-500/20 rounded-xl filter blur-3xl animate-pulse-slow"></div>
//             <div className="absolute inset-0 flex flex-col justify-center items-center bg-slate-900/50 backdrop-blur-sm rounded-xl border border-teal-500/30 shadow-lg shadow-emerald-500/20">
//               <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400 mb-4">Join HiveMind</div>
//               <div className="text-slate-300 text-center px-8 mb-6">Connect with friends, share moments, and explore a world of content</div>
//               <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
//                 <div className="bg-white/10 p-4 rounded-lg text-center border border-teal-500/20">
//                   <div className="text-teal-400 text-xl font-bold mb-2">Sadly Zero</div>
//                   <div className="text-slate-300 text-sm">Active Users</div>
//                 </div>
//                 <div className="bg-white/10 p-4 rounded-lg text-center border border-cyan-500/20">
//                   <div className="text-cyan-400 text-xl font-bold mb-2">Again Aura Minus</div>
//                   <div className="text-slate-300 text-sm">Daily Posts</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Features Section */}
//         <section className="min-h-[60vh] relative py-20 container mx-auto scroll-section">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-12">
//             <div className="w-full md:w-1/2">
//               <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
//                 MAKE YOUR GROUP CHATS <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-400">MORE FUN</span>
//               </h2>
//               <p className="text-gray-300 text-lg leading-relaxed">
//                 Use custom emoji, stickers, soundboard effects and more to add your personality to your voice, video, or text chat. Set your avatar and a custom status, and write your own profile to show up in chat your way.
//               </p>
//               <div className="mt-8 flex space-x-4">
//                 <span className="inline-block bg-gradient-to-r from-teal-500 to-cyan-500 p-px rounded-full">
//                   <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm">
//                     Try Emojis
//                   </button>
//                 </span>
//                 <span className="inline-block bg-gradient-to-r from-cyan-500 to-emerald-500 p-px rounded-full">
//                   <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm">
//                     Explore Stickers
//                   </button>
//                 </span>
//               </div>
//             </div>
//             <div className="w-full md:w-1/2">
//               <div className="relative">
//                 <div className="absolute -inset-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg opacity-30 blur-xl"></div>
//                 <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-lg"></div>
//                 <div className="relative bg-slate-900/90 p-1 rounded-lg">
//                   <Image
//                     src="/landing1.png"
//                     alt="Custom emoji and stickers"
//                     width={500}
//                     height={400}
//                     className="rounded-lg shadow-2xl relative border border-teal-500/10 w-full h-full object-cover"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Stream Section */}
//         <section className="min-h-[60vh] relative py-20 container mx-auto scroll-section">
//           <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12">
//             <div className="w-full md:w-1/2">
//               <div className="relative">
//                 <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg opacity-30 blur-xl"></div>
//                 <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-lg"></div>
//                 <div className="relative bg-slate-900/90 p-1 rounded-lg">
//                   <Image
//                     src="/landing2.png"
//                     alt="High quality streaming"
//                     width={500}
//                     height={400}
//                     className="rounded-lg shadow-2xl relative w-full h-full object-cover"
//                   />
//                   <div className="absolute bottom-4 right-4 bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-1 rounded-full text-xs font-bold text-white">LIVE</div>
//                 </div>
//               </div>
//             </div>
//             <div className="w-full md:w-1/2">
//               <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
//                 SHARE YOUR THOUGHTS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400">LIKE A PRO!!</span>
//               </h2>
//               <p className="text-gray-300 text-lg leading-relaxed">
//                 Commenting on a post, posting a story has never been easier. With HiveMind, you can share your thoughts and ideas with the world in vibrant, attention-grabbing ways.
//               </p>
//               <div className="mt-8 grid grid-cols-3 gap-3">
//                 <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 backdrop-blur-sm p-4 rounded-lg border border-teal-500/20">
//                   <div className="text-teal-400 text-lg font-bold mb-1">Stories</div>
//                   <div className="text-slate-300 text-sm">Share moments</div>
//                 </div>
//                 <div className="bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 backdrop-blur-sm p-4 rounded-lg border border-cyan-500/20">
//                   <div className="text-cyan-400 text-lg font-bold mb-1">Posts</div>
//                   <div className="text-slate-300 text-sm">Express yourself</div>
//                 </div>
//                 <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm p-4 rounded-lg border border-emerald-500/20">
//                   <div className="text-emerald-400 text-lg font-bold mb-1">Reels</div>
//                   <div className="text-slate-300 text-sm">Captivate viewers</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* New Section: Community */}
//         <section className="min-h-[60vh] relative py-20 container mx-auto scroll-section">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-12">
//             <div className="w-full md:w-1/2">
//               <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
//                 BUILD YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-400 to-cyan-400">COMMUNITY</span>
//               </h2>
//               <p className="text-gray-300 text-lg leading-relaxed">
//                 Create and join communities based on shared interests. Connect with like-minded individuals, participate in discussions, and expand your social network with HiveMind&apos;s powerful community tools.
//               </p>
//               <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-lg border border-emerald-500/20 p-5">
//                 <div className="flex items-center mb-4">
//                   <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl">T</div>
//                   <div className="ml-4">
//                     <div className="text-white font-medium">Faseeh Haters</div>
//                     <div className="text-slate-400 text-sm">8.5k members</div>
//                   </div>
//                   <button className="ml-auto bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-1 rounded-full text-sm border border-emerald-500/30 transition-colors">Join</button>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">A</div>
//                   <div className="ml-4">
//                     <div className="text-white font-medium">Ali Lovers</div>
//                     <div className="text-slate-400 text-sm">12.3k members</div>
//                   </div>
//                   <button className="ml-auto bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-4 py-1 rounded-full text-sm border border-cyan-500/30 transition-colors">Join</button>
//                 </div>
//               </div>
//             </div>
//             <div className="w-full md:w-1/2">
//               <div className="relative">
//                 <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg opacity-30 blur-xl"></div>
//                 <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-lg"></div>
//                 <div className="relative bg-slate-900/90 p-6 rounded-lg">
//                   <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400 mb-4">Featured Communities</div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="bg-white/5 p-4 rounded-lg border border-emerald-500/20">
//                       <div className="text-emerald-400 font-bold mb-2">Gaming</div>
//                       <div className="text-slate-300 text-sm mb-3">Connect with gamers worldwide</div>
//                       <div className="text-slate-400 text-xs">15.7k members</div>
//                     </div>
//                     <div className="bg-white/5 p-4 rounded-lg border border-teal-500/20">
//                       <div className="text-teal-400 font-bold mb-2">Fitness</div>
//                       <div className="text-slate-300 text-sm mb-3">Share your fitness journey</div>
//                       <div className="text-slate-400 text-xs">9.2k members</div>
//                     </div>
//                     <div className="bg-white/5 p-4 rounded-lg border border-cyan-500/20">
//                       <div className="text-cyan-400 font-bold mb-2">Music</div>
//                       <div className="text-slate-300 text-sm mb-3">Discover new artists and tracks</div>
//                       <div className="text-slate-400 text-xs">20.5k members</div>
//                     </div>
//                     <div className="bg-white/5 p-4 rounded-lg border border-blue-500/20">
//                       <div className="text-blue-400 font-bold mb-2">Travel</div>
//                       <div className="text-slate-300 text-sm mb-3">Share your adventures</div>
//                       <div className="text-slate-400 text-xs">12.8k members</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Join Section */}
//         <section className="min-h-[50vh] relative py-20 container mx-auto scroll-section">
//           <div className="text-center max-w-4xl mx-auto">
//             <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
//               READY TO START YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-400">JOURNEY?</span>
//             </h2>
//             <p className="text-gray-300 text-xl mb-12 max-w-2xl mx-auto">
//               Join tens of thousands of others in the most colorful and vibrant social media platform. Express yourself like never before!
//             </p>
//             <div className="relative">
//               <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-full opacity-70 blur-sm"></div>
//               <Link href="/auth/register">
//                 <button className="relative bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-zinc-900 px-10 py-5 rounded-full text-xl font-medium transition-all shadow-lg shadow-emerald-500/30 group overflow-hidden">
//                   <span className="relative z-10">Get Started Now</span>
//                   <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></span>
//                 </button>
//               </Link>
//             </div>
//             <div className="mt-16 flex flex-wrap justify-center gap-8">
//               <div className="bg-white/5 border border-teal-500/20 backdrop-blur-sm rounded-lg p-5 flex items-center space-x-4 max-w-xs">
//                 <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full p-3">
//                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
//                   </svg>
//                 </div>
//                 <div className="text-left">
//                   <div className="text-slate-100 font-bold mb-1">Creative Expression</div>
//                   <div className="text-slate-300 text-sm">Share your unique perspective with vibrant tools</div>
//                 </div>
//               </div>
//               <div className="bg-white/5 border border-cyan-500/20 backdrop-blur-sm rounded-lg p-5 flex items-center space-x-4 max-w-xs">
//                 <div className="bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full p-3">
//                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
//                   </svg>
//                 </div>
//                 <div className="text-left">
//                   <div className="text-slate-100 font-bold mb-1">Connect In NUST</div>
//                   <div className="text-slate-300 text-sm">Build communities with like-minded people</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
        
//         {/* Testimonials Section */}
//         <section className="min-h-[50vh] relative py-20 container mx-auto scroll-section">
//           <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-12 text-center">
//             WHAT OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-400">USERS SAY</span>
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-teal-500/20 relative">
//               <div className="absolute -top-4 left-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-2xl px-4 py-2 rounded-lg">❝</div>
//               <p className="text-slate-300 mt-6 mb-4">HiveMind completely transformed how I connect with friends. The interface is intuitive and the features are incredibly engaging!</p>
//               <div className="flex items-center">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">JD</div>
//                 <div className="ml-3">
//                   <div className="text-white font-bold">John Doe</div>
//                   <div className="text-slate-400 text-sm">Designer</div>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20 relative">
//               <div className="absolute -top-4 left-6 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-2xl px-4 py-2 rounded-lg">❝</div>
//               <p className="text-slate-300 mt-6 mb-4">I&apos;ve tried many social platforms, but HiveMind stands out with its unique features and supportive community. It&apos;s become my go-to social media app!</p>
//               <div className="flex items-center">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white font-bold">JS</div>
//                 <div className="ml-3">
//                   <div className="text-white font-bold">Jane Smith</div>
//                   <div className="text-slate-400 text-sm">Content Creator</div>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20 relative">
//               <div className="absolute -top-4 left-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-2xl px-4 py-2 rounded-lg">❝</div>
//               <p className="text-slate-300 mt-6 mb-4">The communities on HiveMind are incredibly active and welcoming. I&apos;ve found my people here and made genuine connections I wouldn&apos;t have made elsewhere.</p>
//               <div className="flex items-center">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">AJ</div>
//                 <div className="ml-3">
//                   <div className="text-white font-bold">Alex Johnson</div>
//                   <div className="text-slate-400 text-sm">Software Developer</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* Footer - Unified with Login/Register */}
//       <footer className="w-full py-6 px-6 z-20 mt-auto">
//         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
//           <div className="flex items-center space-x-2 mb-4 md:mb-0">
//             <span className="text-slate-400 text-sm">© 2025 HiveMind. All rights reserved.</span>
//           </div>
//           <div className="flex space-x-8">
//             <Link href="/privacy" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Privacy</Link>
//             <Link href="/terms" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Terms</Link>
//             <Link href="/help" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Help</Link>
//           </div>
//         </div>
//       </footer>

    
//     </div>
//   );
// };

// export default HomePage;
'use client';

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from "next-auth/react";

function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }
  
  return (
    <div className="space-x-4">
      {session?.user ? (
        <>
          <p className="text-white">Welcome, {session.user.name}</p>
          <button
            onClick={() => signOut()}
            className="text-red-300 transition-colors duration-300 font-medium bg-white/10 hover:backdrop-blur-md px-8 py-3 rounded-full hover:bg-red-900 hover:text-white"
          >
            Sign out
          </button>
        </>
      ) : (
        <>
          <Link
            href="/auth/login"
            className="text-teal-300 transition-colors duration-300 font-medium bg-white/10 hover:backdrop-blur-md px-8 py-3 rounded-full hover:bg-teal-900 hover:text-teal-200"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="text-teal-200 transition-colors duration-300 font-medium bg-teal-900/70 hover:backdrop-blur-md px-8 py-3 rounded-full hover:bg-teal-900 hover:text-teal-200"
          >
            Sign up
          </Link>
        </>
      )}
    </div>
  );
}

export default HomePage
