"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { progressApi } from "@/lib/api";
import { useResource } from "@/hooks/useResource";
import { DailyChallenge } from "@/components/dashboard/daily-challenge";
import { XPDisplay } from "@/components/dashboard/xp-display";
import { StreakDisplay } from "@/components/dashboard/streak-display";
import { TopicMasteryList } from "@/components/dashboard/topic-mastery-list";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorState, SkeletonList } from "@/components/ui/state";
import { formatRelativeTime, formatXP } from "@/lib/utils";

export default function DashboardPage() {
  const { user, isGuest } = useAuth();

  const {
    data: progress,
    isLoading,
    error,
    reload,
  } = useResource(() => progressApi.get(), []);

  const firstName = (user?.displayName || user?.username || "there").split(" ")[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Your 2-Minute BrainSnack</h1>
            <p className="text-primary-100">Ready to learn something new today, {firstName}?</p>
          </div>
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-700 font-medium rounded-lg hover:bg-primary-50 transition-colors"
          >
            Start Learning
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>

        {isGuest && (
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-white/10 p-4">
            <p className="text-sm text-primary-50 flex-1">
              You&apos;re browsing as a guest. Everything works — create a free account to keep
              your progress permanently.
            </p>
            <Link href="/register" className="shrink-0">
              <Button size="sm" className="bg-white text-primary-700 hover:bg-primary-50">
                Create account
              </Button>
            </Link>
          </div>
        )}
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}

      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse"
              />
            ))}
          </div>
          <SkeletonList rows={3} />
        </div>
      )}

      {progress && (
        <>
          <QuickStats
            totalXP={progress.totalXP}
            level={progress.level}
            streak={progress.currentStreak}
            personalBest={progress.personalBest}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              <DailyChallenge />
              <TopicMasteryList mastery={progress.topicProgress} />
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <XPDisplay xp={progress.totalXP} />
              <StreakDisplay streak={progress.currentStreak} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {progress.recentActivity.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                      No activity yet. Finish a quiz to see it here.
                    </p>
                  ) : (
                    progress.recentActivity.slice(0, 6).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {activity.reason}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatRelativeTime(activity.createdAt)}
                          </p>
                        </div>
                        {activity.amount !== 0 && (
                          <span className="text-sm font-medium text-accent-600 dark:text-accent-400 shrink-0">
                            {activity.amount > 0 ? "+" : ""}
                            {activity.amount} XP
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Quizzes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {progress.recentQuizzes.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                      No quizzes taken yet.
                    </p>
                  ) : (
                    progress.recentQuizzes.slice(0, 5).map((quiz) => (
                      <div
                        key={quiz.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {quiz.topicName ?? "Mixed quiz"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {quiz.status === "completed" ? "Completed" : quiz.status} ·{" "}
                            {formatXP(quiz.xpEarned)} XP
                          </p>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                          {quiz.score}%
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}