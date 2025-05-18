"use client";

import React, { useState, useEffect } from "react";
import { User, Settings, LogOut, Edit, MessageSquare, ArrowBigUp, Share2, Clock, Flame, TrendingUp, MoreHorizontal, Bell, Bookmark } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import PostCard from "@/components/main/Post";

interface UserDataProp {
  id: string;
  name: string;
  email: string;
  username: string;
  hasProfilePicture: boolean;
  profilePicture?: string;
  image?: string;
  bannerColor?: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  blockedUserIds: string[];
  settings: {
    receiveEmailNotifications: boolean;
    theme: string;
  };
}

interface UserProfileProps {
    userId: string;
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

export default function UserProfile({ userId }: UserProfileProps) {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserDataProp | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('/images/user.png');
  const router = useRouter();
  const params = useParams();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [bannerColor, setBannerColor] = useState<string | undefined>("bg-slate-500");
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [activeFilter, setActiveFilter] = useState("recent");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  // States for post interaction
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [animatingLikes, setAnimatingLikes] = useState<Record<string, boolean>>({});
  const [commentLikeLoading, setCommentLikeLoading] = useState<Record<string, boolean>>({});
  const [animatingCommentLikes, setAnimatingCommentLikes] = useState<Record<string, boolean>>({});
  const [expandedCommentSections, setExpandedCommentSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isSigningOut && status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, isSigningOut, router]);

 
  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);
      console.log("User ID from profile:" + userId)
      // If userId is not available, return early
      if (!userId) {
        setLoading(false);
        return;
      }

      // Check if viewing own profile
      if (session?.user?.id && userId === session.user.id) {
        setIsCurrentUser(true);
      }
      
      try {
        // Fetch user details
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user details: ${response.statusText}`);
        }
        
        const data = await response.json();
        setUserData(data);
        
        if (data.bannerColor) {
          setBannerColor(data.bannerColor.replace("bg-", ""));
        }
        
        // Handle the profile picture if it exists
        if (data.hasProfilePicture && data.profilePicture) {
          try {
            // Convert the blob data to a URL
            const blob = convertBase64ToBlob(data.profilePicture);
            const imageUrl = URL.createObjectURL(blob);
            setProfileImageUrl(imageUrl);
          } catch (error) {
            console.error("Error converting profile picture:", error);
            // Fallback to default avatar
            setProfileImageUrl('/images/user.png');
          }
        } else if (data.image) {
          // If there's an image URL available but no blob data
          setProfileImageUrl(data.image);
        }
        
        // Now fetch user's posts
        await fetchUserPosts(userId);
      } catch (error) {
        console.error("Error in setup:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (status !== "loading" && userId) {
      fetchData();
    }
  }, [userId, session, status]);

  // When activeFilter changes, re-fetch posts with the new filter
  useEffect(() => {
    if (userId && !loading) {
      fetchUserPosts(userId);
    }
  }, [activeFilter, userId]);

  // Add this new function to fetch user posts with filters
  const fetchUserPosts = async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user posts: ${response.statusText}`);
      }
      
      const posts = await response.json();
      
      // Apply active filter
      let filteredPosts = [...posts];
      
      switch (activeFilter) {
        case 'popular':
          // Sort by most likes
          filteredPosts.sort((a, b) => b.likes.length - a.likes.length);
          break;
        case 'top':
          // Sort by engagement (likes + comments)
          filteredPosts.sort((a, b) => {
            const aEngagement = a.likes.length + (a.comments?.length || 0);
            const bEngagement = b.likes.length + (b.comments?.length || 0);
            return bEngagement - aEngagement;
          });
          break;
        case 'recent':
        default:
          // Sort by most recent (default)
          filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
      
      setUserPosts(filteredPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const convertBase64ToBlob = (base64String: string): Blob => {
    // Remove potential data URL prefix
    const base64Data = base64String.includes('base64,') 
      ? base64String.split('base64,')[1] 
      : base64String;
    
    try {
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i += 512) {
        const slice = byteCharacters.slice(i, i + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let j = 0; j < slice.length; j++) {
          byteNumbers[j] = slice.charCodeAt(j);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      return new Blob(byteArrays, { type: 'image/jpeg' });
    } catch (error) {
      console.error("Error converting base64 to blob:", error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: false });
  };
  
  const handleFollowToggle = async () => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }
    
    setFollowLoading(true);
    try {
      const endpoint = isFollowing 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/unfollow/${userId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/users/follow/${userId}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          followerId: session.user.id 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
      }
      
      setIsFollowing(prev => !prev);
      
      if (userData) {
        setUserData({
          ...userData,
          followersCount: isFollowing 
            ? Math.max(0, userData.followersCount - 1)
            : userData.followersCount + 1
        });
      }
    } catch (error) {
      console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} user:`, error);
    } finally {
      setFollowLoading(false);
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
      setUserPosts(prev => 
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
      setUserPosts(prev => 
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
      setUserPosts(prev => 
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
      setUserPosts(prev => 
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

  const toggleComments = (postId: string) => {
    setExpandedCommentSections(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Check if user is already being followed when profile loads
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!session?.user?.id || isCurrentUser || !userId) return;
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}`);
        if (response.ok) {
          const currentUser = await response.json();
          // Check if the current user is following the profile user
          setIsFollowing(currentUser.following && currentUser.following.includes(userId));
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };
    
    checkFollowStatus();
  }, [session?.user?.id, userId, isCurrentUser]);

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

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Header />
      <div className="flex mt-[70px]">
        <Sidebar />
        <main className="flex-1 ml-[280px] pb-8">
          {/* User Banner */}
          <div className="relative">
            <div className={`h-48 w-full bg-${bannerColor || 'slate'} relative overflow-hidden`}>
              <div className="w-full h-full bg-gradient-to-r from-base-300 to-transparent opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-base-300 to-transparent opacity-60"></div>
            </div>

            {/* User info overlay */}
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div className="w-24 h-24 rounded-full border-4 border-base-300 bg-white overflow-hidden">
                <img 
                  src={profileImageUrl}
                  alt={userData?.name || 'User'} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="ml-4 mb-4">
                <h1 className="text-2xl font-bold text-base-content">{userData?.name}</h1>
                <p className="text-gray-400 text-sm">@{userData?.username}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="absolute right-8 bottom-4 flex items-center gap-2">
              {isCurrentUser ? (
                <>
                  <Link href="settings/profile"
                    className="bg-primary text-white hover:bg-primary-focus py-1 px-6 rounded-full font-medium"
                  >
                    <Edit size={16} className="mr-2 inline" />
                    Edit Profile
                  </Link>
                  <button className="bg-transparent text-base-content border border-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
                  onClick={() => router.push('/settings/account')}>
                    <Settings size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`${isFollowing 
                      ? 'bg-transparent border border-white text-base-content hover:bg-white/10' 
                      : 'bg-primary text-white hover:bg-primary-focus'
                    } py-1 px-6 rounded-full font-medium relative`}
                  >
                    {followLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full mr-2"></span>
                        {isFollowing ? 'Unfollowing...' : 'Following...'}
                      </span>
                    ) : (
                      isFollowing ? 'Following' : 'Follow'
                    )}
                  </button>
                  <button className="bg-transparent text-base-content border border-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                    <Bell size={16} />
                  </button>
                  <button className="bg-transparent text-base-content w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                    <MoreHorizontal size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content area */}
          <div className="px-8 mt-20 flex gap-6">
            {/* Posts Feed */}
            <div className="flex-[2] max-w-[calc(100%-372px)]">
              {/* Filters */}
              <div className="bg-base-100 rounded-2xl mb-4 p-2 flex items-center">
                <button 
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${activeFilter === 'recent' ? 'bg-secondary text-white' : 'text-base-content hover:bg-primary/50'}`}
                  onClick={() => {
                    console.log("Setting filter to recent");
                    setActiveFilter('recent');
                  }}
                >
                  <Clock size={14} />
                  <span>Recent</span>
                </button>
                <button 
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${activeFilter === 'popular' ? 'bg-secondary text-white' : 'text-base-content hover:bg-primary/50'}`}
                  onClick={() => {
                    console.log("Setting filter to popular");
                    setActiveFilter('popular');
                  }}
                >
                  <Flame size={14} />
                  <span>Popular</span>
                </button>
                <button 
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${activeFilter === 'top' ? 'bg-secondary text-white' : 'text-base-content hover:bg-primary/50'}`}
                  onClick={() => {
                    console.log("Setting filter to top");
                    setActiveFilter('top');
                  }}
                >
                  <TrendingUp size={14} />
                  <span>Top</span>
                </button>
              </div>

              {/* Posts */}
              {userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map((post) => (
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
                <div className="bg-base-100 rounded-2xl p-6 text-center">
                  <p className="text-gray-400">No posts from this user yet.</p>
                  {isCurrentUser && (
                    <button 
                      onClick={() => router.push('/create-post')}
                      className="mt-4 bg-primary hover:bg-primary-focus text-white font-medium py-2 px-4 rounded-full text-sm"
                    >
                      Create Your First Post
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* User Details - Right Sidebar */}
            <aside className="sticky top-[102px] self-start w-[340px] max-h-[calc(100vh-150px)] overflow-y-auto hidden md:block">
              {/* About User */}
              <div className="bg-base-100 rounded-2xl overflow-hidden mb-4">
                <div className="p-4 border-b border-base-300">
                  <h2 className="text-base-content font-medium text-base mb-2">About {userData?.name}</h2>
                  
                  {/* Stats */}
                  <div className="flex flex-col gap-2 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="text-base-content font-medium">{userData?.followersCount || 0}</div>
                        <div className="text-gray-400 text-xs">Followers</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-base-content font-medium">{userData?.followingCount || 0}</div>
                        <div className="text-gray-400 text-xs">Following</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-base-content font-medium">{userPosts.length}</div>
                        <div className="text-gray-400 text-xs">Posts</div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span className="text-gray-400">Joined {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {isCurrentUser ? (
                    <div className="my-3">
                      <button 
                        onClick={handleSignOut}
                        className="w-full bg-error hover:bg-error-content text-white font-medium py-2 rounded-full text-sm flex items-center justify-center gap-2"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="my-3">
                      <button 
                        onClick={handleFollowToggle}
                        className={`w-full ${isFollowing 
                          ? 'bg-base-300 hover:bg-base-100 text-base-content' 
                          : 'bg-primary hover:bg-primary-focus text-white'
                        } font-medium py-2 rounded-full text-sm`}
                      >
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Email (only visible to self) */}
                {isCurrentUser && userData?.email && (
                  <div className="p-4 border-b border-base-300">
                    <h3 className="text-base-content font-medium text-sm mb-2">Email</h3>
                    <p className="text-gray-400 text-sm">{userData.email}</p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}