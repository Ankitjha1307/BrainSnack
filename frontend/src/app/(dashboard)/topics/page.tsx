"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { topicsApi } from "@/lib/api";
import { useResource } from "@/hooks/useResource";
import { ErrorState, SkeletonList } from "@/components/ui/state";
import { DIFFICULTY_LABELS } from "@/lib/constants";

export default function TopicsPage() {
  const {
    data: topics,
    isLoading,
    error,
    reload,
  } = useResource(() => topicsApi.list(), []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Topics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Choose a topic to start learning
        </p>
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}

      {isLoading && <SkeletonList rows={6} />}

      {topics && topics.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No topics have been created yet. Run <code>backend/src/db/seed.sql</code> to load them.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {topics?.map((topic) => (
          <Link key={topic.id} href={`/topics/${topic.id}`} className="group">
            <Card hover className="h-full">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: `${topic.color}1f` }}
                  >
                    <span aria-hidden>{topic.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {topic.questionCount} questions
                    </p>
                  </div>
                </div>

                {topic.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {topic.description}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Mastery</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {topic.mastery === null ? "Not started" : `${topic.mastery}%`}
                    </span>
                  </div>
                  {/* A never-attempted topic has no mastery to show yet. */}
                  <Progress value={topic.mastery ?? 0} size="sm" />
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
                  {topic.difficultyLevel && (
                    <Badge variant="default" size="sm">
                      {DIFFICULTY_LABELS[topic.difficultyLevel] ?? topic.difficultyLevel}
                    </Badge>
                  )}
                  {topic.concepts.slice(0, 2).map((concept) => (
                    <Badge key={concept.id} variant="default" size="sm">
                      {concept.name}
                    </Badge>
                  ))}
                  {topic.concepts.length > 2 && (
                    <Badge variant="default" size="sm">
                      +{topic.concepts.length - 2}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}