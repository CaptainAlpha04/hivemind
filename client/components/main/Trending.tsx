"use client";

import React from "react";
import { useRouter } from "next/navigation";

// Type definitions
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

interface TrendingPostsProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
  formatNumber: (num: number) => string;
  formatDate: (dateString: string) => string;
}

const TrendingPosts: React.FC<TrendingPostsProps> = ({ 
  posts, 
  loading, 
  error, 
  formatNumber, 
  formatDate 
}) => {
  const router = useRouter();

  // Function to calculate trending posts based on engagement
  const getTrendingPosts = (allPosts: Post[], limit: number = 3): Post[] => {
    // Create a copy of posts to avoid mutating the original array
    const sortedPosts = [...allPosts].sort((a, b) => {
      // Calculate engagement score (likes + comments)
      const engagementA = a.likes.length + a.comments.length;
      const engagementB = b.likes.length + b.comments.length;
      
      // Sort in descending order (highest engagement first)
      return engagementB - engagementA;
    });
    
    // Return the top posts based on limit
    return sortedPosts.slice(0, limit);
  };

  const navigateToPost = (postId: string) => {
    router.push(`/posts/${postId}`);
  };

  return (
    <aside className="sticky top-[102px] self-start w-[340px] card bg-base-300 rounded-2xl p-6 max-h-[calc(100vh-150px)] overflow-auto scrollbar-hide">
      <h2 className="text-secondary font-bold text-xl mb-4">Trending Posts</h2>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner text-secondary"></span>
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm text-center py-4">
          Could not load trending posts
        </div>
      ) : posts.length === 0 ? (
        <div className="text-gray-400 text-sm text-center py-4">
          No trending posts available
        </div>
      ) : (
        getTrendingPosts(posts).map((post) => (
          <div 
            key={post._id} 
            className="mb-6 cursor-pointer hover:bg-base-200 p-2 rounded-lg transition-colors"
            onClick={() => navigateToPost(post._id)}
          >
            <div className="text-base-content font-semibold">
              u/{post.username} <span className="text-gray-400 font-normal text-xs ml-2">{formatDate(post.createdAt)}</span>
            </div>
            <div className="text-base-content font-medium text-sm my-2 line-clamp-2">{post.heading}</div>
            <div className="text-gray-400 font-normal text-xs">
              {formatNumber(post.likes.length)} likes &nbsp;·&nbsp; 
              {formatNumber(post.comments.length)} comments
            </div>
            {/* Progress bar to visually represent engagement */}
            <div className="w-full bg-base-100 rounded-full h-1 mt-2">
              <div 
                className="bg-secondary h-1 rounded-full"
                style={{ width: `${Math.min(100, (post.likes.length + post.comments.length) / 5)}%` }}
              ></div>
            </div>
          </div>
        ))
      )}
    </aside>
  );
};

export default TrendingPosts;