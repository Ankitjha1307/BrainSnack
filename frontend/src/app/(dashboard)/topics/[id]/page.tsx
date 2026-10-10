"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { topicsApi, progressApi } from "@/lib/api";
import { useResource } from "@/hooks/useResource";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ErrorState, LoadingState } from "@/components/ui/state";
import { StartQuizButton } from "@/components/quiz/start-quiz-button";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import type { Difficulty } from "@/types";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const COUNTS = [5, 10, 15];

export default function TopicDetailPage() {
  const params = useParams<{ id: string }>();
  const topicId = params?.id as string | undefined;

  const { data: topic, error, isLoading, reload } = useResource(
    () => topicsApi.get(topicId!),
    [topicId]
  );

  const { data: mastery } = useResource(
    () => progressApi.get(),
    [topicId]
  );

  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(undefined);
  const [questionCount, setQuestionCount] = useState<number | undefined>(undefined);

  if (isLoading) return <LoadingState label="Loading topic…" />;
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorState message={error} onRetry={reload} />
        <div className="mt-4 text-center">
          <Link href="/topics" className="text-sm text-primary-600 hover:underline">
            Back to topics
          </Link>
        </div>
      </div>
    );
  }
  if (!topic) return null;

  const topicProgress = mastery?.topicProgress.find((m) => m.topicId === topic.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/topics" className="text-sm text-muted hover:underline">
        ← All topics
      </Link>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ backgroundColor: `${topic.color}1f` }}
            >
              <span aria-hidden>{topic.icon}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground">{topic.name}</h1>
              {topic.description && (
                <p className="text-muted mt-1">{topic.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="default" size="sm">
                  {topic.questionCount} questions in bank
                </Badge>
                {topic.difficultyLevel && (
                  <Badge variant="default" size="sm">
                    {DIFFICULTY_LABELS[topic.difficultyLevel] ?? topic.difficultyLevel}
                  </Badge>
                )}
                <Badge variant="default" size="sm">
                  {topic.conceptCount} concepts
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {topicProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Mastery</span>
              <span className="font-medium text-foreground">
                {topicProgress.mastery}%
              </span>
            </div>
            <Progress value={topicProgress.mastery} />
            <div className="grid grid-cols-3 gap-4 text-center pt-1">
              <div>
                <p className="text-lg font-bold text-foreground">
                  {topicProgress.questionsAttempted}
                </p>
                <p className="text-xs text-muted">Attempted</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {topicProgress.questionsCorrect}
                </p>
                <p className="text-xs text-muted">Correct</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {topicProgress.accuracy}%
                </p>
                <p className="text-xs text-muted">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Start a quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Difficulty
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={difficulty === undefined ? "primary" : "outline"}
                size="sm"
                onClick={() => setDifficulty(undefined)}
              >
                Adaptive
              </Button>
              {DIFFICULTIES.map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={difficulty === level ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setDifficulty(level)}
                >
                  {DIFFICULTY_LABELS[level]}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Questions
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={questionCount === undefined ? "primary" : "outline"}
                size="sm"
                onClick={() => setQuestionCount(undefined)}
              >
                Default
              </Button>
              {COUNTS.map((count) => (
                <Button
                  key={count}
                  type="button"
                  variant={questionCount === count ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setQuestionCount(count)}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          <StartQuizButton
            topicId={topic.id}
            difficulty={difficulty}
            questionCount={questionCount}
            label="Start quiz"
            size="lg"
          />

          {topic.questionCount === 0 && (
            <p className="text-sm text-foreground">
              This topic has no questions in the bank yet, so a quiz cannot be generated.
            </p>
          )}
        </CardContent>
      </Card>

      {topic.concepts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Concepts covered</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {topic.concepts.map((concept) => (
              <Badge key={concept.id} variant="default">
                {concept.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <StartQuizButton
          topicId={topic.id}
          label="Mixed quiz across all topics"
          variant="outline"
        />
      </div>
    </div>
  );
}