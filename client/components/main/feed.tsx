"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import TrendingPosts from "./Trending";
import Image from "next/image";
import { useSession } from "next-auth/react";
import PostCard from "./Post";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";

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

// Story interface based on backend model
interface Story {
  _id: string;
  userId: string;
  username: string;
  title: string;
  caption?: string;
  hasImage: boolean;
  viewed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Keeping the static stories for fallback
const mockStories = [
  { title: "Zeus's third birthday 🐾", img: FIXED_IMAGE_URL, user: "Ali" },
  { title: "Just build a vectorizing Agent", img: FIXED_IMAGE_URL, user: "Doe" },
  { title: "What do ya guys think?", img: FIXED_IMAGE_URL, user: "Smith" },
  { title: "Vacation Time!!!", img: FIXED_IMAGE_URL, user: "Alice" },
];

export default function MainPage() {  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState<boolean>(true);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showStoryViewer, setShowStoryViewer] = useState<boolean>(false);
  const [showCreateStory, setShowCreateStory] = useState<boolean>(false);
  const [storyTitle, setStoryTitle] = useState<string>('');
  const [storyCaption, setStoryCaption] = useState<string>('');
  const [storyImage, setStoryImage] = useState<File | null>(null);
  const [storyUploadLoading, setStoryUploadLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = React.useRef<HTMLDivElement>(null);
  
  // Using the state for comment text in the component
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});
  const [animatingLikes, setAnimatingLikes] = useState<Record<string, boolean>>({});
  const [commentLikeLoading, setCommentLikeLoading] = useState<Record<string, boolean>>({});
  const [animatingCommentLikes, setAnimatingCommentLikes] = useState<Record<string, boolean>>({});
  const [expandedCommentSections, setExpandedCommentSections] = useState<Record<string, boolean>>({});  // Function to fetch posts with pagination
  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/posts?page=${pageNum}&limit=10`, {
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
      
      if (append) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      
      setHasMore(data.pagination.hasMore);
      setPage(data.pagination.page);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  // Initial post loading
  useEffect(() => {
    fetchPosts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);
  
  // Load more posts when user scrolls to the bottom
  useEffect(() => {
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new intersection observer
    observerRef.current = new IntersectionObserver(entries => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
        fetchPosts(page + 1, true);
      }
    }, { threshold: 0.5 });
    
    // Observe the load more trigger element
    if (loadMoreTriggerRef.current) {
      observerRef.current.observe(loadMoreTriggerRef.current);
    }
    
    // Cleanup observer on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, loadingMore, page]);

  // Fetch stories from the API
  useEffect(() => {
    async function fetchStories() {
      if (!session?.user?.id) return;
      
      try {
        setStoriesLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/stories?userId=${session.user.id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(session?.user?.accessToken && { 
              'Authorization': `Bearer ${session.user.accessToken}` 
            })
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching stories: ${response.status}`);
        }
        
        const data = await response.json();
        setStories(data);
      } catch (err) {
        console.error("Failed to fetch stories:", err);
        setStoriesError(err instanceof Error ? err.message : "Failed to load stories");
        // Use mock stories as fallback if API fails
        setStories([]);
      } finally {
        setStoriesLoading(false);
      }
    }

    fetchStories();
  }, [session]);
  
  // Handle viewing a story
  const handleViewStory = async (story: Story) => {
    setSelectedStory(story);
    setShowStoryViewer(true);
    
    // Mark story as viewed if not already viewed
    if (!story.viewed && session?.user?.id) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/stories/${story._id}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.user?.accessToken && { 
              'Authorization': `Bearer ${session.user.accessToken}` 
            })
          },
          body: JSON.stringify({ userId: session.user.id }),
          credentials: 'include'
        });
        
        if (response.ok) {
          // Update the viewed status in the local state
          setStories(prevStories => 
            prevStories.map(s => 
              s._id === story._id ? { ...s, viewed: true } : s
            )
          );
        }
      } catch (error) {
        console.error("Failed to mark story as viewed:", error);
      }
    }
  };
  
  // Handle creating a new story
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id || !storyTitle || !storyImage) {
      return;
    }
    
    try {
      setStoryUploadLoading(true);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('userId', session.user.id);
      formData.append('title', storyTitle);
      formData.append('image', storyImage);
      
      if (storyCaption) {
        formData.append('caption', storyCaption);
      }
      
      const response = await fetch(`${apiUrl}/api/stories`, {
        method: 'POST',
        headers: {
          ...(session?.user?.accessToken && { 
            'Authorization': `Bearer ${session.user.accessToken}` 
          })
        },
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error creating story: ${response.status}`);
      }
      
      // Get the new story and add it to the stories array
      const newStory = await response.json();
      setStories(prevStories => [newStory, ...prevStories]);
      
      // Reset form and close modal
      setStoryTitle('');
      setStoryCaption('');
      setStoryImage(null);
      setShowCreateStory(false);
    } catch (error) {
      console.error("Failed to create story:", error);
      alert("Failed to create story. Please try again.");
    } finally {
      setStoryUploadLoading(false);
    }
  };

  
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
  };  // Helper function for comment likes
  // Used in PostCard component
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
      
      <main className="flex-1 p-4 md:p-8 flex flex-col gap-4 md:gap-6 md:ml-[280px] mt-[56px] md:mt-[70px] mb-[60px] md:mb-0">        {/* Stories - Resized for mobile */}
        <section className="mb-2 md:mb-6">
          <div className="flex justify-between items-center mb-2 md:mb-4">
            <h2 className="text-primary font-bold text-xl ml-1">Your Stories</h2>
            <button 
              onClick={() => setShowCreateStory(true)} 
              className="btn btn-sm btn-primary btn-outline"
              aria-label="Create a new story"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">New Story</span>
            </button>
          </div>
          <div className="flex gap-2 md:gap-4 overflow-x-auto pb-1 md:pb-2 scrollbar-hide">
            {/* Create Story Button on Mobile */}
            <div 
              onClick={() => setShowCreateStory(true)}
              className="md:hidden card w-[75px] h-[75px] bg-base-300 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer border-2 border-primary"
            >
              <PlusIcon className="h-8 w-8 text-primary" />
            </div>
            
            {storiesLoading ? (
              <div className="flex items-center justify-center w-full h-[75px] md:h-[120px]">
                <span className="loading loading-spinner loading-md text-primary"></span>
              </div>
            ) : storiesError ? (
              <div className="flex items-center justify-center w-full h-[75px] md:h-[120px]">
                <p className="text-error">Unable to load stories</p>
              </div>
            ) : stories.length > 0 ? (
              stories.map((story) => (
                <div 
                  key={story._id} 
                  onClick={() => handleViewStory(story)}
                  className={`card w-[75px] md:w-[200px] h-[75px] md:h-[120px] bg-base-300 rounded-full md:rounded-2xl overflow-hidden flex-shrink-0 relative cursor-pointer ${!story.viewed ? 'ring-2 ring-primary' : ''}`}
                >                  <figure className="w-full h-full">
                    <div className={`absolute inset-0 bg-gray-600 ${story.viewed ? 'opacity-50' : 'opacity-0'}`}></div>
                    <Image 
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stories/${story._id}/image?userId=${session?.user?.id}`} 
                      alt={story.title} 
                      className="object-cover" 
                      width={200}
                      height={120}
                      priority
                      onError={(e) => {
                        // Fallback to default image on error
                        const target = e.target as HTMLImageElement;
                        target.src = FIXED_IMAGE_URL;
                      }}
                    />
                  </figure>
                  <div className="hidden md:block absolute bottom-2 left-3 right-[60px] text-white font-semibold truncate text-shadow">
                    {story.title}
                  </div>
                  <div className="hidden md:block absolute bottom-2 right-3 text-primary font-semibold text-sm max-w-[50px] text-right truncate">
                    {story.username}
                  </div>
                </div>
              ))
            ) : (
              // If no stories available, show the mock stories as fallback or a message
              mockStories.length > 0 ? (
                mockStories.map((story, index) => (
                  <div 
                    key={index} 
                    className="card w-[75px] md:w-[200px] h-[75px] md:h-[120px] bg-base-300 rounded-full md:rounded-2xl overflow-hidden flex-shrink-0 relative"
                  >
                    <figure className="w-full h-full">                    <Image 
                        src={story.img} 
                        alt={story.title} 
                        className="object-cover opacity-60" 
                        width={200}
                        height={120}
                        style={{ width: '100%', height: 'auto' }}
                      />
                    </figure>
                    <div className="hidden md:block absolute bottom-2 left-3 right-[60px] text-white font-semibold truncate text-shadow">
                      {story.title}
                    </div>
                    <div className="hidden md:block absolute bottom-2 right-3 text-primary font-semibold text-sm max-w-[50px] text-right truncate">
                      {story.user}
                    </div>
                  </div>
                ))
              ) : (
                <div className="card w-full h-[75px] md:h-[120px] bg-base-300 rounded-xl overflow-hidden flex items-center justify-center p-4">
                  <p className="text-center text-sm md:text-base">No stories from people you follow. Create one or follow more users!</p>
                </div>
              )
            )}
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
              </div>            ) : (
              <>
                {/* Posts list */}
                {posts.map((post) => (
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
                ))}
                
                {/* Load more trigger */}
                {hasMore && (
                  <div 
                    ref={loadMoreTriggerRef}
                    className="card bg-base-300 rounded-xl md:rounded-2xl p-4 flex justify-center items-center my-2"
                  >
                    {loadingMore ? (
                      <span className="loading loading-spinner loading-md text-primary"></span>
                    ) : (
                      <p className="text-sm text-gray-400">Scroll for more</p>
                    )}
                  </div>
                )}
                
                {/* No more posts message */}
                {!hasMore && posts.length > 0 && (
                  <div className="card bg-base-300 rounded-xl md:rounded-2xl p-4 flex justify-center items-center my-2">
                    <p className="text-sm text-gray-400">No more posts</p>
                  </div>
                )}
              </>
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
        
        {/* Story Viewer Modal */}
        {showStoryViewer && selectedStory && (
          <div className="fixed inset-0 z-[60] bg-black bg-opacity-80 flex items-center justify-center p-4">
            <div className="relative max-w-2xl w-full h-full max-h-[80vh] bg-base-100 rounded-xl overflow-hidden">
              <button 
                onClick={() => setShowStoryViewer(false)} 
                className="absolute top-2 right-2 z-10 p-2 bg-base-200 rounded-full"
              >
                <XMarkIcon className="h-6 w-6 text-primary" />
              </button>
              
              <div className="h-full flex flex-col">
                <div className="p-3 border-b border-base-300 flex items-center gap-2">
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                      <Image 
                        src="/images/user.png" 
                        alt={selectedStory.username} 
                        width={32} 
                        height={32} 
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedStory.username}</p>
                    <p className="text-xs opacity-70">{new Date(selectedStory.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                  <div className="relative flex-grow">
                  <Image 
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stories/${selectedStory._id}/image?userId=${session?.user?.id}`}
                    alt={selectedStory.title}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="p-2"
                    onError={(e) => {
                      // Fallback to default image on error
                      const target = e.target as HTMLImageElement;
                      target.src = FIXED_IMAGE_URL;
                    }}
                  />
                </div>
                
                <div className="p-4 border-t border-base-300">
                  <h3 className="font-bold text-xl mb-1">{selectedStory.title}</h3>
                  {selectedStory.caption && (
                    <p className="text-sm opacity-90">{selectedStory.caption}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Create Story Modal */}
        {showCreateStory && (
          <div className="fixed inset-0 z-[60] bg-black bg-opacity-80 flex items-center justify-center p-4">
            <div className="relative max-w-md w-full bg-base-100 rounded-xl overflow-hidden">
              <button 
                onClick={() => setShowCreateStory(false)} 
                className="absolute top-2 right-2 z-10 p-2 bg-base-200 rounded-full"
              >
                <XMarkIcon className="h-6 w-6 text-primary" />
              </button>
              
              <div className="p-6">
                <h3 className="font-bold text-xl mb-4">Create New Story</h3>
                
                <form onSubmit={handleCreateStory}>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Title (required)</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered" 
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      placeholder="Enter a title for your story"
                      maxLength={100}
                      required
                    />
                  </div>
                  
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Caption (optional)</span>
                    </label>
                    <textarea 
                      className="textarea textarea-bordered" 
                      value={storyCaption}
                      onChange={(e) => setStoryCaption(e.target.value)}
                      placeholder="Add a caption to your story"
                      maxLength={250}
                    />
                  </div>
                  
                  <div className="form-control mb-6">
                    <label className="label">
                      <span className="label-text">Image (required)</span>
                    </label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="file-input file-input-bordered w-full" 
                      onChange={(e) => setStoryImage(e.target.files?.[0] || null)}
                      required
                    />                    {storyImage && (
                      <div className="mt-2 relative h-40 w-full">
                        <Image 
                          src={URL.createObjectURL(storyImage)} 
                          alt="Story preview" 
                          fill
                          style={{ objectFit: 'contain' }}
                          className="rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      type="button" 
                      className="btn btn-ghost mr-2" 
                      onClick={() => setShowCreateStory(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={storyUploadLoading || !storyImage || !storyTitle}
                    >
                      {storyUploadLoading ? <span className="loading loading-spinner loading-sm"></span> : 'Post Story'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}