"use client";

import React, { useState } from "react";
import type { Post } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onUnlike: (id: string) => void;
}

/** The backend stores the post body as JSONB; `text` is the only key we render. */
function postText(post: Post): string {
  const text = post.content?.text;
  return typeof text === "string" ? text : "";
}

export function PostCard({ post, onLike, onUnlike }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.likedByUser);
  const [likes, setLikes] = useState(post.likesCount);

  const handleLike = () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikes((current) => Math.max(0, current + (nextLiked ? 1 : -1)));
    if (nextLiked) {
      onLike(post.id);
    } else {
      onUnlike(post.id);
    }
  };

  const body = postText(post);

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start gap-3">
          <Avatar
            src={post.author.avatarUrl ?? undefined}
            alt={post.author.username}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {post.author.displayName || post.author.username}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {formatRelativeTime(post.createdAt)}
              </span>
            </div>
            {post.caption && (
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-accent-100 dark:bg-accent-900/30 rounded-full text-xs font-medium text-accent-700 dark:text-accent-300">
                <span>🏆</span>
                {post.caption}
              </div>
            )}
            {body && (
              <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {body}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3">
              <button
                type="button"
                onClick={handleLike}
                aria-pressed={isLiked}
                aria-label={isLiked ? "Unlike post" : "Like post"}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill={isLiked ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {likes}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}