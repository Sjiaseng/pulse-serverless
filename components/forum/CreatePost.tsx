"use client";

import { useState, useEffect } from "react";
import { forumAPI } from "@/lib/hooks/useForum";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, X, Send } from "lucide-react";
import { Forum } from "@/types/forum";

interface CreatePostProps {
  // For main forum page interface
  forums?: Forum[];
  selectedForumId?: string;
  onPostCreated?: () => void;

  // For specific forum page interface
  forumId?: number;
  onClose?: () => void;
}

export default function CreatePost({
  forums,
  selectedForumId,
  onPostCreated,
  forumId,
  onClose,
}: CreatePostProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedForum, setSelectedForum] = useState(selectedForumId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableForums, setAvailableForums] = useState(forums || []);

  // If forumId is provided, this is being used in specific forum page mode
  const isSpecificForumMode = !!forumId;

  // If in specific forum mode, set isOpen to true by default and fetch forums if not provided
  useEffect(() => {
    if (isSpecificForumMode) {
      setIsOpen(true);
      setSelectedForum(forumId.toString());

      // Fetch forums if not provided
      if (!forums || forums.length === 0) {
        const fetchForums = async () => {
          try {
            const response = await fetch("/api/forums");
            if (response.ok) {
              const forumsData = await response.json();
              const transformedForums = forumsData.map((forum: Forum) => ({
                id: forum.id.toString(),
                name: forum.topic,
                description: forum.description || "",
                color: "bg-blue-500",
                memberCount: 0,
              }));
              setAvailableForums(transformedForums);
            }
          } catch (error) {
            console.error("Error fetching forums:", error);
          }
        };
        fetchForums();
      }
    }
  }, [isSpecificForumMode, forumId, forums]);

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedForum || isSubmitting)
      return;

    if (!user?.id) {
      alert("You must be logged in to create a post");
      return;
    }

    setIsSubmitting(true);

    try {

      console.log("Creating post with data:", {
        title: title.trim(),
        description: description.trim(),
        forum_id: parseInt(selectedForum),
        user_id: user.id,
      });

      const response = await forumAPI.createPost({
        title: title.trim(),
        description: description.trim(),
        forum_id: parseInt(selectedForum),
        user_id: user.id,
      });

      console.log("Post created successfully:", response);

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedForum(selectedForumId || "");

      if (isSpecificForumMode) {
        onClose?.();
      } else {
        setIsOpen(false);
      }

      // Notify parent to refresh
      onPostCreated?.();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSpecificForumMode) {
      onClose?.();
    } else {
      setIsOpen(false);
    }
    setTitle("");
    setDescription("");
    setSelectedForum(selectedForumId || "");
  };

  // For main forum page - show button when not open
  if (!isSpecificForumMode && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Create Post
      </button>
    );
  }

  // Don't render anything if not open and not in specific forum mode
  if (!isSpecificForumMode && !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Create a Post
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Forum Selection - only show if not in specific forum mode or if multiple forums available */}
          {(!isSpecificForumMode || availableForums.length > 1) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Choose a community
              </label>
              <select
                value={selectedForum}
                onChange={(e) => setSelectedForum(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isSpecificForumMode}
              >
                <option value="">Select a forum...</option>
                {availableForums.map((forum) => (
                  <option key={forum.id} value={forum.id}>
                    r/{forum.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="An interesting title"
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={300}
              required
            />
            <div className="text-xs text-muted-foreground text-right">
              {title.length}/300
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Text (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={6}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !title.trim() ||
                !description.trim() ||
                !selectedForum ||
                isSubmitting
              }
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
