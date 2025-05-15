"use client";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import { MessageSquare, ArrowBigUp, Share2, Clock, Flame, TrendingUp, MoreHorizontal, Bell, Bookmark, Shield, Award, User } from 'lucide-react';

// Types for community data
interface Community {
  _id: string;
  name: string;
  description: string;
  creator: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  moderators: {
    _id: string;
    username: string;
    profilePicture?: string;
  }[];
  isPrivate: boolean;
  createdAt: string;
  rules?: {
    title: string;
    description: string;
  }[];
  profilePicture?: {
    data?: any;
    contentType?: string;
  };
  bannerImage?: {
    data?: any;
    contentType?: string;
  };
  members?: any[];
}

// Types for community post
interface Post {
  _id: string;
  title: string;
  content: string;
  userId: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  createdAt: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  community?: {
    _id: string;
    name: string;
  };
  tags?: string[];
  hasImages?: boolean;
  images?: {
    _id: string;
    contentType: string;
  }[];
}

// Default achievements for communities
const defaultAchievements = [
  { name: "Active Community", icon: <Flame size={16} /> },
  { name: "Growing Fast", icon: <TrendingUp size={16} /> }
];

interface FeedProps {
  communityId: string;
  subPath?: string | null;
}

export default function Feed({ communityId, subPath }: FeedProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("hot");
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});
  
  // State for community data
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);

  // Fetch community data
    // ...existing code...
  
  // Fetch community data
    // Fix the variable name inconsistencies - communityName -> communityId and community_id -> communityId
  
  // Update the useEffect to use the correct communityId variable
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setLoading(true);
        // Now fetch the detailed community data using the ID
        const userId = session?.user?.id;
        const detailsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/communities/${communityId}${userId ? `?userId=${userId}` : ''}`
        );
        
        if (!detailsResponse.ok) {
          throw new Error('Failed to fetch community details');
        }
        
        const communityData = await detailsResponse.json();
        setCommunity(communityData);
        
        // Check if user is a member
        if (userId && communityData.members) {
          setIsMember(communityData.members.some((id: string) => id === userId));
        }
  
        // Fetch community posts
        const postsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/communities/${communityData._id}/posts${userId ? `?userId=${userId}` : ''}`
        );
        
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch community posts');
        }
        
        const postsData = await postsResponse.json();
        setPosts(postsData);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching community data:", err);
        setError('Error loading community data. Please try again later.');
        setLoading(false);
      }
    };
  
    if (communityId) {
      fetchCommunityData();
    }
  }, [communityId]);
  
  // ...rest of the component...
  // Handle joining community
  const handleJoinCommunity = async () => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    try {
      if (!community?._id) return;
      
      const response = await fetch(`/api/communities/${community._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to join community');
      }

      // Update UI state
      setIsMember(true);
    } catch (err) {
      console.error("Error joining community:", err);
    }
  };

  // Handle leaving community
  const handleLeaveCommunity = async () => {
    if (!session?.user?.id) {
      return;
    }

    try {
      if (!community?._id) return;
      
      const response = await fetch(`/api/communities/${community._id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to leave community');
      }

      // Update UI state
      setIsMember(false);
    } catch (err) {
      console.error("Error leaving community:", err);
    }
  };

  // Toggle content expansion for posts
  const toggleExpand = (postId: string) => {
    setIsExpanded(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Protect this route - redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Show loading state while checking authentication or fetching data
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-base-300">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-400 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-base-300">
        <Header />
        <div className="flex-1 flex items-center justify-center flex-col p-4">
          <h2 className="text-xl text-red-400 mb-4">Error</h2>
          <p className="text-base-content">{error}</p>
          <button 
            onClick={() => router.push('/hives')} 
            className="btn btn-active btn-primary mt-4"
          >
            Back to Hives
          </button>
        </div>
      </div>
    );
  }

  // Format the date string for UI display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format time ago for posts
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHr = Math.round(diffMin / 60);
    const diffDays = Math.round(diffHr / 24);

    if (diffSec < 60) return `${diffSec} sec. ago`;
    if (diffMin < 60) return `${diffMin} min. ago`;
    if (diffHr < 24) return `${diffHr} hr. ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    return formatDate(dateString);
  };

  // Main content - only shown to authenticated users
  return (
    <div className="min-h-screen flex flex-col bg-base-300">
      <Header />
      <div className="flex mt-[70px]">
        <Sidebar />
        <main className="flex-1 ml-[280px]">
          {/* Community Banner */}
          <div className="relative">
            <div className="h-48 w-full bg-gradient-to-r from-blue-900 to-blue-800 relative overflow-hidden">
              {community?.bannerImage?.contentType ? (
                <img 
                  src={`/api/communities/${community._id}/banner`} 
                  alt="" 
                  className="w-full h-full object-cover opacity-80" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60"></div>
            </div>

            {/* Community info overlay */}
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div className="w-24 h-24 rounded-full border-4 border-slate-950 bg-white overflow-hidden">
                {community?.profilePicture?.contentType ? (
                  <img 
                    src={`/api/communities/${community._id}/profile-picture`} 
                    alt={community.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-base-content text-2xl font-bold">
                    {community?.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="ml-4 mb-4">
                <h1 className="text-2xl font-bold text-base-content">{community?.name}</h1>
                <p className="text-gray-400 text-sm">r/{community?.name.toLowerCase()}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="absolute right-8 bottom-4 flex items-center gap-2">
              {!isMember ? (
                <button 
                  onClick={handleJoinCommunity}
                  className="bg-white text-slate-950 hover:bg-gray-200 py-1 px-6 rounded-full font-medium"
                >
                  Join
                </button>
              ) : (
                <button 
                  onClick={handleLeaveCommunity}
                  className="bg-transparent border border-white text-base-content hover:bg-white/10 py-1 px-6 rounded-full font-medium"
                >
                  Joined
                </button>
              )}
              <button className="bg-transparent text-base-content border border-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                <Bell size={16} />
              </button>
              <button className="bg-transparent text-base-content w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="px-8 mt-20 flex gap-6">
            {/* Posts Feed */}
            <div className="flex-[2] max-w-[calc(100%-372px)]">
              {/* Create Post Button (Mobile) */}
              <div className="md:hidden mb-4">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-base-content font-medium py-2 rounded-full text-sm">
                  Create Post
                </button>
              </div>

              {/* Filters */}
              <div className="bg-base-300 rounded-2xl mb-4 p-2 flex items-center">
                <button 
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${activeFilter === 'hot' ? 'bg-slate-800 text-base-content' : 'text-gray-300 hover:bg-slate-800/50'}`}
                  onClick={() => setActiveFilter('hot')}
                >
                  <Flame size={14} />
                  <span>Hot</span>
                </button>
                <button 
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${activeFilter === 'new' ? 'bg-slate-800 text-base-content' : 'text-gray-300 hover:bg-slate-800/50'}`}
                  onClick={() => setActiveFilter('new')}
                >
                  <Clock size={14} />
                  <span>New</span>
                </button>
                <button 
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${activeFilter === 'top' ? 'bg-slate-800 text-base-content' : 'text-gray-300 hover:bg-slate-800/50'}`}
                  onClick={() => setActiveFilter('top')}
                >
                  <TrendingUp size={14} />
                  <span>Top</span>
                </button>
              </div>

              {/* Create Post Box */}
              <div className="bg-base-300 rounded-2xl p-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Create Post"
                    className="flex-1 bg-[#1a2235] text-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Posts */}
              {posts.length > 0 ? (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div key={post._id} className="bg-base-300 rounded-2xl overflow-hidden">
                      <div className="flex">
                        {/* Voting */}
                        <div className="w-10 bg-[#1a2235] flex flex-col items-center py-2 gap-1">
                          <button className="text-gray-400 hover:text-orange-500 transition-colors">
                            <ArrowBigUp size={18} />
                          </button>
                          <span className="text-xs font-medium text-base-content">{post.upvotes - (post.downvotes || 0)}</span>
                          <button className="text-gray-400 hover:text-blue-500 transition-colors">
                            <ArrowBigUp className="rotate-180" size={18} />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-3">
                          <div className="flex items-center text-xs text-gray-400 mb-2">
                            <span>Posted by {post.userId.username} {getTimeAgo(post.createdAt)}</span>
                          </div>

                          <h3 className="font-medium text-lg text-base-content mb-2">{post.title}</h3>

                          {post.hasImages && (
                            <div className="mb-3 bg-[#1a2235] rounded-xl overflow-hidden">
                              <img 
                                src={`/api/posts/${post._id}/images/${post.images?.[0]?._id}`} 
                                alt={post.title} 
                                className="w-full object-cover max-h-[400px]" 
                              />
                            </div>
                          )}

                          <div className={`text-sm text-gray-300 mb-3 ${isExpanded[post._id] ? '' : 'line-clamp-3'}`}>
                            {post.content}
                          </div>

                          {post.content.length > 150 && (
                            <button 
                              onClick={() => toggleExpand(post._id)} 
                              className="text-xs text-blue-400 hover:text-blue-300 mb-2"
                            >
                              {isExpanded[post._id] ? 'Show less' : 'Read more'}
                            </button>
                          )}

                          {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center gap-2 mb-1">
                              {post.tags.map((tag, index) => (
                                <span key={index} className="bg-[#1a2235] text-gray-300 px-2 py-0.5 rounded-full text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-2">
                            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 hover:bg-slate-700/30 py-1 px-2 rounded transition-colors">
                              <MessageSquare size={16} />
                              <span>{post.commentCount || 0} Comments</span>
                            </button>
                            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 hover:bg-slate-700/30 py-1 px-2 rounded transition-colors">
                              <Share2 size={16} />
                              <span>Share</span>
                            </button>
                            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 hover:bg-slate-700/30 py-1 px-2 rounded transition-colors">
                              <Bookmark size={16} />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-base-300 rounded-2xl p-6 text-center">
                  <p className="text-gray-300">No posts in this community yet.</p>
                  <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-base-content font-medium py-2 px-4 rounded-full text-sm">
                    Create the First Post
                  </button>
                </div>
              )}
            </div>

            {/* Community Details - Right Sidebar */}
            <aside className="sticky top-[102px] self-start w-[340px] max-h-[calc(100vh-150px)] overflow-y-auto hidden md:block">
              {/* About Community */}
              <div className="bg-base-300 rounded-2xl overflow-hidden mb-4">
                <div className="p-3 border-b border-slate-700">
                  <h2 className="text-base-content font-medium text-base mb-2">About Community</h2>
                  <p className="text-gray-400 text-sm mb-3">
                    {community?.description}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-col gap-2 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="text-base-content font-medium">{community?.members?.length || 0}</div>
                        <div className="text-gray-400 text-xs">Members</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center text-base-content font-medium">
                          {Math.floor(Math.random() * 10) + 1} <span className="h-2 w-2 rounded-full bg-green-500 ml-1"></span>
                        </div>
                        <div className="text-gray-400 text-xs">Online</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-base-content font-medium">Top {Math.floor(Math.random() * 10) + 1}%</div>
                        <div className="text-gray-400 text-xs">Rank</div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span className="text-gray-400">Created {formatDate(community?.createdAt || '')}</span>
                    </div>
                  </div>

                  {/* Create Post button */}
                  <div className="my-3">
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-base-content font-medium py-2 rounded-full text-sm">
                      Create Post
                    </button>
                  </div>
                </div>

                {/* Community achievements */}
                <div className="p-3 border-b border-slate-700">
                  <h3 className="text-base-content font-medium text-sm mb-2">Community Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    {defaultAchievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-1 bg-[#1a2235] rounded-full px-2 py-1 text-xs text-gray-300">
                        <span className="text-blue-400">{achievement.icon}</span>
                        {achievement.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rules */}
              {community?.rules && community.rules.length > 0 ? (
                <div className="bg-base-300 rounded-2xl overflow-hidden mb-4">
                  <div className="p-3">
                    <h3 className="text-base-content font-medium text-base mb-2">r/{community.name} Rules</h3>
                    <ol className="space-y-2 text-gray-300">
                      {community.rules.map((rule, index) => (
                        <li key={index} className="border-b border-slate-700 pb-2">
                          <div className="flex items-start gap-1">
                            <span className="font-medium text-sm">{index + 1}. {rule.title}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{rule.description}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : null}

              {/* Moderators */}
              <div className="bg-base-300 rounded-2xl overflow-hidden">
                <div className="p-3">
                  <h3 className="text-base-content font-medium text-base mb-2">Moderators</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    {community?.moderators && community.moderators.map((mod) => (
                      <li key={mod._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Shield size={14} className="text-blue-400" />
                          <span className="text-blue-400 hover:underline cursor-pointer">u/{mod.username}</span>
                        </div>
                        {mod._id === community.creator._id && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Creator</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}