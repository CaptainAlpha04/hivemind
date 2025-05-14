"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const stories = [
  { title: "Zeus's third birthday 🐾", img: "https://picsum.photos/200/120?random=1", user: "Ali" },
  { title: "Just build a vectorizing Agent", img: "https://picsum.photos/200/120?random=2", user: "Doe" },
  { title: "What do ya guys think?", img: "https://picsum.photos/200/120?random=3", user: "Smith" },
  { title: "Vacation Time!!!", img: "https://picsum.photos/200/120?random=4", user: "Alice" },
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
    image: "https://picsum.photos/600/400?random=6",
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
    image: "https://picsum.photos/600/400?random=7",
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
    image: "https://picsum.photos/600/400?random=8",
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
    image: "https://picsum.photos/600/400?random=9",
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
    image: "https://picsum.photos/600/400?random=10",
    likes: "167k",
    comments: "834",
    shares: "392"
  }
];

export default function MainPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#181e29" }}>
      {/* Header */}
      <Header />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        padding: "32px 32px 32px 32px", 
        display: "flex", 
        flexDirection: "column", 
        gap: 24, 
        marginLeft: 280,
        marginTop: 70 // Align with header height
      }}>
        {/* Stories */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ color: "#2de0a7", fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Your Stories</div>
          <div style={{ display: "flex", gap: 18, overflowX: "auto", paddingBottom: 8 }}>
            {stories.map((story) => (
              <div key={story.title} style={{ 
                background: "#232a3a", 
                borderRadius: 18, 
                overflow: "hidden", 
                width: 200, 
                height: 120, 
                position: "relative",
                flexShrink: 0
              }}>
                <img src={story.img} alt={story.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ 
                  position: "absolute", 
                  bottom: 8, 
                  left: 12, 
                  right: 60, // Leave space for username
                  color: "#fff", 
                  fontWeight: 600, 
                  textShadow: "0 2px 8px #000",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>{story.title}</div>
                <div style={{ 
                  position: "absolute", 
                  bottom: 8, 
                  right: 12, 
                  color: "#2de0a7", 
                  fontWeight: 600, 
                  fontSize: 14,
                  maxWidth: 50,
                  textAlign: "right",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>{story.user}</div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Content Layout - Feed and Trending */}
        <div style={{ display: "flex", gap: 24, position: "relative" }}>
          {/* Main Feed */}
          <section style={{ flex: 2, display: "flex", flexDirection: "column", gap: 24, maxWidth: "calc(100% - 372px)" }}>
            {mainFeedPosts.map((post, index) => (
              <div key={index} style={{ background: "#232a3a", borderRadius: 18, padding: 24, minHeight: 400 }}>
                <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>
                  <span style={{ color: "#fff" }}>{post.user}</span> <span style={{ color: "#2de0a7", fontWeight: 600 }}>{post.hive}</span> <span style={{ color: "#aaa", fontWeight: 400, fontSize: 14 }}>• {post.time} • {post.views} Views</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 16 }}>{post.title}</div>
                <img src={post.image} alt="post" style={{ width: "100%", borderRadius: 12, marginBottom: 16 }} />
                <div style={{ display: "flex", gap: 24, color: "#aaa", fontWeight: 500, fontSize: 16 }}>
                  <span>{post.likes}</span> <span>{post.comments}</span> <span>{post.shares}</span>
                </div>
              </div>
            ))}
          </section>
          
          {/* Trending Posts */}
          <aside style={{ 
            width: "340px", 
            background: "#232a3a", 
            borderRadius: 18, 
            padding: 24, 
            minHeight: 400,
            position: "sticky",
            top: "102px",
            alignSelf: "flex-start",
            maxHeight: "calc(100vh - 150px)",
            overflow: "auto",
            scrollbarWidth: "none", /* Firefox */
            msOverflowStyle: "none", /* IE and Edge */
          }}>
            <div style={{ color: "#2de0a7", fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Trending Posts</div>
            {trendingPosts.map((post) => (
              <div key={post.title} style={{ marginBottom: 24 }}>
                <div style={{ color: "#fff", fontWeight: 600 }}>{post.user} <span style={{ color: "#aaa", fontWeight: 400, fontSize: 13, marginLeft: 8 }}>{post.time}</span></div>
                <div style={{ color: "#fff", fontWeight: 500, fontSize: 15, margin: "8px 0" }}>{post.title}</div>
                <div style={{ color: "#aaa", fontWeight: 400, fontSize: 13 }}>{post.stats}</div>
              </div>
            ))}
          </aside>
          
          {/* This style hides scrollbar in Webkit browsers (Chrome, Safari, etc.) */}
          <style jsx global>{`
            aside::-webkit-scrollbar {
              width: 0;
              background: transparent;
              display: none;
            }
          `}</style>
        </div>
      </main>
    </div>
  );
} 