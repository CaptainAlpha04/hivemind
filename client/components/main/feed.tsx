"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import Image from "next/image";
import { ThumbsUp, MessageSquare, Share2, Send } from "lucide-react";
import { useSession } from "next-auth/react";

// Fixed image URL for placeholder
const FIXED_IMAGE_URL = "/images/human.jpg";

// Type definitions for our data
// Update your Comment interface
interface Comment {
  _id: string;
  userId: string;
  username: string;
  text: string;
  likes: string[];
  createdAt: string;
  replies?: Comment[]; // Add support for nested replies
  parentId?: string;   // Reference to parent comment if this is a reply
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
  }, []); // Add session as dependency to refresh if it changes

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

  const handleReplyToComment = async (postId: string, parentCommentId: string) => {
    // Don't submit empty replies
    if (!replyText[parentCommentId]?.trim()) return;
    
    try {
      // Make sure we have a valid API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      if (!session?.user?.id) {
        console.error("Cannot reply to comment: No user ID available");
        return;
      }
      
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comments/${parentCommentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.user?.accessToken && { 
            'Authorization': `Bearer ${session.user.accessToken}` 
          })
        },
        body: JSON.stringify({ 
          userId: session.user.id,
          text: replyText[parentCommentId],
          parentId: parentCommentId
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
              if (c._id === parentCommentId) {
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
      
      // Clear the reply input and reset replying state
      setReplyText(prev => ({ ...prev, [parentCommentId]: '' }));
      setReplyingTo(null);
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
  const handleAddComment = async (postId: string) => {
    // Don't submit empty comments
    if (!commentText[postId]?.trim()) return;
    
    // Prevent multiple submissions
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
          text: commentText[postId] }),
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
                    <button 
                      onClick={() => handleLikePost(post._id)} 
                      disabled={likeLoading[post._id]}
                      className={`btn btn-sm btn-ghost gap-2 ${
                        hasUserLikedPost(post.likes, session?.user?.id) ? 'text-accent' : ''
                      } ${animatingLikes[post._id] ? 'like-animation' : ''}`}
                    >
                      <div className="like-icon-container">
                        {hasUserLikedPost(post.likes, session?.user?.id) ? (
                          <ThumbsUp 
                            size={16} 
                            fill="currentColor" 
                            strokeWidth={2}
                            className={animatingLikes[post._id] ? 'animate-like' : ''}
                          />
                        ) : (
                          <ThumbsUp 
                            size={16} 
                            className={animatingLikes[post._id] ? 'animate-like' : ''}
                          />
                        )}
                      </div>
                      {formatNumber(post.likes.length)} likes
                    </button>
                    <div className="badge badge-ghost gap-2">
                      <MessageSquare size={16} /> {formatNumber(post.comments.length)} comments
                    </div>
                    <div className="badge badge-ghost gap-2">
                      <Share2 size={16} /> 0 shares
                    </div>
                  </div>
                  
                  {/* Comments Section */}
                  <div className="mt-4 border-t border-base-content/10 pt-4">
                    {/* Comment input */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="input input-bordered w-full"
                        value={commentText[post._id] || ''}
                        onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post._id);
                          }
                        }}
                      />
                      <button 
                        onClick={() => handleAddComment(post._id)}
                        disabled={commentLoading[post._id] || !commentText[post._id]?.trim()}
                        className={`btn btn-accent ${commentLoading[post._id] ? 'loading' : ''}`}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                    
                    {/* Display comments */}
                    {post.comments.length > 0 && (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto p-2">
                        {post.comments.map((comment) => (
                          <div key={comment._id} className="bg-base-200 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-sm">u/{comment.username}</span>
                              <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-base-content/90 text-sm">{comment.text}</p>
                            <div className="mt-2 flex items-center gap-3">
                              {/* Like comment button */}
                              <button 
                                onClick={() => handleLikeComment(post._id, comment._id)} 
                                disabled={commentLikeLoading[comment._id]}
                                className={`btn btn-xs btn-ghost gap-1 ${
                                  hasUserLikedComment(comment.likes, session?.user?.id) ? 'text-accent' : ''
                                } ${animatingCommentLikes[comment._id] ? 'like-animation' : ''}`}
                              >
                                <div className="like-icon-container">
                                  {hasUserLikedComment(comment.likes, session?.user?.id) ? (
                                    <ThumbsUp 
                                      size={12} 
                                      fill="currentColor" 
                                      strokeWidth={2}
                                      className={animatingCommentLikes[comment._id] ? 'animate-like' : ''}
                                    />
                                  ) : (
                                    <ThumbsUp 
                                      size={12} 
                                      className={animatingCommentLikes[comment._id] ? 'animate-like' : ''}
                                    />
                                  )}
                                </div>
                                <span className="text-xs">{formatNumber(comment.likes.length)}</span>
                              </button>
                              
                              {/* Reply button */}
                              <button 
                                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)} 
                                className="btn btn-xs btn-ghost text-xs"
                              >
                                Reply
                              </button>
                            </div>
                            
                            {/* Reply form */}
                            {replyingTo === comment._id && (
                              <div className="mt-2 flex gap-2">
                                <input
                                  type="text"
                                  placeholder={`Reply to ${comment.username}...`}
                                  className="input input-bordered input-sm w-full"
                                  value={replyText[comment._id] || ''}
                                  onChange={(e) => setReplyText(prev => ({ ...prev, [comment._id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleReplyToComment(post._id, comment._id);
                                    }
                                  }}
                                />
                                <button 
                                  onClick={() => handleReplyToComment(post._id, comment._id)}
                                  disabled={!replyText[comment._id]?.trim()}
                                  className="btn btn-sm btn-accent"
                                >
                                  <Send size={14} />
                                </button>
                              </div>
                            )}
                            
                            {/* Display replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="pl-4 mt-2 border-l-2 border-base-content/10 space-y-2">
                                {comment.replies.map((reply) => (
                                  <div key={reply._id} className="bg-base-300 rounded-lg p-2">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-semibold text-xs">u/{reply.username}</span>
                                      <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                                    </div>
                                    <p className="text-base-content/90 text-xs">{reply.text}</p>
                                    <div className="mt-1 text-xs">
                                      <span className="text-gray-400">{formatNumber(reply.likes.length)} likes</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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