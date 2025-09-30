"use client";

import { useState } from "react";
import { useComments, forumAPI, type ForumComment } from "@/lib/hooks/useForum";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  MoreHorizontal,
  Send,
  BadgeCheck,
} from "lucide-react";
import toast from "react-hot-toast";

interface CommentSectionProps {
  postId: number;
}

interface CommentProps {
  comment: ForumComment;
  onVote: (commentId: number, type: "upvote" | "downvote") => void;
}

function Comment({ comment, onVote }: CommentProps) {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [localUpvotes, setLocalUpvotes] = useState(comment.upvotes || 0);
  const [localDownvotes, setLocalDownvotes] = useState(comment.downvotes || 0);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType: "up" | "down") => {
    if (isVoting) return;

    setIsVoting(true);

    try {
      if (userVote === voteType) {
        // Remove vote - for now just update locally
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

        // Call the API
        const voteAction = voteType === "up" ? "upvote" : "downvote";
        await onVote(comment.id, voteAction);

        if (voteType === "up") {
          setLocalUpvotes((prev) => prev + 1);
        } else {
          setLocalDownvotes((prev) => prev + 1);
        }
        setUserVote(voteType);
      }
    } catch (error) {
      console.error("Error voting on comment:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const formatTimeAgo = (dateString: string | Date | null) => {
    if (!dateString) return "now";

    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - commentDate.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const netScore = localUpvotes - localDownvotes;

  return (
    <div className="border-l-2 border-muted pl-4 py-3">
      <div className="flex items-start gap-3">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-1">
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
            {netScore}
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

        {/* Comment Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <span className="font-medium">
                u/{comment.username || "Anonymous"}
              </span>
              {comment.user_role === "practitioner" && (
                <BadgeCheck className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <span>•</span>
            <span>{formatTimeAgo(comment.date_created)}</span>
          </div>

          <p className="text-foreground mb-2">{comment.content}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              <MessageCircle className="w-3 h-3" />
              <span>Reply</span>
            </button>
            <button className="hover:text-foreground transition-colors">
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { comments, loading, error, refetch } = useComments(postId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    if (!user?.id) {
      alert("You must be logged in to comment");
      return;
    }

    setIsSubmitting(true);

    try {
      await forumAPI.createComment({
        content: newComment.trim(),
        forum_post_id: postId,
        user_id: user.id,
      });

      setNewComment("");
      refetch(); // Refresh comments
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Error creating comment. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteComment = async (
    commentId: number,
    type: "upvote" | "downvote",
  ) => {
    try {
      await forumAPI.voteComment(commentId, type);
    } catch (error) {
      console.error("Error voting on comment:", error);
      throw error; // Re-throw so Comment component can handle it
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-muted rounded w-3/4 mb-1"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">Error loading comments: {error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="What are your thoughts?"
          className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Posting..." : "Comment"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-2">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onVote={handleVoteComment}
            />
          ))
        )}
      </div>
    </div>
  );
}
