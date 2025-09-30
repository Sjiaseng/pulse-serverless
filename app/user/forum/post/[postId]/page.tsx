'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, MessageCircle, Share, Bookmark, Trash2, ArrowLeft, Edit, Save, X } from 'lucide-react';
import Link from 'next/link';
import CommentSection from '@/components/forum/CommentSection';
import { usePost } from '@/lib/hooks/useForum';
import { useAuth } from '@/contexts/AuthContext';

export default function UserPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;
  const { user } = useAuth();
  
  const { post, loading, error, refetch } = usePost(postId, '/api/user/posts');
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [localUpvotes, setLocalUpvotes] = useState(0);
  const [localDownvotes, setLocalDownvotes] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Update local vote counts when post data loads
  useState(() => {
    if (post) {
      setLocalUpvotes(post.upvotes || 0);
      setLocalDownvotes(post.downvotes || 0);
      setEditTitle(post.title);
      setEditDescription(post.description);
    }
  });

  // Check if current user is the author of the post
  const isAuthor = user && post && user.id === post.user_id;

  const handleVote = async (voteType: 'up' | 'down') => {
    if (isVoting || !post) return;
    
    setIsVoting(true);
    
    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        if (userVote === voteType) {
          // Remove vote
          if (voteType === 'up') {
            setLocalUpvotes(prev => prev - 1);
          } else {
            setLocalDownvotes(prev => prev - 1);
          }
          setUserVote(null);
        } else {
          // Add new vote, remove old if exists
          if (userVote === 'up') {
            setLocalUpvotes(prev => prev - 1);
          } else if (userVote === 'down') {
            setLocalDownvotes(prev => prev - 1);
          }

          if (voteType === 'up') {
            setLocalUpvotes(prev => prev + 1);
          } else {
            setLocalDownvotes(prev => prev + 1);
          }
          setUserVote(voteType);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!post || isDeleting) return;
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push(`/user/forum/${post.forum_id}`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete post. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditDescription(post.description);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditDescription(post.description);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!post || isSaving) return;
    
    if (!editTitle.trim() || !editDescription.trim()) {
      alert('Title and description cannot be empty.');
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
        }),
      });

      if (response.ok) {
        await refetch(); // Refresh the post data
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update post. Please try again.');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimeAgo = (dateString: string | Date | null) => {
    if (!dateString) return 'Unknown date';
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
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
          <p className="text-red-500 mb-4">Error: {error || 'Post not found'}</p>
          <button 
            onClick={() => router.push('/user/forum')}
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
            href={`/user/forum/${post.forum_id}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to r/{post.forum_topic}
          </Link>
        </div>

        {/* Post Content */}
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            {/* Post Header - Mobile */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Link
                  href={`/user/forum/${post.forum_id}`}
                  className="font-medium hover:text-foreground !min-h-0"
                >
                  r/{post.forum_topic}
                </Link>
                <span>•</span>
                <span>u/{post.username || 'Unknown'}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.date_posted)}</span>
              </div>

              {/* Post Title - Mobile */}
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-lg font-bold text-foreground mb-3 p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Post title..."
                />
              ) : (
                <h1 className="text-lg font-bold text-foreground mb-3">
                  {post.title}
                </h1>
              )}

              {/* Author Actions - Mobile */}
              {isAuthor && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {!isEditing ? (
                    <>
                      <button 
                        onClick={handleEdit}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Save className="w-3 h-3" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Post Content - Mobile */}
            <div className="p-4">
              {isEditing ? (
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full min-h-[150px] p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-vertical mb-4"
                  placeholder="Post content..."
                />
              ) : (
                <div className="text-foreground mb-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.description}</p>
                </div>
              )}

              {/* Vote and Actions - Mobile */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleVote('up')}
                      disabled={isVoting}
                      className={`p-1.5 rounded-lg transition-colors ${
                        userVote === 'up'
                          ? 'bg-orange-100 text-orange-600'
                          : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    
                    <span className={`text-sm font-semibold min-w-[2rem] text-center ${
                      netVotes > 0 ? 'text-orange-600' : 
                      netVotes < 0 ? 'text-blue-600' : 
                      'text-muted-foreground'
                    }`}>
                      {netVotes}
                    </span>
                    
                    <button
                      onClick={() => handleVote('down')}
                      disabled={isVoting}
                      className={`p-1.5 rounded-lg transition-colors ${
                        userVote === 'down'
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comment_count}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-accent rounded-lg transition-colors">
                    <Share className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-1.5 hover:bg-accent rounded-lg transition-colors">
                    <Bookmark className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:block p-6">
            <div className="flex gap-4">
              {/* Vote Section - Desktop */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleVote('up')}
                  disabled={isVoting}
                  className={`p-2 rounded-lg transition-colors ${
                    userVote === 'up'
                      ? 'bg-orange-100 text-orange-600'
                      : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                
                <span className={`font-semibold ${
                  netVotes > 0 ? 'text-orange-600' : 
                  netVotes < 0 ? 'text-blue-600' : 
                  'text-muted-foreground'
                }`}>
                  {netVotes}
                </span>
                
                <button
                  onClick={() => handleVote('down')}
                  disabled={isVoting}
                  className={`p-2 rounded-lg transition-colors ${
                    userVote === 'down'
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>

              {/* Main Content - Desktop */}
              <div className="flex-1 min-w-0">
                {/* Post Meta - Desktop */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link
                      href={`/user/forum/${post.forum_id}`}
                      className="font-medium hover:text-foreground"
                    >
                      r/{post.forum_topic}
                    </Link>
                    <span>•</span>
                    <span>Posted by u/{post.username || 'Unknown'}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(post.date_posted)}</span>
                  </div>

                  {isAuthor && (
                    <div className="flex items-center gap-2">
                      {!isEditing ? (
                        <>
                          <button 
                            onClick={handleEdit}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Save className="w-3 h-3" />
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Post Title - Desktop */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-2xl font-bold text-foreground mb-4 p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Post title..."
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-foreground mb-4">
                    {post.title}
                  </h1>
                )}

                {/* Post Content - Desktop */}
                {isEditing ? (
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full min-h-[200px] p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-vertical mb-6"
                    placeholder="Post content..."
                  />
                ) : (
                  <div className="prose prose-sm max-w-none text-foreground mb-6">
                    <p className="whitespace-pre-wrap">{post.description}</p>
                  </div>
                )}

                {/* Post Actions - Desktop */}
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
        </div>

        {/* Comments Section */}
        <CommentSection postId={parseInt(postId)} />
      </div>
    </div>
  );
}
