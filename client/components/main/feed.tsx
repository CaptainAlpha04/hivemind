"use client";

import React from "react";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import Image from "next/image";

// Fixed image URL for all images
const FIXED_IMAGE_URL = "/images/huamn.jpg";

const stories = [
  { title: "Zeus's third birthday 🐾", img: FIXED_IMAGE_URL, user: "Ali" },
  { title: "Just build a vectorizing Agent", img: FIXED_IMAGE_URL, user: "Doe" },
  { title: "What do ya guys think?", img: FIXED_IMAGE_URL, user: "Smith" },
  { title: "Vacation Time!!!", img: FIXED_IMAGE_URL, user: "Alice" },
];

const trendingPosts = [
  {
    user: "#captainSparrow",
    time: "2 days ago",
    title: "What I usually do when I am not threatened by sea titans and other pirates - MUST READ...",
    stats: "1.4M Likes   1.2M comments   76k Shares   104M Views",
  },
  {
    user: "#StiffTiffany112",
    time: "1 week ago",
    title: "Why AI is NOT the game changing technology of our Generation? A survey by MIT Shocks....",
    stats: "650k Likes   2.3k comments   342 Shares   21M Views",
  },
  {
    user: "#CyberSherlock",
    time: "3 days ago",
    title: "Why J.R.R Tolkien is a better author than George R.R Martin. My hot take.",
    stats: "10k Likes   68k comments   32k Shares   147k Views",
  },
];

// Array of posts for the main feed
const mainFeedPosts = [
  {
    user: "#JoeMama911",
    hive: "h/programmingmemes",
    time: "4 hours ago",
    views: "873k",
    title: "Its True tho 🖕",
    image: FIXED_IMAGE_URL,
    likes: "531k",
    comments: "1.8k",
    shares: "819"
  },
  {
    user: "#TechBro42",
    hive: "h/webdev",
    time: "6 hours ago",
    views: "512k",
    title: "CSS is my passion 🔥",
    image: FIXED_IMAGE_URL,
    likes: "245k",
    comments: "3.2k",
    shares: "1.5k"
  },
  {
    user: "#AIGuru99",
    hive: "h/artificialintelligence",
    time: "12 hours ago",
    views: "1.2M",
    title: "When the model hallucinates facts",
    image: FIXED_IMAGE_URL,
    likes: "783k",
    comments: "4.7k",
    shares: "2.3k"
  },
  {
    user: "#GameDevLegend",
    hive: "h/gamedev",
    time: "1 day ago",
    views: "421k",
    title: "Working on my indie game for 5 years be like...",
    image: FIXED_IMAGE_URL,
    likes: "189k",
    comments: "956",
    shares: "428"
  },
  {
    user: "#DataWizard",
    hive: "h/datascience",
    time: "2 days ago",
    views: "356k",
    title: "When your ML model finally works after 100 attempts",
    image: FIXED_IMAGE_URL,
    likes: "167k",
    comments: "834",
    shares: "392"
  }
];

export default function MainPage() {
  return (
    <div className="flex min-h-screen bg-[#181e29]">
      {/* Header and Sidebar components stay the same */}
      <Header />
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-col gap-6 ml-[280px] mt-[70px]">
        {/* Stories */}
        <section className="mb-6">
          <h2 className="text-accent font-bold text-xl mb-4">Your Stories</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {stories.map((story) => (
              <div key={story.title} className="card w-[200px] h-[120px] bg-[#232a3a] rounded-2xl overflow-hidden flex-shrink-0 relative">
                <figure className="w-full h-full">
                  <Image 
                    src={story.img} 
                    alt={story.title} 
                    className="object-cover" 
                    width={200}
                    height={120}
                    layout="responsive"
                  />
                </figure>
                <div className="absolute bottom-2 left-3 right-[60px] text-white font-semibold truncate text-shadow">
                  {story.title}
                </div>
                <div className="absolute bottom-2 right-3 text-accent font-semibold text-sm max-w-[50px] text-right truncate">
                  {story.user}
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Content Layout - Feed and Trending */}
        <div className="flex gap-6 relative">
          {/* Main Feed */}
          <section className="flex-[2] flex flex-col gap-6 max-w-[calc(100%-372px)]">
            {mainFeedPosts.map((post, index) => (
              <div key={index} className="card bg-[#232a3a] rounded-2xl p-6 min-h-[400px]">
                <div className="mb-3">
                  <span className="text-white font-bold text-lg">{post.user}</span> 
                  <span className="text-accent font-semibold ml-1">{post.hive}</span> 
                  <span className="text-gray-400 font-normal text-sm ml-2">• {post.time} • {post.views} Views</span>
                </div>
                <h3 className="font-bold text-xl text-white mb-4">{post.title}</h3>
                <figure className="w-full mb-4">
                  <img src={post.image} alt="post" className="w-full rounded-xl" />
                </figure>
                <div className="flex gap-6 text-gray-400 font-medium text-base">
                  <span className="badge badge-ghost">{post.likes} likes</span> 
                  <span className="badge badge-ghost">{post.comments} comments</span> 
                  <span className="badge badge-ghost">{post.shares} shares</span>
                </div>
              </div>
            ))}
          </section>
          
          {/* Trending Posts */}
          <aside className="sticky top-[102px] self-start w-[340px] card bg-[#232a3a] rounded-2xl p-6 max-h-[calc(100vh-150px)] overflow-auto scrollbar-hide">
            <h2 className="text-accent font-bold text-xl mb-4">Trending Posts</h2>
            {trendingPosts.map((post) => (
              <div key={post.title} className="mb-6">
                <div className="text-white font-semibold">
                  {post.user} <span className="text-gray-400 font-normal text-xs ml-2">{post.time}</span>
                </div>
                <div className="text-white font-medium text-sm my-2">{post.title}</div>
                <div className="text-gray-400 font-normal text-xs">{post.stats}</div>
              </div>
            ))}
          </aside>
        </div>
      </main>
    </div>
  );
}