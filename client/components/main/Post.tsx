"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ThumbsUp, MessageSquare, Share2, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

interface PostCardProps {
  post: Post;
  formatDate: (date: string) => string;
  formatNumber: (num: number) => string;
  onLike: (postId: string) => Promise<void>;
  onComment: (postId: string, text: string) => Promise<void>;
  onLikeComment: (postId: string, commentId: string) => Promise<void>;
  onReplyToComment: (postId: string, commentId: string, text: string) => Promise<void>;
  likeLoading: Record<string, boolean>;
  commentLoading: Record<string, boolean>;
  animatingLikes: Record<string, boolean>;
  commentLikeLoading: Record<string, boolean>;
  animatingCommentLikes: Record<string, boolean>;
  expandedCommentSections: Record<string, boolean>;
  toggleComments: (postId: string) => void;
  singlePostView?: boolean; // Optional prop to indicate if shown in single post view
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  formatDate,
  formatNumber,
  onLike,
  onComment,
  onLikeComment,
  onReplyToComment,
  likeLoading,
  commentLoading,
  animatingLikes,
  commentLikeLoading,
  animatingCommentLikes,
  expandedCommentSections,
  toggleComments,
  singlePostView = false
}) => {
  const { data: session } = useSession();
  const [commentText, setCommentText] = useState<string>('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Helper functions
  const hasUserLikedPost = (postLikes: string[], userId: string | undefined) => {
    if (!userId) return false;
    return postLikes.includes(userId);
  };

  const hasUserLikedComment = (commentLikes: string[], userId: string | undefined) => {
    if (!userId) return false;
    return commentLikes.includes(userId);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
    }
  };

  const handleSubmitReply = (commentId: string) => {
  console.log('Replying to comment:', commentId, 'with text:', replyText[commentId]);
  if (replyText[commentId]?.trim()) {
    onReplyToComment(post._id, commentId, replyText[commentId]);
    setReplyText(prev => ({ ...prev, [commentId]: '' }));
    setReplyingTo(null);
  }
};

  return (
    <div className="card bg-base-300 rounded-2xl p-6">
      {/* Post Header */}
      <div className="mb-3">
        <Link href={`/user/${post.userId}`}>
          <span className="text-base-content font-bold text-lg hover:underline cursor-pointer">
            u/{post.username}
          </span>
        </Link>
        <span className="text-gray-400 font-normal text-sm ml-2">• {formatDate(post.createdAt)}</span>
      </div>

      {/* Post Content */}
      <Link href={`/posts/${post._id}`} className={singlePostView ? 'pointer-events-none' : ''}>
        <h3 className="font-bold text-xl text-base-content mb-4 hover:text-accent transition-colors">
          {post.heading}
        </h3>
      </Link>
      
      <div className="text-base-content/80 mb-4">{post.content}</div>
      
      {/* Post Image */}
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

      {/* Post Actions */}
      <div className="flex gap-6 text-gray-400 font-medium text-base mt-4">
        <button 
          onClick={() => onLike(post._id)} 
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
        
        <button 
          onClick={() => toggleComments(post._id)}
          className={`btn btn-sm btn-ghost gap-2 ${
            expandedCommentSections[post._id] ? 'bg-base-100' : ''
          }`}
        >
          <MessageSquare size={16} /> {formatNumber(post.comments.length)} comments
        </button>
        
        <button className="btn btn-sm btn-ghost gap-2">
          <Share2 size={16} /> Share
        </button>
      </div>
      
      {/* Comments Section */}
      {(expandedCommentSections[post._id] || singlePostView) && (
        <div className="mt-4 border-t border-base-content/10 pt-4">
          {/* Comment input */}
          <form onSubmit={handleSubmitComment} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a comment..."
              className="input input-bordered rounded-xl w-full"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment(e);
                }
              }}
            />
            <button 
              type="submit"
              disabled={commentLoading[post._id] || !commentText.trim()}
              className={`btn btn-primary ${commentLoading[post._id] ? 'loading' : ''}`}
            >
              <Send size={16} />
            </button>
          </form>
          
          {/* Display comments */}
          {post.comments.length > 0 && (
            <div className="space-y-3 max-h-[300px] overflow-y-auto p-2">
              {post.comments.map((comment) => (
                <div key={comment._id} className="bg-base-300 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm">u/{comment.username}</span>
                    <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-base-content/90 text-sm">{comment.text}</p>
                  <div className="mt-2 flex items-center gap-3">
                    {/* Like comment button */}
                    <button 
                      onClick={() => onLikeComment(post._id, comment._id)} 
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
                            handleSubmitReply(comment._id);
                          }
                        }}
                      />
                      <button 
                        onClick={() => handleSubmitReply(comment._id)}
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
      )}
    </div>
  );
};

export default PostCard;