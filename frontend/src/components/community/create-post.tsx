"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

const MAX_LENGTH = 500;

interface CreatePostProps {
  onSubmit: (content: string) => Promise<void> | void;
}

export function CreatePost({ onSubmit }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      // Only clear on success - losing the draft on a failed post is hostile.
      setContent("");
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start gap-3">
          {user && <Avatar src={user.avatarUrl ?? undefined} alt={user.username} size="md" />}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
              onFocus={() => setIsExpanded(true)}
              placeholder="Share your achievement or thought..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
              rows={isExpanded ? 3 : 1}
              maxLength={MAX_LENGTH}
            />
            {isExpanded && (
              <div className="flex items-center justify-between mt-3 gap-2">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {content.length}/{MAX_LENGTH}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsExpanded(false);
                      setContent("");
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!content.trim()}
                    isLoading={isSubmitting}
                  >
                    Post
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
