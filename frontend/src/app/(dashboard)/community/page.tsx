"use client";

import React, { useEffect, useRef, useState } from "react";
import { FeedList } from "@/components/community/feed-list";
import { FeedTabs } from "@/components/community/feed-tabs";
import { FollowingEmptyState } from "@/components/community/following-empty-state";
import { WhoToFollow } from "@/components/community/who-to-follow";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ErrorNotice } from "@/components/ui/state";
import { postsApi } from "@/lib/api";
import { useResource } from "@/hooks/useResource";
import { useCompose } from "@/context/ComposeContext";
import { useAuth } from "@/context/AuthContext";
import type { Post } from "@/types";

const TAB_KEY = "brainsnack-feed-tab";
type FeedScope = "discover" | "following";

export default function CommunityPage() {
  const { user } = useAuth();
  const { openCompose, lastPosted } = useCompose();
  const [tab, setTab] = useState<FeedScope>("discover");

  // Remember the learner's last feed choice across visits.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(TAB_KEY);
      if (stored === "following" || stored === "discover") setTab(stored);
    } catch {
      // Private browsing / disabled storage: fall back to Discover.
    }
  }, []);

  const changeTab = (next: string) => {
    const scope = next as FeedScope;
    setTab(scope);
    try {
      window.localStorage.setItem(TAB_KEY, scope);
    } catch {
      // Non-fatal: the tab still switches for this session.
    }
  };

  const {
    data: posts,
    setData,
    isLoading,
    error,
    reload,
  } = useResource<Post[]>(() => postsApi.feed(20, tab), [tab]);

  const [actionError, setActionError] = useState("");

  // Prepend a post created anywhere via the global composer, once.
  const consumedPostedId = useRef<string | null>(null);
  useEffect(() => {
    if (!lastPosted || consumedPostedId.current === lastPosted.id) return;
    consumedPostedId.current = lastPosted.id;
    setData((current) => [
      lastPosted,
      ...(current ?? []).filter((post) => post.id !== lastPosted.id),
    ]);
  }, [lastPosted, setData]);

  const handleLike = async (id: string) => {
    // The card has already applied the optimistic state; this reconciles it with
    // the server's authoritative count, or reverts on failure.
    try {
      const result = await postsApi.like(id);
      setData((current) =>
        (current ?? []).map((post) =>
          post.id === id
            ? { ...post, likedByUser: result.liked, likesCount: result.likesCount }
            : post
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
        (current ?? []).map((post) =>
          post.id === id
            ? { ...post, likedByUser: result.liked, likesCount: result.likesCount }
            : post
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

      {/* X-style compose prompt: tapping it opens the shared composer modal. */}
      <button
        type="button"
        onClick={() => openCompose()}
        className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50 transition-colors"
      >
        {user && <Avatar src={user.avatarUrl ?? undefined} alt={user.username} size="md" />}
        <span className="text-gray-400 dark:text-gray-500">
          Share your achievement or thought...
        </span>
      </button>

      <FeedTabs
        tabs={[
          { id: "discover", label: "Discover" },
          { id: "following", label: "Following" },
        ]}
        active={tab}
        onChange={changeTab}
      />

      {actionError && <ErrorNotice message={actionError} />}

      <FeedList
        posts={posts ?? []}
        onLike={handleLike}
        onUnlike={handleUnlike}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        emptyState={
          tab === "following" ? (
            <FollowingEmptyState onBrowse={() => changeTab("discover")} />
          ) : undefined
        }
      />

      {tab === "discover" && (
        <Card>
          <CardContent className="pt-5">
            <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
              Who to follow
            </h2>
            <WhoToFollow />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
