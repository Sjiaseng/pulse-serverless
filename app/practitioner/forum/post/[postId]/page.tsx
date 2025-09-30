"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share,
  Bookmark,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import CommentSection from "@/components/forum/CommentSection";

interface Post {
  id: number;
  title: string;
  description: string;
  date_posted: string | null;
  upvotes: number | null;
  downvotes: number | null;
  forum_id: number;
  user_id: string;
  username: string | null;
  user_profile_picture: string | null;
  forum_topic: string | null;
  comment_count: number;
}

export default function PractitionerPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [localUpvotes, setLocalUpvotes] = useState(0);
  const [localDownvotes, setLocalDownvotes] = useState(0);
  const [isVoting, setIsVoting] = useState(false);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Post not found");
            return;
          }
          throw new Error("Failed to fetch post");
        }

        const postData = await response.json();
        setPost(postData);
        setLocalUpvotes(postData.upvotes || 0);
        setLocalDownvotes(postData.downvotes || 0);
        console.log("Post Topic: ", postData.forum_topic);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleVote = async (voteType: "up" | "down") => {
    if (isVoting || !post) return;

    setIsVoting(true);

    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        if (userVote === voteType) {
          // Remove vote
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

          if (voteType === "up") {
            setLocalUpvotes((prev) => prev + 1);
          } else {
            setLocalDownvotes((prev) => prev + 1);
          }
          setUserVote(voteType);
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Unknown date";
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - postDate.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return postDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Error: {error || "Post not found"}
          </p>
          <button
            onClick={() => router.push("/user/forum")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Back to Forums
          </button>
        </div>
      </div>
    );
  }

  const netVotes = localUpvotes - localDownvotes;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        {/* Back Navigation */}
        <div className="mb-4">
          <Link
            href={`/practitioner/forum/${post.forum_id}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to r/{post.forum_topic}
          </Link>
        </div>

        {/* Post Content */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex gap-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handleVote("up")}
                disabled={isVoting}
                className={`p-2 rounded-lg transition-colors ${
                  userVote === "up"
                    ? "bg-orange-100 text-orange-600"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>

              <span
                className={`font-semibold ${
                  netVotes > 0
                    ? "text-orange-600"
                    : netVotes < 0
                      ? "text-blue-600"
                      : "text-muted-foreground"
                }`}
              >
                {netVotes}
              </span>

              <button
                onClick={() => handleVote("down")}
                disabled={isVoting}
                className={`p-2 rounded-lg transition-colors ${
                  userVote === "down"
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Post Meta */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Link
                  href={`/user/forum/${post.forum_id}`}
                  className="font-medium hover:text-foreground"
                >
                  r/{post.forum_topic}
                </Link>
                <span>•</span>
                <span>Posted by u/{post.username || "Unknown"}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.date_posted)}</span>
              </div>

              {/* Post Title */}
              <h1 className="text-2xl font-bold text-foreground mb-4">
                {post.title}
              </h1>

              {/* Post Content */}
              <div className="prose prose-sm max-w-none text-foreground mb-6">
                <p className="whitespace-pre-wrap">{post.description}</p>
              </div>

              {/* Post Actions */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comment_count} comments</span>
                </div>
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Bookmark className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection postId={parseInt(postId)} />
      </div>
    </div>
  );
}
