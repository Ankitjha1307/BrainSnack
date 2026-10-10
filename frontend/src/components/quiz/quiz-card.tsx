"use client";

import React from "react";
import type { Quiz } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import { ErrorNotice } from "@/components/ui/state";

interface QuizCardProps {
  quiz: Quiz;
  onStart: () => void;
  onExit?: () => void;
  isStarting?: boolean;
  error?: string | null;
  /** Number of questions already answered, when resuming. */
  answeredCount?: number;
}

/** Pre-flight screen: what you are about to attempt and what it pays. */
export function QuizCard({
  quiz,
  onStart,
  onExit,
  isStarting = false,
  error,
  answeredCount = 0,
}: QuizCardProps) {
  const resuming = answeredCount > 0;

  return (
    <Card padding="none" className="max-w-lg mx-auto overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-700" />
      <CardHeader className="pt-6 mb-0">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="accent">{quiz.topicName}</Badge>
          <div className="flex items-center gap-2">
            <Badge>{DIFFICULTY_LABELS[quiz.difficulty] ?? quiz.difficulty}</Badge>
            {quiz.source && (
              <Badge variant={quiz.source === "ai" ? "info" : "default"}>
                {quiz.source === "ai" ? "AI" : "Local bank"}
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-2xl mt-3">
          {resuming ? "Pick up where you left off" : "Ready to snack?"}
        </CardTitle>
        <p className="text-muted text-sm mt-1">
          {resuming
            ? `${answeredCount} of ${quiz.questions.length} answered`
            : `${quiz.questions.length} questions · about ${Math.ceil(
                (quiz.questions.length * quiz.timePerQuestion) / 60
              )} min`}
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {error && <ErrorNotice message={error} />}

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-surface-muted rounded-lg">
            <p className="text-2xl font-bold text-primary-600">
              {quiz.questions.length}
            </p>
            <p className="text-xs text-muted">Questions</p>
          </div>
          <div className="text-center p-3 bg-surface-muted rounded-lg">
            <p className="text-2xl font-bold text-accent-600">
              {quiz.totalXP}
            </p>
            <p className="text-xs text-muted">Max XP</p>
          </div>
          <div className="text-center p-3 bg-surface-muted rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              {quiz.timePerQuestion}s
            </p>
            <p className="text-xs text-muted">Per question</p>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <Button onClick={onStart} className="w-full" size="lg" isLoading={isStarting}>
            {resuming ? "Resume quiz" : "Start quiz"}
          </Button>
          {onExit && (
            <Button variant="ghost" onClick={onExit} className="w-full">
              Finish and see results
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}