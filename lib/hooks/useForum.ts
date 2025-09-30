import { useState, useEffect } from 'react';

// Types based on your database schema
export interface Forum {
  id: number;
  topic: string;
  description: string | null;
  popular_rank: number | null;
  user_id: string;
  created_at: Date | null;
}

export interface ForumPost {
  id: number;
  title: string;
  description: string;
  date_posted: Date | null;
  upvotes: number | null;
  downvotes: number | null;
  forum_id: number;
  user_id: string;
  username: string | null;
  user_profile_picture: string | null;
  forum_topic: string | null;
  comment_count: number;
}

export interface ForumComment {
  id: number;
  content: string;
  date_created: Date | null;
  upvotes: number | null;
  downvotes: number | null;
  forum_post_id: number;
  user_id: string;
  username: string | null;
  user_profile_picture: string | null;
  user_role: string | null;
}

// Custom hook for fetching forums
export function useForums(apiEndpoint: string = '/api/forums') {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForums = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch forums');
      }
      const data = await response.json();
      setForums(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForums();
  }, []);

  return { forums, loading, error, refetch: fetchForums };
}

// Custom hook for fetching posts
export function usePosts(forumId?: number, apiEndpoint: string = '/api/posts') {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = forumId ? `${apiEndpoint}?forumId=${forumId}` : apiEndpoint;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [forumId, apiEndpoint]);

  return { posts, loading, error, refetch: fetchPosts };
}

// Custom hook for fetching comments
export function useComments(postId: number) {
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return { comments, loading, error, refetch: fetchComments };
}

// Utility functions for API calls
export const forumAPI = {
  // Vote on a post
  async votePost(postId: number, type: 'upvote' | 'downvote') {
    const response = await fetch(`/api/posts/${postId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to vote on post');
    }
    
    return response.json();
  },

  // Vote on a comment
  async voteComment(commentId: number, type: 'upvote' | 'downvote') {
    const response = await fetch(`/api/comments/${commentId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to vote on comment');
    }
    
    return response.json();
  },

  // Create a new post
  async createPost(data: {
    title: string;
    description: string;
    forum_id: number;
    user_id: string;
  }) {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
    
    return response.json();
  },

  // Create a new comment
  async createComment(data: {
    content: string;
    forum_post_id: number;
    user_id: string;
  }) {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create comment');
    }
    
    return response.json();
  },

  // Create a new forum
  async createForum(data: {
    topic: string;
    description?: string;
    user_id: string;
  }) {
    const response = await fetch('/api/forums', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create forum');
    }
    
    return response.json();
  },
  // Delete a post
  async deletePost(postId: number) {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
    
    return response.json();
  },
};

// Custom hook for fetching a single post
export function usePost(postId: string, apiEndpoint: string = '/api/user/posts') {
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiEndpoint}/${postId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Post not found');
        }
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();
      setPost(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId, apiEndpoint]);

  return { post, loading, error, refetch: fetchPost };
}
