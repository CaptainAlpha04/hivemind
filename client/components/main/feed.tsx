"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import TrendingPosts from "./Trending";
import Image from "next/image";
import { useSession } from "next-auth/react";
import PostCard from "./Post";

// Fixed image URL for placeholder
const FIXED_IMAGE_URL = "/images/human.jpg";

// Type definitions for our data
// These should be moved to a shared types file
interface Comment {
  _id: string;
  userId: string;
  username: string;
  text: string;
  likes: string[];
  createdAt: string;
  replies?: Comment[];
  parentId?: string;
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

export default function MainPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});
  const [animatingLikes, setAnimatingLikes] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [commentLikeLoading, setCommentLikeLoading] = useState<Record<string, boolean>>({});
  const [animatingCommentLikes, setAnimatingCommentLikes] = useState<Record<string, boolean>>({});
  const [expandedCommentSections, setExpandedCommentSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/posts`, {
          headers: {
            'Content-Type': 'application/json',
            ...(session?.user?.accessToken && { 
              'Authorization': `Bearer ${session.user.accessToken}` 
            })
          },
          credentials: 'include'
        });
        
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
  }, [session]); 
  
  const toggleComments = (postId: string) => {
    setExpandedCommentSections(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };
  
  // Your existing handler functions (which will be passed to PostCard)
  const handleLikeComment = async (postId: string, commentId: string) => {
    // Prevent multiple clicks
    if (commentLikeLoading[commentId]) return;
    
    try {
      setAnimatingCommentLikes(prev => ({ ...prev, [commentId]: true }));
      setCommentLikeLoading(prev => ({ ...prev, [commentId]: true }));
      
      // Find the post and comment
      const post = posts.find(p => p._id === postId);
      const comment = post?.comments.find(c => c._id === commentId);
      
      if (!post || !comment) {
        console.error("Post or comment not found");
        return;
      }
      
      const isLiked = comment.likes.includes(session?.user?.id || '');
      
      // Optimistically update UI
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const updatedComments = post.comments.map(c => {
              if (c._id === commentId) {
                const updatedLikes = isLiked
                  ? c.likes.filter(id => id !== session?.user?.id)
                  : [...c.likes, session?.user?.id || ''];
                return {...c, likes: updatedLikes};
              }
              return c;
            });
            
            return {...post, comments: updatedComments};
          }
          return post;
        })
      );
      
      // Make sure we have a valid API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      if (!session?.user?.id) {
        console.error("Cannot like comment: No user ID available");
        return;
      }
      
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.user?.accessToken && { 
            'Authorization': `Bearer ${session.user.accessToken}` 
          })
        },
        body: JSON.stringify({ userId: session.user.id }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error liking comment: ${response.status}`);
      }
      
      const updatedComment = await response.json();
      
      // Update the comment with server response
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const updatedComments = post.comments.map(c => 
              c._id === commentId ? {...c, likes: updatedComment.likes} : c
            );
            
            return {...post, comments: updatedComments};
          }
          return post;
        })
      );
    } catch (err) {
      console.error("Failed to like comment:", err);
    } finally {
      setTimeout(() => {
        setAnimatingCommentLikes(prev => ({ ...prev, [commentId]: false }));
        setCommentLikeLoading(prev => ({ ...prev, [commentId]: false }));
      }, 500);
    }
  };

  const handleReplyToComment = async (postId: string, commentId: string, text: string) => {
    try {
      // Make sure we have a valid API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      if (!session?.user?.id) {
        console.error("Cannot reply to comment: No user ID available");
        return;
      }
      
      console.log('Replying to comment with text:', text);
      
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comments/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.user?.accessToken && { 
            'Authorization': `Bearer ${session.user.accessToken}` 
          })
        },
        body: JSON.stringify({ 
          userId: session.user.id,
          text: text,
          parentId: commentId
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error replying to comment: ${response.status}`);
      }
      
      const newReply = await response.json();
      
      // Update the post with the new reply
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            // Find the parent comment and add reply
            const updatedComments = post.comments.map(c => {
              if (c._id === commentId) {
                const replies = c.replies || [];
                return {...c, replies: [...replies, newReply]};
              }
              return c;
            });
            
            return {...post, comments: updatedComments};
          }
          return post;
        })
      );
    } catch (err) {
      console.error("Failed to reply to comment:", err);
    }
  };

  // Helper function for comment likes
  const hasUserLikedComment = (commentLikes: string[], userId: string | undefined) => {
    if (!userId) return false;
    return commentLikes.includes(userId);
  };


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

  // Add like functionality
  const handleLikePost = async (postId: string) => {
    // Prevent multiple clicks
    if (likeLoading[postId]) return;
    
    try {
      setAnimatingLikes(prev => ({ ...prev, [postId]: true }));
      // Prevent multiple submissions
      setLikeLoading(prev => ({ ...prev, [postId]: true }));
      
      const isLiked = hasUserLikedPost(
        posts.find(p => p._id === postId)?.likes || [], 
        session?.user?.id
      );
      
      // Optimistically update the UI
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const updatedLikes = isLiked
              ? post.likes.filter(id => id !== session?.user?.id)
              : [...post.likes, session?.user?.id || ''];
              
            return {...post, likes: updatedLikes};
          }
          return post;
        })
      );

      // Make sure we have a valid API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      if (!session?.user?.id) {
        console.error("Cannot like post: No user ID available");
        return;
      }

      const response = await fetch(`${apiUrl}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if session exists
          ...(session?.user?.accessToken && { 
            'Authorization': `Bearer ${session.user.accessToken}` 
          })
        },
        body: JSON.stringify({ userId: session.user.id }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error liking post: ${response.status}`);
      }

      const updatedPost = await response.json();
      
      // Update the posts array with the updated post
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? {...post, likes: updatedPost.likes} : post
        )
      );
    } catch (err) {
      console.error("Failed to like post:", err);

       // Revert the optimistic update on error
      if (session?.user?.id) {
        setPosts(prevPosts => [...prevPosts]);
      }
    } finally {
      // Clear the loading state
      // Use a timeout to allow the animation to finish
      setTimeout(() => {
        setAnimatingLikes(prev => ({ ...prev, [postId]: false }));
        setLikeLoading(prev => ({ ...prev, [postId]: false }));
      }, 500);
    }
  };

  // Add comment functionality
  const handleAddComment = async (postId: string, text: string) => {
    if (!text.trim()) return;
    if (commentLoading[postId]) return;
    
    try {
      setCommentLoading(prev => ({ ...prev, [postId]: true }));
      
      // Make sure we have a valid API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
       // Check if we have a user ID
      if (!session?.user?.id) {
        console.error("Cannot comment on post: No user ID available");
        return;
      }

      const response = await fetch(`${apiUrl}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if session exists
          ...(session?.user?.accessToken && { 
            'Authorization': `Bearer ${session.user.accessToken}` 
          })
        },
        credentials: 'include',
        body: JSON.stringify({ 
          userId: session.user.id,
          text: text }),
      });

      if (!response.ok) {
        throw new Error(`Error adding comment: ${response.status}`);
      }

      const newComment = await response.json();
      
      // Update the posts array with the new comment
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, newComment]
            };
          }
          return post;
        })
      );
      
      // Clear the comment input
      setCommentText(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  // A helper function to check if user has liked a post
  const hasUserLikedPost = (postLikes: string[], userId: string | undefined) => {
    if (!userId) return false;
    return postLikes.includes(userId);
  };

  return (
    <div className="flex min-h-screen bg-base-200">
      <Header />
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 flex flex-col gap-4 md:gap-6 md:ml-[280px] mt-[56px] md:mt-[70px] mb-[60px] md:mb-0">
        {/* Stories - Resized for mobile */}
        <section className="mb-2 md:mb-6">
          <h2 className="text-primary font-bold text-xl mb-2 md:mb-4 ml-1">Your Stories</h2>
          <div className="flex gap-2 md:gap-4 overflow-x-auto pb-1 md:pb-2 scrollbar-hide">
            {stories.map((story) => (
              <div key={story.title} className="card w-[75px] md:w-[200px] h-[75px] md:h-[120px] bg-base-300 rounded-full md:rounded-2xl overflow-hidden flex-shrink-0 relative">
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
                <div className="hidden md:block absolute bottom-2 left-3 right-[60px] text-base-content font-semibold truncate text-shadow">
                  {story.title}
                </div>
                <div className="hidden md:block absolute bottom-2 right-3 text-primary font-semibold text-sm max-w-[50px] text-right truncate">
                  {story.user}
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 relative">
          {/* Main Feed - Full width on mobile */}
          <section className="flex-1 flex flex-col gap-4 md:gap-6 md:flex-[2] md:max-w-[calc(100%-372px)]">
            {loading ? (
              <div className="card bg-base-300 rounded-xl md:rounded-2xl p-4 md:p-6 min-h-[200px] flex justify-center items-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : error ? (
              <div className="card bg-base-300 rounded-xl md:rounded-2xl p-4 md:p-6 min-h-[200px] flex justify-center items-center">
                <div className="text-red-400 text-center">
                  <p className="font-bold">Error</p>
                  <p className="mt-2">{error}</p>
                  <button className="btn btn-sm btn-primary mt-4" onClick={() => window.location.reload()}>
                    Try Again
                  </button>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="card bg-base-300 rounded-xl md:rounded-2xl p-4 md:p-6 min-h-[200px] flex justify-center items-center">
                <p className="text-base-content text-center">No posts found</p>
              </div>
            ) : (
              // Use the PostCard component for each post
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  formatDate={formatDate}
                  formatNumber={formatNumber}
                  onLike={handleLikePost}
                  onComment={handleAddComment}
                  onLikeComment={handleLikeComment}
                  onReplyToComment={handleReplyToComment}
                  likeLoading={likeLoading}
                  commentLoading={commentLoading}
                  animatingLikes={animatingLikes}
                  commentLikeLoading={commentLikeLoading}
                  animatingCommentLikes={animatingCommentLikes}
                  expandedCommentSections={expandedCommentSections}
                  toggleComments={toggleComments}
                />
              ))
            )}
          </section>
          
          {/* Trending Posts - Hidden on mobile */}
          <div className="hidden md:block">
            <TrendingPosts 
              posts={posts}
              loading={loading}
              error={error}
              formatNumber={formatNumber}
              formatDate={formatDate}
            />
          </div>
        </div>
      </main>
    </div>
  );
}