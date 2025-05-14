"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import Image from "next/image";
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react";

// Fixed image URL for placeholder
const FIXED_IMAGE_URL = "/images/human.jpg";

// Type definitions for our data
interface Comment {
  _id: string;
  userId: string;
  username: string;
  text: string;
  likes: string[];
  createdAt: string;
}

interface Post {
  _id: string;
  userId: string;
  username: string;
  heading: string;
  content: string;
  images: Array<{ data: string; contentType: string }>;
  visibility: 'public' | 'followers_only' | 'private';
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

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

export default function MainPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`);
        
        if (!response.ok) {
          throw new Error(`Error fetching posts: ${response.status}`);
        }
        
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Format post date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Format numbers for display (e.g. 1000 -> 1k)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    } else {
      return num.toString();
    }
  };

  return (
    <div className="flex min-h-screen bg-base-200">
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
              <div key={story.title} className="card w-[200px] h-[120px] bg-base-300 rounded-2xl overflow-hidden flex-shrink-0 relative">
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
                <div className="absolute bottom-2 left-3 right-[60px] text-base-content font-semibold truncate text-shadow">
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
            {loading ? (
              <div className="card bg-base-300 rounded-2xl p-6 min-h-[200px] flex justify-center items-center">
                <span className="loading loading-spinner loading-lg text-accent"></span>
              </div>
            ) : error ? (
              <div className="card bg-base-300 rounded-2xl p-6 min-h-[200px] flex justify-center items-center">
                <div className="text-red-400 text-center">
                  <p className="font-bold">Error</p>
                  <p className="mt-2">{error}</p>
                  <button className="btn btn-sm btn-accent mt-4" onClick={() => window.location.reload()}>
                    Try Again
                  </button>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="card bg-base-300 rounded-2xl p-6 min-h-[200px] flex justify-center items-center">
                <p className="text-base-content text-center">No posts found</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="card bg-base-300 rounded-2xl p-6">
                  <div className="mb-3">
                    <span className="text-base-content font-bold text-lg">u/{post.username}</span>
                    <span className="text-gray-400 font-normal text-sm ml-2">• {formatDate(post.createdAt)}</span>
                  </div>
                  <h3 className="font-bold text-xl text-base-content mb-4">{post.heading}</h3>
                  <div className="text-base-content/80 mb-4">{post.content}</div>
                  {post.images && post.images.length > 0 && (
                    <figure className="w-full mb-4">
                      <img 
                        src={post.images[0].data ? 
                          `data:${post.images[0].contentType};base64,${post.images[0].data}` :
                          FIXED_IMAGE_URL
                        }
                        alt={post.heading}
                        className="w-full rounded-xl object-cover max-h-[500px]"
                      />
                    </figure>
                  )}
                  <div className="flex gap-6 text-gray-400 font-medium text-base mt-4">
                    <div className="badge badge-ghost gap-2">
                      <ThumbsUp size={16} /> {formatNumber(post.likes.length)} likes
                    </div>
                    <div className="badge badge-ghost gap-2">
                      <MessageSquare size={16} /> {formatNumber(post.comments.length)} comments
                    </div>
                    <div className="badge badge-ghost gap-2">
                      <Share2 size={16} /> 0 shares
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Fallback static posts if needed */}
            {!loading && !error && posts.length === 0 && (
              <div className="card bg-base-300 rounded-2xl p-6 min-h-[200px] text-center">
                <p className="text-base-content/60">No posts found. Server might be down or no posts exist yet.</p>
              </div>
            )}
          </section>
          
          {/* Trending Posts */}
          <aside className="sticky top-[102px] self-start w-[340px] card bg-base-300 rounded-2xl p-6 max-h-[calc(100vh-150px)] overflow-auto scrollbar-hide">
            <h2 className="text-accent font-bold text-xl mb-4">Trending Posts</h2>
            {trendingPosts.map((post) => (
              <div key={post.title} className="mb-6">
                <div className="text-base-content font-semibold">
                  {post.user} <span className="text-gray-400 font-normal text-xs ml-2">{post.time}</span>
                </div>
                <div className="text-base-content font-medium text-sm my-2">{post.title}</div>
                <div className="text-gray-400 font-normal text-xs">{post.stats}</div>
              </div>
            ))}
          </aside>
        </div>
      </main>
    </div>
  );
}