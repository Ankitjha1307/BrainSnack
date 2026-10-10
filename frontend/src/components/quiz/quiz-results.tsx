"use client";

import React from "react";
import type { QuizResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, scoreColor } from "@/lib/utils";
import { milestonesFromQuizResult, type Milestone } from "@/lib/milestones";

interface QuizResultsProps {
  result: QuizResult;
  topicName: string;
  onRetake: () => void;
  onBack: () => void;
  /** When provided, shows a "share your win" button for any milestone hit. */
  onShare?: (milestone: Milestone) => void;
}

const gradeFor = (score: number) => {
  if (score === 100) return { label: "Flawless!", tone: "text-foreground" };
  if (score >= 80) return { label: "Great work!", tone: "text-primary-600" };
  if (score >= 60) return { label: "Good effort!", tone: "text-foreground" };
  return { label: "Keep going!", tone: "text-rose-600" };
};

export function QuizResults({ result, topicName, onRetake, onBack, onShare }: QuizResultsProps) {
  const grade = gradeFor(result.score);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const milestone = milestonesFromQuizResult(result)[0] ?? null;

  return (
    <Card padding="none" className="max-w-lg mx-auto animate-fade-in">
      <CardHeader className="pt-6 text-center mb-0">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-secondary-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <CardTitle className="text-2xl">{topicName} complete</CardTitle>
        <p className={cn("text-lg font-medium", grade.tone)}>{grade.label}</p>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="flex justify-center">
          <div className="relative h-32 w-32">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - result.score / 100)}
                className={cn("stroke-primary-500 transition-all duration-1000 ease-out", scoreColor(result.score))}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">
                {result.score}%
              </span>
              <span className="text-sm text-muted">
                {result.correctAnswers}/{result.totalQuestions}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-100 rounded-full">
            <svg className="h-5 w-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-bold text-accent-700">
              +{result.xpEarned} XP
            </span>
          </div>
          {result.perfectBonus > 0 && (
            <p className="text-xs text-foreground mt-2">
              Includes a +{result.perfectBonus} XP perfect-score bonus
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-surface-muted rounded-lg">
            <p className="text-lg font-bold text-foreground">
              {result.correctAnswers}
            </p>
            <p className="text-xs text-muted">Correct</p>
          </div>
          <div className="text-center p-3 bg-surface-muted rounded-lg">
            <p className="text-lg font-bold text-rose-600">
              {result.totalQuestions - result.correctAnswers}
            </p>
            <p className="text-xs text-muted">Missed</p>
          </div>
          <div className="text-center p-3 bg-surface-muted rounded-lg">
            <p className="text-lg font-bold text-foreground">
              {result.personalBest}%
            </p>
            <p className="text-xs text-muted">Personal best</p>
          </div>
        </div>

        {result.streak && result.streak.current > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <span aria-hidden>🔥</span>
            <span className="text-foreground">
              {result.streak.current}-day streak
            </span>
            {result.streak.current === result.streak.longest && (
              <Badge variant="accent" size="sm">
                personal best
              </Badge>
            )}
          </div>
        )}

        {result.newBadges.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground text-center">
              New badge{result.newBadges.length > 1 ? "s" : ""} unlocked
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {result.newBadges.map((badge) => (
                <Badge key={badge.id} variant="success" size="lg">
                  {badge.icon} {badge.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {onShare && milestone && (
          <Button variant="secondary" className="w-full" onClick={() => onShare(milestone)}>
            🎉 Share your win
          </Button>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back to topics
          </Button>
          <Button onClick={onRetake} className="flex-1">
            Another round
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}