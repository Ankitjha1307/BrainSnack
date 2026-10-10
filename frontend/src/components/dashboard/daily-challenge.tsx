"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StartQuizButton } from "@/components/quiz/start-quiz-button";
import { useResource } from "@/hooks/useResource";
import { quizzesApi } from "@/lib/api";
import type { QuizHistoryEntry } from "@/types";

/**
 * The daily challenge is a real 5-question generated quiz, not a hardcoded
 * JavaScript one - a learner on the Python topic should not be told to study
 * JavaScript. Today/done state comes from the learner's own quiz history.
 */
export function DailyChallenge() {
  const { data: history } = useResource<QuizHistoryEntry[]>(
    () => quizzesApi.history(),
    []
  );

  const today = new Date().toISOString().slice(0, 10);
  const completedToday = (history ?? []).some(
    (entry) =>
      entry.status === "completed" &&
      entry.completedAt !== null &&
      new Date(entry.completedAt).toISOString().slice(0, 10) === today
  );

  return (
    <Card className="overflow-hidden border-2 border-border">
      <div className="h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700" />
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div>
            <Badge variant="accent" size="sm">
              Daily Challenge
            </Badge>
            <h3 className="text-lg font-bold text-foreground mt-2">
              Mixed 5-question sprint
            </h3>
            <p className="text-sm text-muted">
              Drawn from every topic you can access
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-2xl">⚡</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm text-muted">
          <span className="flex items-center gap-1">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            5 min
          </span>
          <span className="flex items-center gap-1">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Up to 50 XP
          </span>
        </div>

        {completedToday ? (
          <div className="text-center py-2">
            <p className="text-sm font-medium text-foreground">
              ✓ Challenge complete for today
            </p>
            <p className="text-xs text-muted mt-1">
              Come back tomorrow for a new one.
            </p>
          </div>
        ) : (
          <StartQuizButton
            questionCount={5}
            label="Start Challenge"
            className="w-full"
          />
        )}
      </CardContent>
    </Card>
  );
}