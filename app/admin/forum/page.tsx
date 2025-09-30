"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ForumHeader from "@/components/forum/ForumHeader";
import ForumSidebar from "@/components/forum/ForumSidebar";
import PostList from "@/components/forum/PostList";
import CreatePostAuth from "@/components/forum/CreatePostAuth";
import { useForums, usePosts } from "@/lib/hooks/useForum";

export default function AdminForumPage() {
  const router = useRouter();
  const selectedForum = "all";
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch real data from database using admin-specific endpoints
  const {
    forums,
    loading: forumsLoading,
    error: forumsError,
    refetch: refetchForums,
  } = useForums("/api/forums");
  const {
    posts,
    loading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = usePosts(
    selectedForum === "all" ? undefined : parseInt(selectedForum),
    "/api/posts",
  );

  // Handle loading states
  if (forumsLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading forum data...</p>
        </div>
      </div>
    );
  }

  // Handle error states
  if (forumsError || postsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading forum data:</p>
          <p className="text-muted-foreground">{forumsError || postsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Transform database forums to match the expected format
  const transformedForums = forums.map((forum) => ({
    id: forum.id.toString(),
    name: forum.topic,
    description: forum.description || "",
    color: getForumColor(forum.id),
    memberCount: forum.popular_rank || 0,
  }));

  // Transform database posts to match the expected format with forum colors
  const transformedPosts = posts.map((post) => ({
    id: post.id.toString(),
    title: post.title,
    description: post.description,
    datePost: post.date_posted
      ? new Date(post.date_posted as Date).toISOString()
      : new Date().toISOString(),
    upvotes: post.upvotes || 0,
    downvotes: post.downvotes || 0,
    forumId: post.forum_id,
    userId: post.user_id,
    commentCount: post.comment_count || 0,
    username: post.username || "Anonymous",
    userAvatar: post.user_profile_picture,
    userRole: String,
    forumName: post.forum_topic || "Unknown Forum",
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
      <div className="sm:hidden max-w-md mx-auto">
        <ForumSidebar
          selectedForum={selectedForum}
          onForumSelect={(forumId) => router.push(`/admin/forum/${forumId}`)}
          forums={transformedForums}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onForumCreated={refetchForums}
          apiEndpoint="/api/forums"
          baseRoute="/admin/forum"
        />

        <div className="bg-card border-b border-border px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1 overflow-x-auto">
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
            <CreatePostAuth
              forums={transformedForums}
              selectedForumId={
                selectedForum !== "all" ? selectedForum : undefined
              }
              onPostCreated={refetchPosts}
              apiEndpoint="/api/posts"
            />
          </div>
        </div>

        <div className="bg-background">
          <PostList posts={sortedPosts} baseRoute="/admin/forum" />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex max-w-7xl mx-auto relative">
        <ForumSidebar
          selectedForum={selectedForum}
          onForumSelect={(forumId) => router.push(`/admin/forum/${forumId}`)}
          forums={transformedForums}
          isOpen={true}
          onClose={() => {}}
          onForumCreated={refetchForums}
          apiEndpoint="/api/forums"
          baseRoute="/admin/forum"
        />

        <main className="flex-1 p-4">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {selectedForum === "all"
                  ? "All Posts"
                  : transformedForums.find((f) => f.id === selectedForum)?.name}
              </h1>

              <div className="flex items-center gap-3">
                <CreatePostAuth
                  forums={transformedForums}
                  selectedForumId={
                    selectedForum !== "all" ? selectedForum : undefined
                  }
                  onPostCreated={refetchPosts}
                  apiEndpoint="/api/posts"
                />

                <div className="flex gap-2 overflow-x-auto">
                  {(["hot", "new", "top"] as const).map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`px-3 sm:px-4 py-2 rounded-lg capitalize transition-colors whitespace-nowrap ${
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
            </div>
          </div>
          <PostList posts={sortedPosts} baseRoute="/admin/forum" />
        </main>
      </div>
    </div>
  );
}

function getForumColor(forumId: number): string {
  const colors = [
    "bg-green-500", // forumId 1, 7, 13...
    "bg-purple-500", // forumId 2, 8, 14...
    "bg-blue-500", // forumId 3, 9, 15...
    "bg-red-500", // forumId 4, 10, 16...
    "bg-yellow-500", // forumId 5, 11, 17...
    "bg-pink-500", // forumId 6, 12, 18...
  ];

  return colors[(forumId - 1) % colors.length];
}

