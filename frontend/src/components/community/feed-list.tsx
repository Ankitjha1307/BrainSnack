"use client";

import React from "react";
import type { Post } from "@/types";
import { PostCard } from "./post-card";
import { ErrorState } from "@/components/ui/state";

interface FeedListProps {
  posts: Post[];
  onLike: (id: string) => void;
  onUnlike: (id: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Overrides the default "no posts" message (e.g. the Following cold-start). */
  emptyState?: React.ReactNode;
}

export function FeedList({
  posts,
  onLike,
  onUnlike,
  isLoading,
  error,
  onRetry,
  emptyState,
}: FeedListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-secondary-background dark:bg-foreground rounded-xl border border-surface-muted dark:border-foreground p-5 animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-surface-muted dark:bg-foreground" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-muted dark:bg-foreground rounded w-1/4" />
                <div className="h-3 bg-surface-muted dark:bg-foreground rounded w-3/4" />
                <div className="h-3 bg-surface-muted dark:bg-foreground rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // A load failure must not look like "nobody has posted yet".
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (posts.length === 0) {
    if (emptyState) return <>{emptyState}</>;
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-surface-muted0 dark:text-muted">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLike={onLike} onUnlike={onUnlike} />
      ))}
    </div>
  );
}