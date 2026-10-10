"use client";

import React, { useEffect, useRef, useState } from "react";
import { FeedList } from "@/components/community/feed-list";
import { FeedTabs } from "@/components/community/feed-tabs";
import { FollowingEmptyState } from "@/components/community/following-empty-state";
import { WhoToFollow } from "@/components/community/who-to-follow";
import { StudyNudge } from "@/components/community/study-nudge";
import { TopLearners } from "@/components/community/top-learners";
import { DailyChallenge } from "@/components/dashboard/daily-challenge";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorNotice } from "@/components/ui/state";
import { postsApi, progressApi } from "@/lib/api";
import { useResource } from "@/hooks/useResource";
import { useCompose } from "@/context/ComposeContext";
import { useAuth } from "@/context/AuthContext";
import type { Post } from "@/types";

const TAB_KEY = "brainsnack-feed-tab";
type FeedScope = "discover" | "following";

export default function CommunityPage() {
  const { user } = useAuth();
  const { lastPosted } = useCompose();
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

  // Fresh XP/level/streak for the top strip. Falls back to the cached auth
  // user before progress resolves so the row never flashes zeros.
  const { data: progress } = useResource(() => progressApi.get(), []);
  const stats = {
    totalXP: progress?.totalXP ?? user?.xp ?? 0,
    level: progress?.level ?? user?.level ?? 1,
    streak: progress?.currentStreak ?? user?.streak ?? 0,
    personalBest: progress?.personalBest ?? user?.personalBest ?? 0,
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Community</h1>
        <p className="mt-1 text-muted">
          Share your progress and connect with others
        </p>
      </div>

      {/* Stats strip - full width above the columns */}
      <QuickStats
        totalXP={stats.totalXP}
        level={stats.level}
        streak={stats.streak}
        personalBest={stats.personalBest}
      />

      {/*
       * Responsive shell:
       *   mobile  -> single column (feed first, then the side cards)
       *   lg      -> left rail + feed
       *   xl      -> left rail + feed + right rail, filling the width
       */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,320px)]">
        {/* Left rail */}
        <aside className="order-2 space-y-6 lg:order-1 lg:sticky lg:top-24 lg:self-start">
          <StudyNudge />

          <Card>
            <CardContent className="pt-5">
              <h2 className="mb-3 text-base font-semibold text-foreground">
                Who to follow
              </h2>
              <WhoToFollow />
            </CardContent>
          </Card>
        </aside>

        {/* Feed */}
        <div className="order-1 min-w-0 lg:order-2">
          <FeedTabs
            tabs={[
              { id: "discover", label: "Discover" },
              { id: "following", label: "Following" },
            ]}
            active={tab}
            onChange={changeTab}
          />

          {actionError && (
            <div className="mt-4">
              <ErrorNotice message={actionError} />
            </div>
          )}

          <div className="mt-4">
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
          </div>
        </div>

        {/* Right rail - only on very wide screens to use the full width */}
        <aside className="order-3 hidden space-y-6 xl:order-3 xl:block xl:sticky xl:top-24 xl:self-start">
          <DailyChallenge />
          <TopLearners />
        </aside>
      </div>
    </div>
  );
}
