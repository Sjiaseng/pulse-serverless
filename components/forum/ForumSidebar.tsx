"use client";

import { Home, TrendingUp, X } from "lucide-react";
import CreateForum from "./CreateForum";
import Link from "next/link";

// Updated interface to match real data structure
interface Forum {
  id: string;
  name: string;
  description: string;
  color: string;
  memberCount: number;
}

interface ForumSidebarProps {
  selectedForum: string;
  onForumSelect: (forumId: string) => void;
  forums: Forum[];
  isOpen?: boolean;
  onClose?: () => void;
  onForumCreated?: () => void;
  apiEndpoint?: string;
  baseRoute?: string;
}

export default function ForumSidebar({
  selectedForum,
  onForumSelect,
  forums,
  isOpen = true,
  onClose,
  onForumCreated,
  baseRoute = "/forum",
}: ForumSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-auto
        w-64 lg:w-64 h-screen bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        overflow-y-auto
      `}
      >
        <div className="p-4">
          {/* Mobile close button */}
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h2 className="text-lg font-semibold text-foreground">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Navigation */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Navigation
              </h3>
              <div className="space-y-1">
                <Link
                  href={baseRoute}
                  onClick={onClose}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedForum === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link
                  href={`${baseRoute}?filter=popular`}
                  onClick={onClose}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-foreground hover:bg-accent transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  Popular
                </Link>
              </div>
            </div>

            {/* Forums */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Communities
                </h3>
                <CreateForum onForumCreated={onForumCreated} />
              </div>
              <div className="space-y-1">
                {forums.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No communities yet
                  </div>
                ) : (
                  forums.map((forum) => (
                    <button
                      key={forum.id}
                      onClick={() => {
                        onForumSelect(forum.id);
                        onClose?.();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedForum === forum.id
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-accent"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${forum.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{forum.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {forum.memberCount > 0
                            ? `${forum.memberCount.toLocaleString()} members`
                            : "New community"}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Forum Rules */}
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Forum Rules
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Be respectful and kind</li>
                <li>• No medical advice</li>
                <li>• Stay on topic</li>
                <li>• No spam or self-promotion</li>
              </ul>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
