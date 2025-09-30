// Forum-related types
export interface Forum {
  id: string;
  name: string;
  description: string;
  color: string;
  memberCount: number;
  topic?: string;
  popular_rank?: number;
}

// Post type based on database structure
export interface Post {
  id: string;
  title: string;
  description: string;
  datePost: string | null;
  upvotes: number | null;
  downvotes: number | null;
  forumId: number;
  userId: string;
  username: string | null;
  forumName: string | null;
  commentCount: number;
  userAvatar?: string | null;
  forum?: {
    color?: string;
  };
}

// User type for forum context
export interface ForumUser {
  id: string;
  username: string;
}

// Transformed post for PostCard component
export interface TransformedPost {
  id: string;
  title: string;
  description: string;
  datePost: string;
  upvotes: number;
  downvotes: number;
  forumId: string;
  userId: string;
  commentCount: number;
  username: string;
  forumName: string;
}