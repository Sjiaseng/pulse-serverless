import PostCard from "./PostCard";
import { Post } from "@/types/forum";

interface PostListProps {
  posts: Post[];
  baseRoute?: string;
}

export default function PostList({ posts, baseRoute }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">No posts found</div>
        <div className="text-sm text-muted-foreground">
          Be the first to start a discussion in this community!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        // Transform real data to match PostCard's expected format
        const transformedPost = {
          id: post.id,
          title: post.title,
          description: post.description,
          datePost: post.datePost || new Date().toISOString(),
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0,
          forumId: post.forumId.toString(),
          userId: post.userId,
          commentCount: post.commentCount,
          username: post.username || "Unknown",
          forumName: post.forumName || "Unknown Forum",
        };

        // Create user object for PostCard
        const user = {
          id: post.userId,
          username: post.username || "Unknown",
        };

        // Create forum object for PostCard
        const forum = {
          id: post.forumId.toString(),
          name: post.forumName || "Unknown Forum",
          description: "",
          color: post.forum?.color || "bg-blue-500", // Use forum color from post data
          memberCount: 0, // We don't have member count in current schema
        };

        return (
          <PostCard
            key={post.id}
            post={transformedPost}
            user={user}
            forum={forum}
            baseRoute={baseRoute}
          />
        );
      })}
    </div>
  );
}
