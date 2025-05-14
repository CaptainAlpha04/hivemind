"use client";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import { MessageSquare, ArrowBigUp, Share2, Clock, Flame, TrendingUp, MoreHorizontal, Bell, Bookmark, Shield, Award, User } from 'lucide-react';

// Dummy data for NUST hive
const hiveInfo = {
  id: 1,
  name: "NUST",
  fullName: "National University of Science and Technology",
  logo: "https://picsum.photos/200/200?random=20",
  banner: "https://picsum.photos/1920/300?random=1",
  description: "A place for NUST students, aspirants, and alumni to discuss all things NUST!",
  members: "44K",
  online: 11,
  rank: "Top 3%",
  created: "Sep 18, 2013",
  isJoined: false
};

// Dummy data for community achievements
const achievements = [
  { name: "Academic Excellence", icon: <Award size={16} /> },
  { name: "Most Active", icon: <Flame size={16} /> },
  { name: "Trending Community", icon: <TrendingUp size={16} /> }
];

// Dummy data for moderators
const moderators = [
  { name: "u/NUSTmod", role: "Admin", since: "2013" },
  { name: "u/TechGuru", role: "Moderator", since: "2018" },
  { name: "u/SEECSprof", role: "Moderator", since: "2020" }
];

// Dummy data for community rules
const rules = [
  { title: "Personal Attacks or Harassment", description: "Be respectful to fellow members. No personal attacks, hate speech, or harassment." },
  { title: "Profane, Obscene or Indecent Content", description: "Keep it clean and professional. NUST is an academic community." },
  { title: "Posting Private and Personal Information", description: "Don't share personal information without consent." },
  { title: "Admission Questions in Megathreads", description: "All admission-related questions must be posted in the designated megathreads." }
];

// Dummy data for posts
const postsData = [
  {
    id: 1,
    title: "LETS DECIDE MERIT",
    content: "Bhai abhi aa hi gaye ho Tou drop your merit FULL NAME NET MARKS AGGREGATE Jitne bhi hon No one will judge you Just for research purpose(will merit inc o dec)",
    author: "u/LEGEND_GTX",
    timeAgo: "3 hr. ago",
    upvotes: 156,
    comments: 42,
    tags: ["Discussion"],
    views: "12.4k",
    highlighted: true
  },
  {
    id: 2,
    title: "Admission process started for Spring 2024. Any tips?",
    content: "Just got my entrance test date for Spring 2024 admission. Anyone who got in recently have any tips for preparation? What's the competition like these days?",
    author: "u/FutureNustian",
    timeAgo: "8 hr. ago",
    upvotes: 89,
    comments: 36,
    tags: ["Question", "Admission"],
    views: "8.7k"
  },
  {
    id: 3,
    title: "NUST Hostel Review - My experience after 2 years",
    content: "After spending 2 years in the NUST hostels, I thought I'd share my comprehensive review for anyone considering on-campus accommodation. The good, the bad, and everything in between.",
    author: "u/HostelLife",
    timeAgo: "1 day ago",
    upvotes: 214,
    comments: 56,
    tags: ["Review", "Housing"],
    views: "15.3k",
    image: "https://picsum.photos/800/400?random=3"
  },
  {
    id: 4,
    title: "NUST SEECS vs FAST for Computer Science?",
    content: "I got accepted to both NUST SEECS and FAST for Computer Science. Which one should I choose? Looking for honest opinions from current students or alumni.",
    author: "u/CSDecisions",
    timeAgo: "2 days ago",
    upvotes: 341,
    comments: 78,
    tags: ["Question", "Comparison"],
    views: "21.2k"
  }
];

