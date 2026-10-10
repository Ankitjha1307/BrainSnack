"use client";

import React from "react";
import Link from "next/link";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { BadgeGrid } from "@/components/profile/badge-grid";
import { TopicProgress } from "@/components/profile/topic-progress";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, SkeletonList } from "@/components/ui/state";
import { progressApi } from "@/lib/api";
import { useResource } from "@/hooks/useResource";
import { useAuth } from "@/context/AuthContext";
import { formatRelativeTime } from "@/lib/utils";
import type { UserProgress } from "@/types";

export default function ProfilePage() {
  const { user } = useAuth();

  const {
    data: progress,
    isLoading,
    error,
    reload,
  } = useResource<UserProgress>(() => progressApi.get(), []);

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
          <h2 className="text-base font-semibold text-foreground mb-4">
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
                  className="text-sm font-medium text-primary-600 hover:underline"
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
                  className="flex items-center justify-between py-2 border-b border-surface-muted last:border-0"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-medium text-foreground truncate">
                      {quiz.topicName ?? "Mixed quiz"}
                    </p>
                    <p className="text-xs text-muted">
                      {quiz.questionCount} questions ·{" "}
                      {quiz.completedAt ? formatRelativeTime(quiz.completedAt) : quiz.status}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">{quiz.score}%</p>
                    <p className="text-xs text-accent-600">+{quiz.xpEarned} XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}