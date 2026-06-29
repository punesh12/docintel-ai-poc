"use client";

import { Pause, Play, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UploadToolbarProps {
  searchQuery: string;
  stats: { uploading: number; queued: number; completed: number };
  onSearchChange: (query: string) => void;
  onClearCompleted: () => void;
  onPauseAll: () => void;
  onResumeAll: () => void;
}

export function UploadToolbar({
  searchQuery,
  stats,
  onSearchChange,
  onClearCompleted,
  onPauseAll,
  onResumeAll,
}: UploadToolbarProps) {
  const hasActive = stats.uploading > 0 || stats.queued > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search uploads..."
          className="pl-9"
        />
      </div>

      <Button variant="outline" size="sm" disabled={!hasActive} onClick={onPauseAll}>
        <Pause className="h-4 w-4" />
        Pause All
      </Button>
      <Button variant="outline" size="sm" disabled={!hasActive} onClick={onResumeAll}>
        <Play className="h-4 w-4" />
        Resume All
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={stats.completed === 0}
        onClick={onClearCompleted}
      >
        <Trash2 className="h-4 w-4" />
        Clear Finished
      </Button>
    </div>
  );
}
