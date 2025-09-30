"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { forumAPI } from "@/lib/hooks/useForum";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, X, Send } from "lucide-react";
import toast from "react-hot-toast";

interface CreateForumProps {
  onForumCreated?: () => void;
}

export default function CreateForum({ onForumCreated }: CreateForumProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isSubmitting) return;

    if (!user?.id) {
      alert("You must be logged in to create a forum");
      return;
    }

    setIsSubmitting(true);

    try {
      await forumAPI.createForum({
        topic: topic.trim(),
        description: description.trim() || undefined,
        user_id: user.id,
      });

      // Reset form
      setTopic("");
      setDescription("");
      setIsOpen(false);

      // Notify parent to refresh
      onForumCreated?.();
    } catch (error) {
      console.error("Error creating forum:", error);
      toast.error("Error creating forum. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTopic("");
    setDescription("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
        title="Create Community"
      >
        <Plus className="w-4 h-4" />
      </button>
    );
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Create a Community
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Topic */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Community name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  r/
                </span>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="community_name"
                  className="w-full pl-8 pr-3 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={50}
                  required
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Community names including capitalization cannot be changed.{" "}
                {topic.length}/50
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this community about?"
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground text-right">
                {description.length}/500
              </div>
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
                disabled={!topic.trim() || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Creating..." : "Create Community"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
