"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ForumHeader from "@/components/forum/ForumHeader";
import ForumSidebar from "@/components/forum/ForumSidebar";
import PostList from "@/components/forum/PostList";
import CreatePostAuth from "@/components/forum/CreatePostAuth";
import { Plus } from "lucide-react";

interface Forum {
  id: number;
  topic: string;
  description: string | null;
  popular_rank: number | null;
  user_id: string;
  created_at: string | null;
}

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

export default function AdminForumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const forumId = params.forumId as string;

  const [currentForum, setCurrentForum] = useState<Forum | null>(null);
  const [forumPosts, setForumPosts] = useState<Post[]>([]);
  const [allForums, setAllForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Fetch forum data
  useEffect(() => {
    const fetchForumData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Always fetch all forums for sidebar first
        try {
          const forumsResponse = await fetch("/api/forums");
          if (forumsResponse.ok) {
            const forums = await forumsResponse.json();
            setAllForums(forums);
          }
        } catch (forumsErr) {
          console.error("Error fetching forums for sidebar:", forumsErr);
        }

        // Fetch the specific forum
        const forumResponse = await fetch(`/api/forums/${forumId}`);
        if (!forumResponse.ok) {
          if (forumResponse.status === 404) {
            setError("Forum not found");
            return;
          }
          throw new Error("Failed to fetch forum");
        }
        const forum = await forumResponse.json();
        setCurrentForum(forum);

        // Fetch posts for this forum
        const postsResponse = await fetch(`/api/posts?forumId=${forumId}`);
        if (!postsResponse.ok) {
          throw new Error("Failed to fetch posts");
        }
        const posts = await postsResponse.json();
        setForumPosts(posts);
      } catch (err) {
        console.error("Error fetching forum data:", err);
        setError("Failed to load forum data");
      } finally {
        setLoading(false);
      }
    };

    if (forumId) {
      fetchForumData();
    }
  }, [forumId]);

  // Handle post creation
  const handlePostCreated = () => {
    setShowCreatePost(false);
    // Refresh posts
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/posts?forumId=${forumId}`);
        if (response.ok) {
          const posts = await response.json();
          setForumPosts(posts);
        }
      } catch (err) {
        console.error("Error refreshing posts:", err);
      }
    };
    fetchPosts();
  };

  const getForumColor = (forumId: number): string => {
    const colors = [
      "bg-green-500", // forumId 1, 7, 13...
      "bg-purple-500", // forumId 2, 8, 14...
      "bg-blue-500", // forumId 3, 9, 15...
      "bg-red-500", // forumId 4, 10, 16...
      "bg-yellow-500", // forumId 5, 11, 17...
      "bg-pink-500", // forumId 6, 12, 18...
    ];

    return colors[(forumId - 1) % colors.length];
  };

  const currentForumColor = currentForum
    ? getForumColor(currentForum.id)
    : "bg-blue-500";

  const handleForumSelect = (selectedForumId: string) => {
    router.push(`/admin/forum/${selectedForumId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading forum...</p>
        </div>
      </div>
    );
  }

  if (error || !currentForum) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Error: {error || "Forum not found"}
          </p>
          <button
            onClick={() => router.push("/admin/forum")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Back to Forums
          </button>
        </div>
      </div>
    );
  }

  const transformedPosts = forumPosts.map((post) => ({
    id: post.id.toString(),
    title: post.title,
    description: post.description,
    datePost: post.date_posted
      ? new Date(post.date_posted).toISOString()
      : new Date().toISOString(),
    upvotes: post.upvotes || 0,
    downvotes: post.downvotes || 0,
    forumId: post.forum_id,
    userId: post.user_id,
    commentCount: post.comment_count || 0,
    username: post.username || "Anonymous",
    userAvatar: post.user_profile_picture,
    userRole: String,
    forumName: post.forum_topic || currentForum.topic,
    forum: {
      color: getForumColor(post.forum_id),
    },
  }));

  const sortedPosts = [...transformedPosts].sort((a, b) => {
    switch (sortBy) {
      case "new":
        return new Date(b.datePost).getTime() - new Date(a.datePost).getTime();
      case "top":
        return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
      case "hot":
      default:
        const aScore =
          (a.upvotes - a.downvotes) /
          Math.max(
            1,
            Math.floor(
              (Date.now() - new Date(a.datePost).getTime()) / (1000 * 60 * 60),
            ),
          );
        const bScore =
          (b.upvotes - b.downvotes) /
          Math.max(
            1,
            Math.floor(
              (Date.now() - new Date(b.datePost).getTime()) / (1000 * 60 * 60),
            ),
          );
        return bScore - aScore;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <ForumHeader onMenuClick={() => setSidebarOpen(true)} />

      {/* Mobile Layout */}
      <div className="sm:hidden">
        <ForumSidebar
          selectedForum={forumId}
          onForumSelect={handleForumSelect}
          forums={allForums.map((f) => ({
            id: f.id.toString(),
            name: f.topic,
            description: f.description || "",
            memberCount: 0,
            color: getForumColor(f.id),
          }))}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onForumCreated={() => {
            const fetchForums = async () => {
              try {
                const response = await fetch("/api/forums");
                if (response.ok) {
                  const forums = await response.json();
                  setAllForums(forums);
                }
              } catch (err) {
                console.error("Error refreshing forums:", err);
              }
            };
            fetchForums();
          }}
          apiEndpoint="/api/forums"
          baseRoute="/admin/forum"
        />

        {/* Mobile Forum Header */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-full ${currentForumColor} flex items-center justify-center text-white text-lg font-bold`}
            >
              {currentForum.topic.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                r/{currentForum.topic}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentForum.description || "No description available"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto">
              {(["hot", "new", "top"] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`px-3 py-1 rounded-full text-sm capitalize transition-colors whitespace-nowrap ${
                    sortBy === sort
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {sort}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors text-sm ml-2"
            >
              <Plus className="w-4 h-4" />
              Post
            </button>
          </div>
        </div>

        <div className="bg-background">
          <PostList posts={sortedPosts} baseRoute="/admin/forum" />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex max-w-7xl mx-auto relative">
        <ForumSidebar
          selectedForum={forumId}
          onForumSelect={handleForumSelect}
          forums={allForums.map((f) => ({
            id: f.id.toString(),
            name: f.topic,
            description: f.description || "",
            memberCount: 0,
            color: getForumColor(f.id),
          }))}
          isOpen={true}
          onClose={() => {}}
          onForumCreated={() => {
            const fetchForums = async () => {
              try {
                const response = await fetch("/api/forums");
                if (response.ok) {
                  const forums = await response.json();
                  setAllForums(forums);
                }
              } catch (err) {
                console.error("Error refreshing forums:", err);
              }
            };
            fetchForums();
          }}
          apiEndpoint="/api/forums"
          baseRoute="/admin/forum"
        />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-16 h-16 rounded-full ${currentForumColor} flex items-center justify-center text-white text-2xl font-bold`}
              >
                {currentForum.topic.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">
                  r/{currentForum.topic}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {currentForum.description || "No description available"}
                </p>
              </div>

              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Post</span>
              </button>
            </div>

            <div className="flex gap-2">
              {(["hot", "new", "top"] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    sortBy === sort
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {sort}
                </button>
              ))}
            </div>
          </div>

          <PostList posts={sortedPosts} baseRoute="/admin/forum" />
        </main>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostAuth
          forumId={parseInt(forumId)}
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
          apiEndpoint="/api/posts"
        />
      )}
    </div>
  );
}

