"use client";

import { useState, useEffect } from "react";
import { forumAPI } from "@/lib/hooks/useForum";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share,
  Bookmark,
  Trash2,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// Updated interfaces to match the new data structure
interface PostCardProps {
  post: {
    id: string;
    title: string;
    description: string;
    datePost: string;
    upvotes: number;
    downvotes: number;
    forumId: string;
    userId: string;
    commentCount: number;
    username?: string;
    userAvatar?: string | null;
    forumName?: string;
    userRole?: string;
  };
  user?: {
    id: string;
    username: string;
    avatar?: string | null;
    karma?: number;
  };
  forum?: {
    id: string;
    name: string;
    description: string;
    color: string;
    memberCount: number;
  };
  baseRoute?: string;
}

export default function PostCard({
  post,
  user,
  forum,
  baseRoute,
}: PostCardProps) {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(post.downvotes);
  const [isVoting, setIsVoting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user: currentUser } = useAuth();

  // TEST: Logging the base router
  useEffect(() => {
    console.log("Base route received from card: ", baseRoute);
  }, [baseRoute]);

  const handleVote = async (voteType: "up" | "down") => {
    if (isVoting) return;

    setIsVoting(true);

    try {
      if (userVote === voteType) {
        // Remove vote - for now just update locally
        // In a real app, you'd need a separate API endpoint to remove votes
        if (voteType === "up") {
          setLocalUpvotes((prev) => prev - 1);
        } else {
          setLocalDownvotes((prev) => prev - 1);
        }
        setUserVote(null);
      } else {
        // Add new vote, remove old if exists
        if (userVote === "up") {
          setLocalUpvotes((prev) => prev - 1);
        } else if (userVote === "down") {
          setLocalDownvotes((prev) => prev - 1);
        }

        // Call the API to vote
        const voteAction = voteType === "up" ? "upvote" : "downvote";
        await forumAPI.votePost(parseInt(post.id), voteAction);

        if (voteType === "up") {
          setLocalUpvotes((prev) => prev + 1);
        } else {
          setLocalDownvotes((prev) => prev + 1);
        }
        setUserVote(voteType);
      }
    } catch (error) {
      console.error("Error voting:", error);
      // Revert optimistic update on error
      // You might want to show a toast notification here
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await forumAPI.deletePost(parseInt(post.id));
      toast.success("Post deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - postDate.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w`;
  };

  const netScore = localUpvotes - localDownvotes;

  // Use the username from the post data if available, otherwise fall back to user prop
  const displayUsername = post.username || user?.username || "Unknown";
  const displayForumName = post.forumName || forum?.name || "Unknown Forum";

  return (
    <div className="bg-card border-b border-border sm:border sm:rounded-lg hover:bg-accent/5 transition-colors">
      {/* Mobile Layout - Reddit Style */}
      <div className="block sm:hidden">
        <div className="flex p-2">
          {/* Left: Vote Section */}
          <div className="flex flex-col items-center justify-start mr-2 pt-1">
            <button
              onClick={() => handleVote("up")}
              disabled={isVoting}
              className={`p-1 rounded transition-colors ${
                userVote === "up"
                  ? "text-orange-500"
                  : "text-muted-foreground hover:text-orange-500"
              } ${isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <span
              className={`text-xs font-medium ${
                netScore > 0
                  ? "text-orange-500"
                  : netScore < 0
                    ? "text-blue-500"
                    : "text-muted-foreground"
              }`}
            >
              {Math.abs(netScore) > 999
                ? `${(Math.abs(netScore) / 1000).toFixed(1)}k`
                : Math.abs(netScore)}
            </span>
            <button
              onClick={() => handleVote("down")}
              disabled={isVoting}
              className={`p-1 rounded transition-colors ${
                userVote === "down"
                  ? "text-blue-500"
                  : "text-muted-foreground hover:text-blue-500"
              } ${isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Content */}
          <div className="flex-1 min-w-0">
            {/* Post Header */}
            <div className="flex items-center text-xs text-muted-foreground mb-1 overflow-hidden">
              <div className="flex items-center gap-1 flex-shrink-0">
                <div
                  className={`w-2 h-2 rounded-full ${forum?.color || "bg-gray-500"}`}
                />
                <Link
                  href={`${baseRoute}/${post.forumId}`}
                  className="font-medium hover:text-foreground !min-h-0"
                >
                  r/{displayForumName}
                </Link>
                <span>•</span>
              </div>
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="truncate">u/{displayUsername}</span>
                  {post.userRole === "practitioner" && (
                    <BadgeCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <span className="flex-shrink-0">•</span>
                <span className="flex-shrink-0">
                  {formatTimeAgo(post.datePost) === "now"
                    ? "now"
                    : `${formatTimeAgo(post.datePost)} ago`}
                </span>
              </div>
            </div>

            {/* Post Title */}
            <Link href={`${baseRoute}/post/${post.id}`}>
              <h2 className="text-sm font-medium text-foreground hover:text-primary transition-colors mb-1 line-clamp-2">
                {post.title}
              </h2>
            </Link>

            {/* Post Description */}
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {post.description}
            </p>

            {/* Bottom Action Bar */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link
                href={`${baseRoute}/post/${post.id}`}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                <span>{post.commentCount}</span>
              </Link>
              <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Share className="w-3 h-3" />
                <span>Share</span>
              </button>
              {(currentUser?.id === post.userId || currentUser?.role === "admin") && (
                <button
                  className="hover:text-foreground transition-colors ml-auto"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-3 h-3 cursor-pointer hover:text-red-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Original */}
      <div className="hidden sm:flex">
        {/* Vote Section */}
        <div className="flex flex-col items-center p-3 bg-muted/30 rounded-l-lg">
          <button
            onClick={() => handleVote("up")}
            disabled={isVoting}
            className={`p-1 rounded transition-colors ${
              userVote === "up"
                ? "text-orange-500 bg-orange-100 dark:bg-orange-900/30"
                : "text-muted-foreground hover:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/30"
            } ${isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <span
            className={`text-sm font-semibold py-1 ${
              netScore > 0
                ? "text-orange-500"
                : netScore < 0
                  ? "text-blue-500"
                  : "text-muted-foreground"
            }`}
          >
            {netScore}
          </span>
          <button
            onClick={() => handleVote("down")}
            disabled={isVoting}
            className={`p-1 rounded transition-colors ${
              userVote === "down"
                ? "text-blue-500 bg-blue-100 dark:bg-blue-900/30"
                : "text-muted-foreground hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            } ${isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          {/* Post Header */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
            <div
              className={`w-3 h-3 rounded-full ${forum?.color || "bg-gray-500"}`}
            />
            <Link
              href={`/forum/${post.forumId}`}
              className="font-medium hover:text-foreground transition-colors"
            >
              r/{displayForumName}
            </Link>
            <span>•</span>
            <span>Posted by</span>
            <div className="flex items-center gap-1">
              <Link
                href={`/user/${displayUsername}`}
                className="hover:text-foreground transition-colors"
              >
                u/{displayUsername}
              </Link>
              {post.userRole === "practitioner" && (
                <BadgeCheck className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <span>•</span>
            <span>
              {formatTimeAgo(post.datePost) === "now"
                ? "now"
                : `${formatTimeAgo(post.datePost)} ago`}
            </span>
          </div>

          {/* Post Title */}
          <Link href={`${baseRoute}/post/${post.id}`}>
            <h2 className="text-lg font-semibold text-foreground hover:text-primary transition-colors mb-2 cursor-pointer">
              {post.title}
            </h2>
          </Link>

          {/* Post Description */}
          <p className="text-foreground mb-4 line-clamp-3">
            {post.description}
          </p>

          {/* Post Actions */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Link
              href={`/forum/post/${post.id}`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentCount} comments</span>
            </Link>
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Bookmark className="w-4 h-4" />
              <span>Save</span>
            </button>
            {(currentUser?.id === post.userId || currentUser?.role === "admin") && (
              <button
                className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Post</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