export default function HivePage() {
  const { status } = useSession();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("hot");
  const [isExpanded, setIsExpanded] = useState<Record<number, boolean>>({});

  // Protect this route - redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Toggle content expansion for posts
  const toggleExpand = (postId: number) => {
    setIsExpanded(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-400 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Main content - only shown to authenticated users
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900">
      <Header />
      <div className="flex mt-[70px]">
        <Sidebar />
        <main className="flex-1 ml-[280px]">
          {/* Hive Banner */}
          <div className="relative">
            <div className="h-48 w-full bg-gradient-to-r from-blue-900 to-blue-800 relative overflow-hidden">
              <img src={hiveInfo.banner} alt="" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60"></div>
            </div>

            {/* Community info overlay */}
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div className="w-24 h-24 rounded-full border-4 border-slate-950 bg-white overflow-hidden">
                <img src={hiveInfo.logo} alt={hiveInfo.name} className="w-full h-full object-cover" />
              </div>
              <div className="ml-4 mb-4">
                <h1 className="text-2xl font-bold text-white">{hiveInfo.fullName}</h1>
                <p className="text-gray-400 text-sm">r/{hiveInfo.name}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="absolute right-8 bottom-4 flex items-center gap-2">
              {!hiveInfo.isJoined ? (
                <button className="bg-white text-slate-950 hover:bg-gray-200 py-1 px-6 rounded-full font-medium">
                  Join
                </button>
              ) : (
                <button className="bg-transparent border border-white text-white hover:bg-white/10 py-1 px-6 rounded-full font-medium">
                  Joined
                </button>
              )}
              <button className="bg-transparent text-white border border-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                <Bell size={16} />
              </button>
              <button className="bg-transparent text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
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
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-full text-sm">
                  Create Post
                </button>
              </div>

              {/* Filters */}
              <div className="bg-[#232a3a] rounded-2xl mb-4 p-2 flex items-center">
                <button 
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${activeFilter === 'hot' ? 'bg-slate-800 text-white' : 'text-gray-300 hover:bg-slate-800/50'}`}
                  onClick={() => setActiveFilter('hot')}
                >
                  <Flame size={14} />
                  <span>Hot</span>
                </button>
                <button 
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${activeFilter === 'new' ? 'bg-slate-800 text-white' : 'text-gray-300 hover:bg-slate-800/50'}`}
                  onClick={() => setActiveFilter('new')}
                >
                  <Clock size={14} />
                  <span>New</span>
                </button>
                <button 
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${activeFilter === 'top' ? 'bg-slate-800 text-white' : 'text-gray-300 hover:bg-slate-800/50'}`}
                  onClick={() => setActiveFilter('top')}
                >
                  <TrendingUp size={14} />
                  <span>Top</span>
                </button>
              </div>

              {/* Create Post Box */}
              <div className="bg-[#232a3a] rounded-2xl p-3 mb-4">
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
              <div className="space-y-3">
                {postsData.map((post) => (
                  <div key={post.id} className={`bg-[#232a3a] rounded-2xl overflow-hidden ${post.highlighted ? 'ring-1 ring-blue-500/30' : ''}`}>
                    <div className="flex">
                      {/* Voting */}
                      <div className="w-10 bg-[#1a2235] flex flex-col items-center py-2 gap-1">
                        <button className="text-gray-400 hover:text-orange-500 transition-colors">
                          <ArrowBigUp size={18} />
                        </button>
                        <span className="text-xs font-medium text-white">{post.upvotes}</span>
                        <button className="text-gray-400 hover:text-blue-500 transition-colors">
                          <ArrowBigUp className="rotate-180" size={18} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3">
                        <div className="flex items-center text-xs text-gray-400 mb-2">
                          <span>Posted by {post.author} {post.timeAgo}</span>
                        </div>

                        <h3 className="font-medium text-lg text-white mb-2">{post.title}</h3>

                        {post.image && (
                          <div className="mb-3 bg-[#1a2235] rounded-xl overflow-hidden">
                            <img src={post.image} alt={post.title} className="w-full object-cover max-h-[400px]" />
                          </div>
                        )}

                        <div className={`text-sm text-gray-300 mb-3 ${isExpanded[post.id] ? '' : 'line-clamp-3'}`}>
                          {post.content}
                        </div>

                        {post.content.length > 150 && (
                          <button 
                            onClick={() => toggleExpand(post.id)} 
                            className="text-xs text-blue-400 hover:text-blue-300 mb-2"
                          >
                            {isExpanded[post.id] ? 'Show less' : 'Read more'}
                          </button>
                        )}

                        <div className="flex items-center gap-2 mb-1">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="bg-[#1a2235] text-gray-300 px-2 py-0.5 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                          <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 hover:bg-slate-700/30 py-1 px-2 rounded transition-colors">
                            <MessageSquare size={16} />
                            <span>{post.comments} Comments</span>
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
            </div>

            {/* Community Details - Right Sidebar */}
            <aside className="sticky top-[102px] self-start w-[340px] max-h-[calc(100vh-150px)] overflow-y-auto hidden md:block">
              {/* About Community */}
              <div className="bg-[#232a3a] rounded-2xl overflow-hidden mb-4">
                <div className="p-3 border-b border-slate-700">
                  <h2 className="text-white font-medium text-base mb-2">About Community</h2>
                  <p className="text-gray-400 text-sm mb-3">
                    {hiveInfo.description}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-col gap-2 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="text-white font-medium">{hiveInfo.members}</div>
                        <div className="text-gray-400 text-xs">Members</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center text-white font-medium">
                          {hiveInfo.online} <span className="h-2 w-2 rounded-full bg-green-500 ml-1"></span>
                        </div>
                        <div className="text-gray-400 text-xs">Online</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{hiveInfo.rank}</div>
                        <div className="text-gray-400 text-xs">Rank</div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span className="text-gray-400">Created {hiveInfo.created}</span>
                    </div>
                  </div>

                  {/* Create Post button */}
                  <div className="my-3">
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-full text-sm">
                      Create Post
                    </button>
                  </div>
                </div>

                {/* Community achievements */}
                <div className="p-3 border-b border-slate-700">
                  <h3 className="text-white font-medium text-sm mb-2">Community Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-1 bg-[#1a2235] rounded-full px-2 py-1 text-xs text-gray-300">
                        <span className="text-blue-400">{achievement.icon}</span>
                        {achievement.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rules */}
              <div className="bg-[#232a3a] rounded-2xl overflow-hidden mb-4">
                <div className="p-3">
                  <h3 className="text-white font-medium text-base mb-2">r/{hiveInfo.name} Rules</h3>
                  <ol className="space-y-2 text-gray-300">
                    {rules.map((rule, index) => (
                      <li key={index} className="border-b border-slate-700 pb-2">
                        <div className="flex items-start gap-1">
                          <span className="font-medium text-sm">{index + 1}. {rule.title}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 hidden group-hover:block">{rule.description}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Moderators */}
              <div className="bg-[#232a3a] rounded-2xl overflow-hidden">
                <div className="p-3">
                  <h3 className="text-white font-medium text-base mb-2">Moderators</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    {moderators.map((mod, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Shield size={14} className="text-blue-400" />
                          <span className="text-blue-400 hover:underline cursor-pointer">{mod.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">Since {mod.since}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full text-blue-400 hover:text-blue-300 text-sm mt-3">
                    View All Moderators
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
} 