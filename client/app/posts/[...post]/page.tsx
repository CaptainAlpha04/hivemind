"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import PostCard from "@/components/main/Post";
import TrendingPosts from "@/components/main/Trending";

// These types should be imported from a central location
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

export default function SinglePostPage() {
  const { data: session } = useSession();
  const params = useParams();
  const postId = Array.isArray(params.post) ? params.post[0] : '';

  // State variables
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});
  const [animatingLikes, setAnimatingLikes] = useState<Record<string, boolean>>({});
  const [commentLikeLoading, setCommentLikeLoading] = useState<Record<string, boolean>>({});
  const [animatingCommentLikes, setAnimatingCommentLikes] = useState<Record<string, boolean>>({});
  const [expandedCommentSections, setExpandedCommentSections] = useState<Record<string, boolean>>({});
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);

  // Fetch the single post
  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/posts/${postId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(session?.user?.accessToken && { 
              'Authorization': `Bearer ${session.user.accessToken}` 
            })
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching post: ${response.status}`);
        }
        
        const data = await response.json();
        setPost(data);

        // Always show comments on single post view
        setExpandedCommentSections(prev => ({ ...prev, [data._id]: true }));
        
        // Fetch related posts
        fetchRelatedPosts(data.userId);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    }

    async function fetchRelatedPosts(userId: string) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/posts?userId=${userId}&limit=5`, {
          headers: {
            'Content-Type': 'application/json',
            ...(session?.user?.accessToken && { 
              'Authorization': `Bearer ${session.user.accessToken}` 
            })
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching related posts: ${response.status}`);
        }
        
        const data = await response.json();
        // Filter out the current post
        setRelatedPosts(data.filter((p: Post) => p._id !== postId));
      } catch (err) {
        console.error("Failed to fetch related posts:", err);
      }
    }

    if (postId) {
      fetchPost();
    }
  }, [postId, session]);

  // Format date helper function
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

  // Format numbers helper function
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    } else {
      return num.toString();
    }
  };

  // Handle like functionality
  const handleLikePost = async (postId: string) => {
    if (likeLoading[postId]) return;
    
    try {
      setAnimatingLikes(prev => ({ ...prev, [postId]: true }));
      setLikeLoading(prev => ({ ...prev, [postId]: true }));
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      if (!session?.user?.id || !post) return;

      const isLiked = post.likes.includes(session.user.id);
      
      // Optimistically update UI
      setPost(prevPost => {
        if (!prevPost || !session?.user?.id) return null;
        
        const updatedLikes = isLiked
          ? prevPost.likes.filter(id => id !== session.user.id)
          : [...prevPost.likes, session.user.id];
          
        return { ...prevPost, likes: updatedLikes };
      });

      const response = await fetch(`${apiUrl}/api/posts/${postId}/like`, {
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
        throw new Error(`Error liking post: ${response.status}`);
      }

      const updatedPost = await response.json();
      
      // Update with server data
      setPost(prevPost => {
        if (!prevPost) return null;
        return { ...prevPost, likes: updatedPost.likes };
      });
    } catch (err) {
      console.error("Failed to like post:", err);
      
      // Revert on error - refetch the post
      if (post) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        try {
          const response = await fetch(`${apiUrl}/api/posts/${postId}`);
          if (response.ok) {
            const refreshedPost = await response.json();
            setPost(refreshedPost);
          }
        } catch (refreshErr) {
          console.error("Failed to refresh post data:", refreshErr);
        }
      }
    } finally {
      setTimeout(() => {
        setAnimatingLikes(prev => ({ ...prev, [postId]: false }));
        setLikeLoading(prev => ({ ...prev, [postId]: false }));
      }, 500);
    }
  };

  // Handle comment functionality
  const handleAddComment = async (postId: string, text: string) => {
    if (!text.trim()) return;
    if (commentLoading[postId]) return;
    
    try {
      setCommentLoading(prev => ({ ...prev, [postId]: true }));
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      if (!session?.user?.id) return;

      const response = await fetch(`${apiUrl}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.user?.accessToken && { 
            'Authorization': `Bearer ${session.user.accessToken}` 
          })
        },
        credentials: 'include',
        body: JSON.stringify({ 
          userId: session.user.id,
          text: text
        }),
      });

      if (!response.ok) {
        throw new Error(`Error adding comment: ${response.status}`);
      }

      const newComment = await response.json();
      
      // Update the post with new comment
      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          comments: [...prevPost.comments, newComment]
        };
      });
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Handle like comment functionality
  const handleLikeComment = async (postId: string, commentId: string) => {
    if (commentLikeLoading[commentId] || !post) return;
    
    try {
      setAnimatingCommentLikes(prev => ({ ...prev, [commentId]: true }));
      setCommentLikeLoading(prev => ({ ...prev, [commentId]: true }));
      
      const comment = post.comments.find(c => c._id === commentId);
      
      if (!comment || !session?.user?.id) return;
      
      const isLiked = comment.likes.includes(session.user.id);
      
      // Optimistically update UI
      setPost(prevPost => {
        if (!prevPost) return null;
        
        const updatedComments = prevPost.comments.map(c => {
          if (c._id === commentId) {
            const updatedLikes = isLiked
              ? c.likes.filter(id => id !== session.user.id)
              : [...c.likes, session.user.id!];
            return { ...c, likes: updatedLikes };
          }
          return c;
        });
        
        return { ...prevPost, comments: updatedComments };
      });
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
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
      
      // Update with server data
      setPost(prevPost => {
        if (!prevPost) return null;
        
        const updatedComments = prevPost.comments.map(c => 
          c._id === commentId ? { ...c, likes: updatedComment.likes } : c
        );
        
        return { ...prevPost, comments: updatedComments };
      });
    } catch (err) {
      console.error("Failed to like comment:", err);
    } finally {
      setTimeout(() => {
        setAnimatingCommentLikes(prev => ({ ...prev, [commentId]: false }));
        setCommentLikeLoading(prev => ({ ...prev, [commentId]: false }));
      }, 500);
    }
  };

  // Handle reply to comment
  const handleReplyToComment = async (postId: string, commentId: string, text: string) => {
    if (!text.trim() || !post) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      if (!session?.user?.id) return;
      
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
      
      // Update post with the new reply
      setPost(prevPost => {
        if (!prevPost) return null;
        
        const updatedComments = prevPost.comments.map(c => {
          if (c._id === commentId) {
            const replies = c.replies || [];
            return { ...c, replies: [...replies, newReply] };
          }
          return c;
        });
        
        return { ...prevPost, comments: updatedComments };
      });
    } catch (err) {
      console.error("Failed to reply to comment:", err);
    }
  };
  
  // Toggle comments visibility
  const toggleComments = (postId: string) => {
    setExpandedCommentSections(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <div className="flex min-h-screen bg-base-200">
      <Header />
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 flex flex-col gap-4 md:gap-6 md:ml-[280px] mt-[56px] md:mt-[70px] mb-[60px] md:mb-0">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Main Content - Post Details */}
          <section className="w-full md:flex-[2] md:max-w-[calc(100%-372px)]">
            {loading ? (
              <div className="card bg-base-300 rounded-xl md:rounded-2xl p-4 md:p-6 min-h-[200px] flex justify-center items-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : error ? (
              <div className="card bg-base-300 rounded-xl md:rounded-2xl p-4 md:p-6 min-h-[200px] flex justify-center items-center">
                <div className="text-red-400 text-center">
                  <p className="font-bold">Error</p>
                  <p className="mt-2">{error}</p>
                  <button className="btn btn-sm btn-primary mt-4" onClick={() => window.history.back()}>
                    Go Back
                  </button>
                </div>
              </div>
            ) : post ? (
              // Use the PostCard component for the single post
              <PostCard
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
                singlePostView={true} // Always show comments in single post view
              />
            ) : (
              <div className="card bg-base-300 rounded-xl md:rounded-2xl p-4 md:p-6 min-h-[200px] flex justify-center items-center">
                <p className="text-base-content/60 text-center">Post not found</p>
              </div>
            )}
          </section>
          
          {/* Desktop Sidebar - Related Posts */}
          <aside className="hidden md:block sticky top-[102px] self-start w-[340px] card bg-base-300 rounded-2xl p-6 max-h-[calc(100vh-150px)] overflow-auto scrollbar-hide">
            <h2 className="text-accent font-bold text-xl mb-4">Related Posts</h2>
            
            {relatedPosts.length > 0 ? (
              relatedPosts.map((relatedPost) => (
                <div key={relatedPost._id} className="mb-6 cursor-pointer hover:bg-base-200 p-2 rounded-lg transition-colors" onClick={() => window.location.href = `/posts/${relatedPost._id}`}>
                  <div className="text-base-content font-semibold">
                    u/{relatedPost.username} <span className="text-gray-400 font-normal text-xs ml-2">{formatDate(relatedPost.createdAt)}</span>
                  </div>
                  <div className="text-base-content font-medium text-sm my-2 line-clamp-2">{relatedPost.heading}</div>
                  <div className="text-gray-400 font-normal text-xs">
                    {formatNumber(relatedPost.likes.length)} likes &nbsp;·&nbsp; 
                    {formatNumber(relatedPost.comments.length)} comments
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">No related posts found</p>
            )}
          </aside>
        </div>
        
        {/* Mobile Related Posts Section (at the bottom) */}
        {relatedPosts.length > 0 && (
          <div className="md:hidden mt-2 card bg-base-300 rounded-xl p-4">
            <h2 className="text-accent font-bold text-lg mb-3">Related Posts</h2>
            
            <div className="space-y-4">
              {relatedPosts.slice(0, 3).map((relatedPost) => (
                <div 
                  key={relatedPost._id} 
                  className="border-b border-base-200 pb-3 last:border-none last:pb-0 cursor-pointer hover:bg-base-200 p-2 rounded-lg transition-colors" 
                  onClick={() => window.location.href = `/posts/${relatedPost._id}`}
                >
                  <div className="text-base-content font-semibold text-sm">
                    u/{relatedPost.username} <span className="text-gray-400 font-normal text-xs ml-2">{formatDate(relatedPost.createdAt)}</span>
                  </div>
                  <div className="text-base-content font-medium text-sm my-1 line-clamp-2">{relatedPost.heading}</div>
                  <div className="text-gray-400 font-normal text-xs">
                    {formatNumber(relatedPost.likes.length)} likes &nbsp;·&nbsp; 
                    {formatNumber(relatedPost.comments.length)} comments
                  </div>
                </div>
              ))}
              
              {relatedPosts.length > 3 && (
                <button 
                  className="w-full text-center text-sm text-primary font-medium py-2"
                  onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                >
                  Show more related posts
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}