"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import PostCard from "@/components/main/Post";
import Link from "next/link";
import { Users, PlusCircle, Bell, Settings, Info, Shield, MessageSquare, Clock, Flame, TrendingUp, MoreHorizontal } from "lucide-react";

// Type definitions
interface Community {
  _id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  creator: {
    _id: string;
    username: string;
  };
  moderators?: string[];
  members?: string[];
  isMember?: boolean;
  isModerator?: boolean;
  isCreator?: boolean;
  profilePicture?: {
    data?: string;
    contentType?: string;
  };
  bannerImage?: {
    data?: string;
    contentType?: string;
  };
  createdAt: string;
  rules?: {
    title: string;
    description: string;
  }[];
}

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
interface HiveFeedProps {
  communityId: string;
  subPath?: string | null;
}
const HiveFeed: React.FC<HiveFeedProps> = ({communityId, subPath}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const hiveId = communityId || subPath;

  // State variables
  const [hive, setHive] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("recent");
  const [error, setError] = useState<string | null>(null);
  // New state for mobile
  const [showMobileHiveInfo, setShowMobileHiveInfo] = useState(false);
  
  // State for image URLs
  const [profileImageUrl, setProfileImageUrl] = useState<string>('/images/user.png');
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);

  // States for post interaction
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [animatingLikes, setAnimatingLikes] = useState<Record<string, boolean>>({});
  const [commentLikeLoading, setCommentLikeLoading] = useState<Record<string, boolean>>({});
  const [animatingCommentLikes, setAnimatingCommentLikes] = useState<Record<string, boolean>>({});
  const [expandedCommentSections, setExpandedCommentSections] = useState<Record<string, boolean>>({});

  // Convert base64 data to a URL
  const convertBase64ToBlob = (base64String: string, contentType: string): string => {
    try {
      // If the base64 string already has a data URL prefix, use it directly
      if (base64String.includes('base64,')) {
        return base64String;
      }
      // Otherwise, add the appropriate data URL prefix
      return `data:${contentType};base64,${base64String}`;
    } catch (error) {
      console.error("Error converting base64 to data URL:", error);
      return '/images/user.png'; // Fallback image
    }
  };

  // Fetch hive data and posts
  useEffect(() => {
    const fetchHiveDetails = async () => {
      if (!hiveId) return;

      setLoading(true);
      setError(null);
      
      try {
        // Fetch hive details
        const hiveUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/communities/${hiveId}`;
        const hiveQuery = session?.user?.id ? `${hiveUrl}?userId=${session.user.id}` : hiveUrl;
        const hiveResponse = await fetch(hiveQuery);

        if (!hiveResponse.ok) {
          if (hiveResponse.status === 403) {
            setError("This hive is private. You must be a member to view it.");
          } else {
            setError("Failed to fetch hive details");
          }
          setLoading(false);
          return;
        }

        const hiveData = await hiveResponse.json();
        setHive(hiveData);

        // Process profile picture if it exists
        if (hiveData.profilePicture && hiveData.profilePicture.data) {
          const imageUrl = convertBase64ToBlob(
            hiveData.profilePicture.data,
            hiveData.profilePicture.contentType || 'image/jpeg'
          );
          setProfileImageUrl(imageUrl);
        }

        // Process banner image if it exists
        if (hiveData.bannerImage && hiveData.bannerImage.data) {
          const bannerUrl = convertBase64ToBlob(
            hiveData.bannerImage.data,
            hiveData.bannerImage.contentType || 'image/jpeg'
          );
          setBannerImageUrl(bannerUrl);
        }

        // Fetch hive posts
        await fetchHivePosts();
      } catch (error) {
        console.error("Error fetching hive details:", error);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchHiveDetails();
  }, [hiveId, session?.user?.id]);

  // Fetch posts when filter changes
  useEffect(() => {
    if (!loading && hive) {
      fetchHivePosts();
    }
  }, [activeFilter]);

  const fetchHivePosts = async () => {
    if (!hiveId) return;

    try {
      // Fetch posts for the hive
      const postsUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/communities/${hiveId}/posts`;
      const postsQuery = session?.user?.id ? `${postsUrl}?userId=${session.user.id}` : postsUrl;
      const postsResponse = await fetch(postsQuery);

      if (!postsResponse.ok) {
        console.error("Failed to fetch posts");
        return;
      }

      let postsData = await postsResponse.json();
      
      // Apply filter
      switch (activeFilter) {
        case 'popular':
          // Sort by most likes
          postsData.sort((a: Post, b: Post) => b.likes.length - a.likes.length);
          break;
        case 'top':
          // Sort by engagement (likes + comments)
          postsData.sort((a: Post, b: Post) => {
            const aEngagement = a.likes.length + (a.comments?.length || 0);
            const bEngagement = b.likes.length + (b.comments?.length || 0);
            return bEngagement - aEngagement;
          });
          break;
        case 'recent':
        default:
          // Sort by most recent (default)
          postsData.sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }

      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching hive posts:", error);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedCommentSections(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleJoinHive = async () => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    setJoinLoading(true);
    try {
      const endpoint = hive?.isMember 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/communities/${hiveId}/leave`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/communities/${hiveId}/join`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: session.user.id 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${hive?.isMember ? 'leave' : 'join'} hive`);
      }
      
      // Update hive member status in state
      if (hive) {
        setHive({
          ...hive,
          isMember: !hive.isMember
        });
      }
      
    } catch (error) {
      console.error(`Error ${hive?.isMember ? 'leaving' : 'joining'} hive:`, error);
    } finally {
      setJoinLoading(false);
    }
  };

  // Post interaction handlers
  const handleLikePost = async (postId: string) => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    setLikeLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });
      
      if (!response.ok) throw new Error('Failed to like post');
      
      // Update post in state
      setPosts(prev => 
        prev.map(post => {
          if (post._id === postId) {
            const userLiked = post.likes.includes(session.user.id as string);
            return {
              ...post,
              likes: userLiked
                ? post.likes.filter(id => id !== session.user.id)
                : [...post.likes, session.user.id as string]
            };
          }
          return post;
        })
      );
      
      // Show animation
      setAnimatingLikes(prev => ({ ...prev, [postId]: true }));
      setTimeout(() => {
        setAnimatingLikes(prev => ({ ...prev, [postId]: false }));
      }, 1000);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLikeLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: session.user.id,
          username: session.user.name || 'Anonymous',
          text 
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add comment');
      
      const newComment = await response.json();
      
      // Update post in state
      setPosts(prev => 
        prev.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, newComment]
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    setCommentLikeLoading(prev => ({ ...prev, [commentId]: true }));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });
      
      if (!response.ok) throw new Error('Failed to like comment');
      
      // Update post in state
      setPosts(prev => 
        prev.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.map(comment => {
                if (comment._id === commentId) {
                  const userLiked = comment.likes.includes(session.user.id as string);
                  return {
                    ...comment,
                    likes: userLiked
                      ? comment.likes.filter(id => id !== session.user.id)
                      : [...comment.likes, session.user.id as string]
                  };
                }
                return comment;
              })
            };
          }
          return post;
        })
      );
      
      // Show animation
      setAnimatingCommentLikes(prev => ({ ...prev, [commentId]: true }));
      setTimeout(() => {
        setAnimatingCommentLikes(prev => ({ ...prev, [commentId]: false }));
      }, 1000);
    } catch (error) {
      console.error('Error liking comment:', error);
    } finally {
      setCommentLikeLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleReplyToComment = async (postId: string, commentId: string, text: string) => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: session.user.id,
          username: session.user.name || 'Anonymous',
          text 
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add reply');
      
      const reply = await response.json();
      
      // Update post in state
      setPosts(prev => 
        prev.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.map(comment => {
                if (comment._id === commentId) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), reply]
                  };
                }
                return comment;
              })
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format numbers (e.g., 1K, 2.5M)
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-base-300">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-base-300">
        <Header />
        <div className="flex mt-[70px]">
          <Sidebar />
          <main className="flex-1 md:ml-[280px] pb-8 px-4 md:px-8 flex items-center justify-center mb-[60px] md:mb-0">
            <div className="bg-base-100 rounded-xl md:rounded-2xl p-6 md:p-8 max-w-md text-center">
              <Shield size={40} className="mx-auto mb-4 text-error" />
              <h2 className="text-lg md:text-xl font-bold mb-2">Access Restricted</h2>
              <p className="text-base-content/70 mb-4">{error}</p>
              <Link href="/hives" className="btn btn-primary">
                Explore Other Hives
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!hive) {
    return (
      <div className="min-h-screen flex flex-col bg-base-300">
        <Header />
        <div className="flex mt-[70px]">
          <Sidebar />
          <main className="flex-1 md:ml-[280px] pb-8 px-4 md:px-8 flex items-center justify-center mb-[60px] md:mb-0">
            <div className="bg-base-100 rounded-xl md:rounded-2xl p-6 md:p-8 max-w-md text-center">
              <Info size={40} className="mx-auto mb-4 text-error" />
              <h2 className="text-lg md:text-xl font-bold mb-2">Hive Not Found</h2>
              <p className="text-base-content/70 mb-4">The hive you're looking for doesn't exist or has been removed.</p>
              <Link href="/hives" className="btn btn-primary">
                Explore Hives
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Header />
      <div className="flex mt-[-54px] md:mt-[70px]">
        <Sidebar />
        <main className="flex-1 md:ml-[280px] pb-8 mb-[60px] md:mb-0">
          {/* Hive Banner */}
          <div className="relative">
            <div className="h-32 md:h-48 w-full bg-slate-700 relative overflow-hidden">
              {/* If banner image exists, show it */}
              {bannerImageUrl ? (
                <img 
                  src={bannerImageUrl}
                  alt={`${hive.name} banner`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-primary to-secondary opacity-50"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-base-300 to-transparent opacity-60"></div>
            </div>

            {/* Hive info overlay */}
            <div className="absolute -bottom-12 md:-bottom-16 left-4 md:left-8 flex items-end">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-base-300 bg-white overflow-hidden">
                <img 
                  src={profileImageUrl}
                  alt={hive.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="ml-3 md:ml-4 mb-2 md:mb-4">
                <h1 className="text-xl md:text-2xl font-bold text-base-content">h/{hive.name}</h1>
                <p className="text-gray-400 text-xs md:text-sm">{hive.isPrivate ? 'Private Hive' : 'Public Hive'}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="absolute right-4 md:right-8 bottom-4 flex items-center gap-1 md:gap-2">
              {hive.isCreator ? (
                <Link href={`/hives/${hiveId}/edit`} className="bg-primary text-white hover:bg-primary-focus py-1 px-3 md:px-6 rounded-full text-sm md:text-base font-medium">
                  <Settings size={14} className="md:mr-2 inline" />
                  <span className="hidden md:inline">Manage Hive</span>
                </Link>
              ) : (
                <button
                  onClick={handleJoinHive}
                  disabled={joinLoading}
                  className={`${hive.isMember ? 'bg-transparent border border-white text-base-content hover:bg-white/10' : 'bg-primary text-white hover:bg-primary-focus'} py-1 px-3 md:px-6 rounded-full text-sm md:text-base font-medium`}
                >
                  {joinLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full mr-2"></span>
                      <span className="hidden md:inline">{hive.isMember ? 'Leaving...' : 'Joining...'}</span>
                    </span>
                  ) : (
                    hive.isMember ? (
                      <>
                        <span className="hidden md:inline">Leave Hive</span>
                        <span className="inline md:hidden">Leave</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden md:inline">Join Hive</span>
                        <span className="inline md:hidden">Join</span>
                      </>
                    )
                  )}
                </button>
              )}
              {!hive.isCreator && (
                <button className="bg-transparent text-base-content border border-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                  <Bell size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Hive Stats - Quick view */}
          <div className="md:hidden px-4 mt-14 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="text-center">
                  <div className="text-base-content font-semibold">{hive.members?.length || 0}</div>
                  <div className="text-gray-400 text-xs">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-base-content font-semibold">{posts.length}</div>
                  <div className="text-gray-400 text-xs">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-base-content font-semibold">{formatDate(hive.createdAt).split(', ')[1]}</div>
                  <div className="text-gray-400 text-xs">Created</div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowMobileHiveInfo(!showMobileHiveInfo)} 
                className="btn btn-sm btn-ghost"
              >
                {showMobileHiveInfo ? 'Hide Info' : 'More Info'}
              </button>
            </div>
            
            {/* Mobile Hive Details Dropdown */}
            {showMobileHiveInfo && (
              <div className="mt-4 bg-base-100 rounded-xl p-4 text-sm">
                <div className="mb-3">
                  <h3 className="text-base-content font-medium text-sm mb-1">Description</h3>
                  <p className="text-gray-400">{hive.description}</p>
                </div>
                
                {/* Creator info */}
                <div className="mb-3">
                  <h3 className="text-base-content font-medium text-sm mb-1">Creator</h3>
                  <Link href={`/user/${hive.creator?._id}`} className="flex items-center gap-2 hover:bg-base-300/50 p-1 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users size={12} />
                    </div>
                    <span className="text-sm">{hive.creator?.username || 'Unknown'}</span>
                  </Link>
                </div>
                
                {/* Rules section - if rules exist */}
                {hive.rules && hive.rules.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-base-content font-medium text-sm mb-1">Hive Rules</h3>
                    <div className="max-h-32 overflow-y-auto">
                      {hive.rules.map((rule, index) => (
                        <div key={index} className="text-sm mb-2">
                          <p className="font-medium">{index + 1}. {rule.title}</p>
                          {rule.description && (
                            <p className="text-gray-400 text-xs">{rule.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action button for mobile */}
                {!hive.isCreator && (
                  <button 
                    onClick={handleJoinHive}
                    disabled={joinLoading}
                    className={`w-full ${hive.isMember ? 'bg-base-300 hover:bg-base-100 text-base-content' : 'bg-primary hover:bg-primary-focus text-white'} font-medium py-2 rounded-full text-sm mt-2`}
                  >
                    {joinLoading ? 
                      <span className="flex items-center justify-center">
                        <span className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full mr-2"></span>
                        {hive.isMember ? 'Leaving...' : 'Joining...'}
                      </span>
                      : 
                      hive.isMember ? 'Leave Hive' : 'Join Hive'
                    }
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content area */}
          <div className="px-4 md:px-8 mt-4 md:mt-20 flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Posts Feed */}
            <div className="w-full md:flex-[2] md:max-w-[calc(100%-372px)]">
              {/* Create Post / Filters Bar */}
              <div className="bg-base-100 rounded-xl md:rounded-2xl mb-4 p-1.5 md:p-2 flex flex-wrap items-center justify-between">
                <div className="flex overflow-x-auto scrollbar-hide">
                  <button 
                    className={`flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-full text-xs md:text-sm whitespace-nowrap ${activeFilter === 'recent' ? 'bg-secondary text-white' : 'text-base-content hover:bg-primary/50'}`}
                    onClick={() => setActiveFilter('recent')}
                  >
                    <Clock size={12} className="md:block" />
                    <span>Recent</span>
                  </button>
                  <button 
                    className={`flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-full text-xs md:text-sm whitespace-nowrap ${activeFilter === 'popular' ? 'bg-secondary text-white' : 'text-base-content hover:bg-primary/50'}`}
                    onClick={() => setActiveFilter('popular')}
                  >
                    <Flame size={12} className="md:block" />
                    <span>Popular</span>
                  </button>
                  <button 
                    className={`flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-full text-xs md:text-sm whitespace-nowrap ${activeFilter === 'top' ? 'bg-secondary text-white' : 'text-base-content hover:bg-primary/50'}`}
                    onClick={() => setActiveFilter('top')}
                  >
                    <TrendingUp size={12} className="md:block" />
                    <span>Top</span>
                  </button>
                </div>
                
                {hive.isMember && (
                  <Link href="/posts/create" className="btn btn-xs md:btn-sm btn-primary mt-2 md:mt-0 w-full md:w-auto">
                    <PlusCircle size={14} className="mr-1" />
                    Create Post
                  </Link>
                )}
              </div>

              {/* Posts */}
              {posts.length > 0 ? (
                <div className="space-y-4">
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
                </div>
              ) : (
                <div className="bg-base-100 rounded-xl md:rounded-2xl p-4 md:p-6 text-center">
                  <MessageSquare size={36} className="mx-auto mb-3 md:mb-4 text-primary opacity-50" />
                  <p className="text-gray-400 text-sm md:text-base mb-3 md:mb-4">No posts in this hive yet.</p>
                  {hive.isMember && (
                    <Link href="/posts/create" className="btn btn-xs md:btn-sm btn-primary">
                      <PlusCircle size={14} className="mr-1 md:mr-2" />
                      Create the First Post
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Hive Details - Right Sidebar */}
            <aside className="sticky top-[102px] self-start w-[340px] max-h-[calc(100vh-150px)] overflow-y-auto hidden md:block">
              {/* About Hive */}
              <div className="bg-base-100 rounded-2xl overflow-hidden mb-4">
                <div className="p-4 border-b border-base-300">
                  <h2 className="text-base-content font-medium text-base mb-2">About h/{hive.name}</h2>
                  <p className="text-base-content/80 text-sm mb-3">{hive.description}</p>
                  
                  {/* Stats */}
                  <div className="flex flex-col gap-2 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="text-base-content font-medium">{hive.members?.length || 0}</div>
                        <div className="text-gray-400 text-xs">Members</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-base-content font-medium">{posts.length}</div>
                        <div className="text-gray-400 text-xs">Posts</div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span className="text-gray-400">Created {hive.createdAt ? formatDate(hive.createdAt) : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  {!hive.isCreator && (
                    <div className="mt-3">
                      <button 
                        onClick={handleJoinHive}
                        disabled={joinLoading}
                        className={`w-full ${hive.isMember ? 'bg-base-300 hover:bg-base-100 text-base-content' : 'bg-primary hover:bg-primary-focus text-white'} font-medium py-2 rounded-full text-sm`}
                      >
                        {joinLoading ? 
                          <span className="flex items-center justify-center">
                            <span className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full mr-2"></span>
                            {hive.isMember ? 'Leaving...' : 'Joining...'}
                          </span>
                          : 
                          hive.isMember ? 'Leave Hive' : 'Join Hive'
                        }
                      </button>
                    </div>
                  )}
                </div>

                {/* Creator info */}
                <div className="p-4 border-b border-base-300">
                  <h3 className="text-base-content font-medium text-sm mb-2">Creator</h3>
                  <Link href={`/user/${hive.creator?._id}`} className="flex items-center gap-2 hover:bg-base-300/50 p-1 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users size={14} />
                    </div>
                    <span className="text-sm">{hive.creator?.username || 'Unknown'}</span>
                  </Link>
                </div>
                
                {/* Rules section - if rules exist */}
                {hive.rules && hive.rules.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-base-content font-medium text-sm mb-2">Hive Rules</h3>
                    <ul className="space-y-2">
                      {hive.rules.map((rule, index) => (
                        <li key={index} className="text-sm">
                          <p className="font-medium">{index + 1}. {rule.title}</p>
                          {rule.description && (
                            <p className="text-gray-400 text-xs">{rule.description}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HiveFeed;