"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MilestoneCard } from "./milestone-card";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { Milestone } from "@/lib/milestones";

/** Matches MAX_CAPTION_LENGTH in the backend, so a valid post never 400s. */
const MAX_LENGTH = 280;

interface CreatePostProps {
  /** Optional achievement card to attach to the post. */
  milestone?: Milestone | null;
  onSubmit: (payload: { caption: string; milestone: Milestone | null }) => Promise<void> | void;
  onRemoveMilestone?: () => void;
  autoFocus?: boolean;
}

export function CreatePost({
  milestone = null,
  onSubmit,
  onRemoveMilestone,
  autoFocus,
}: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = content.trim().length > 0 || Boolean(milestone);

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ caption: content.trim(), milestone });
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-start gap-3">
      {user && <Avatar src={user.avatarUrl ?? undefined} alt={user.username} size="md" />}
      <div className="flex-1 min-w-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="Share your achievement or thought..."
          autoFocus={autoFocus}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
          rows={3}
          maxLength={MAX_LENGTH}
        />

        <div className="mt-1 flex justify-end">
          <span
            className={cn(
              "text-xs",
              content.length >= MAX_LENGTH
                ? "text-red-500"
                : "text-gray-400 dark:text-gray-500"
            )}
          >
            {content.length}/{MAX_LENGTH}
          </span>
        </div>

        {milestone && user && (
          <div className="relative mt-3">
            <MilestoneCard
              milestone={milestone}
              user={user}
              variant="feed"
            />
            {onRemoveMilestone && (
              <button
                type="button"
                onClick={onRemoveMilestone}
                aria-label="Remove achievement card"
                className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-gray-900 text-white text-sm leading-none flex items-center justify-center shadow-md hover:bg-gray-700 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit} isLoading={isSubmitting}>
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
