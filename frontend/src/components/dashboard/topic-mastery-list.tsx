"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/state";
import type { TopicMastery } from "@/types";

interface TopicMasteryListProps {
  mastery: TopicMastery[];
}

/** Shows the topics the learner has actually attempted, strongest first. */
export function TopicMasteryList({ mastery }: TopicMasteryListProps) {
  const sorted = [...mastery].sort((a, b) => b.mastery - a.mastery).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Topic Mastery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No topics attempted yet"
            description="Pick a topic and finish a quiz - your mastery shows up here."
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
          sorted.map((topic) => (
            <Link
              key={topic.topicId}
              href={`/topics/${topic.topicId}`}
              className="block space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span aria-hidden>{topic.topicIcon}</span>
                  <span className="text-sm font-medium text-foreground dark:text-muted truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {topic.topicName}
                  </span>
                </div>
                <span className="text-sm font-medium text-surface-muted0 dark:text-muted shrink-0 ml-2">
                  {topic.mastery}%
                </span>
              </div>
              <Progress value={topic.mastery} size="sm" />
              <p className="text-xs text-muted dark:text-surface-muted0">
                {topic.questionsCorrect}/{topic.questionsAttempted} correct
              </p>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}