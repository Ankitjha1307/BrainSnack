"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="Share your achievement or thought..."
          autoFocus={autoFocus}
          className="min-h-24"
          rows={3}
          maxLength={MAX_LENGTH}
        />

        <div className="mt-1 flex justify-end">
          <span
            className={cn(
              "text-xs",
              content.length >= MAX_LENGTH
                ? "text-foreground"
                : "text-muted"
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
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={onRemoveMilestone}
                aria-label="Remove achievement card"
                className="absolute -right-2 -top-2 h-7 w-7 rounded-base p-0 text-sm leading-none"
              >
                ✕
              </Button>
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
