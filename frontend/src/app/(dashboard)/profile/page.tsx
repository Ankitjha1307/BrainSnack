"use client";

import React from "react";
import Link from "next/link";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { BadgeGrid } from "@/components/profile/badge-grid";
import { TopicProgress } from "@/components/profile/topic-progress";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, SkeletonList } from "@/components/ui/state";
import { progressApi, postsApi } from "@/lib/api";
import { useResource } from "@/hooks/useResource";
import { useAuth } from "@/context/AuthContext";
import { formatRelativeTime } from "@/lib/utils";
import type { Post, UserProgress } from "@/types";

export default function ProfilePage() {
  const { user, isGuest } = useAuth();

  const {
    data: progress,
    isLoading,
    error,
    reload,
  } = useResource<UserProgress>(() => progressApi.get(), []);

  // Guests are excluded from the community feed, so only fetch their own posts.
  const { data: myPosts } = useResource<Post[]>(
    () => (isGuest ? postsApi.mine() : Promise.resolve([])),
    [isGuest]
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <SkeletonList rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!user || !progress) return null;

  const allBadges = [...progress.badges, ...progress.lockedBadges];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProfileHeader user={user} />

      {isGuest && (
        <Card className="border-amber-300 dark:border-amber-700">
          <CardContent className="pt-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
              You&apos;re signed in as a guest. Your progress lives in this browser session and
              cannot be signed back into later.
            </p>
            <Link
              href="/register"
              className="shrink-0 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Create an account to keep it →
            </Link>
          </CardContent>
        </Card>
      )}

      <ProfileStats
        totalXP={progress.totalXP}
        level={progress.level}
        streak={progress.currentStreak}
        personalBest={progress.personalBest}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BadgeGrid badges={allBadges} />
        <TopicProgress topicMastery={progress.topicProgress} />
      </div>

      <Card>
        <CardContent className="pt-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Quiz history
          </h2>
          {progress.recentQuizzes.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No quizzes yet"
              description="Finish your first quiz and it will show up here."
              action={
                <Link
                  href="/topics"
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Browse topics
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {progress.recentQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {quiz.topicName ?? "Mixed quiz"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {quiz.questionCount} questions ·{" "}
                      {quiz.completedAt ? formatRelativeTime(quiz.completedAt) : quiz.status}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{quiz.score}%</p>
                    <p className="text-xs text-accent-600 dark:text-accent-400">+{quiz.xpEarned} XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isGuest && (
        <Card>
          <CardContent className="pt-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Your posts
            </h2>
            {myPosts && myPosts.length > 0 ? (
              <div className="space-y-3">
                {myPosts.map((post) => {
                  const text = typeof post.content?.text === "string" ? post.content.text : "";
                  return (
                    <div
                      key={post.id}
                      className="py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatRelativeTime(post.createdAt)} · {post.likesCount} likes
                      </p>
                    </div>
                  );
                })}
                <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                  Guest posts are hidden from the public community feed.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You haven&apos;t posted anything yet.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}