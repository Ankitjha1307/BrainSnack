"use client";

import React, { useState } from "react";
import { CreatePost } from "@/components/community/create-post";
import { FeedList } from "@/components/community/feed-list";
import { ErrorNotice } from "@/components/ui/state";
import { postsApi } from "@/lib/api";
import { useResource } from "@/hooks/useResource";
import type { Post } from "@/types";

export default function CommunityPage() {
  const {
    data: posts,
    setData,
    isLoading,
    error,
    reload,
  } = useResource<Post[]>(() => postsApi.feed(), []);

  const [actionError, setActionError] = useState("");

  const handleCreatePost = async (content: string) => {
    setActionError("");
    try {
      const created = await postsApi.create({ caption: content });
      // Prepend so the author sees their post immediately, without a round trip.
      setData((current) => [created, ...(current ?? [])]);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not share that post");
    }
  };

  const handleLike = async (id: string) => {
    // The card has already applied the optimistic state; this reconciles it with
    // the server's authoritative count, or reverts on failure.
    try {
      const result = await postsApi.like(id);
      setData((current) =>
        (current ?? []).map((p) =>
          p.id === id ? { ...p, likedByUser: result.liked, likesCount: result.likesCount } : p
        )
      );
    } catch {
      reload();
    }
  };

  const handleUnlike = async (id: string) => {
    try {
      const result = await postsApi.unlike(id);
      setData((current) =>
        (current ?? []).map((p) =>
          p.id === id ? { ...p, likedByUser: result.liked, likesCount: result.likesCount } : p
        )
      );
    } catch {
      reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Share your progress and connect with others
        </p>
      </div>

      <CreatePost onSubmit={handleCreatePost} />

      {actionError && <ErrorNotice message={actionError} />}

      <FeedList
        posts={posts ?? []}
        onLike={handleLike}
        onUnlike={handleUnlike}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
      />
    </div>
  );
}