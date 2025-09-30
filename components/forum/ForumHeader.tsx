import { Menu } from "lucide-react";

interface ForumHeaderProps {
  onMenuClick?: () => void;
}

export default function ForumHeader({ onMenuClick }: ForumHeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      {/* Mobile Header */}
      <div className="sm:hidden px-3 py-2">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center">
            {/* Empty header for desktop */}
          </div>
        </div>
      </div>
    </header>
  );
}
