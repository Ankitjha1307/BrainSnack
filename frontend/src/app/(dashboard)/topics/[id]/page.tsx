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
          <Link href="/topics" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
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
      <Link href="/topics" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{topic.name}</h1>
              {topic.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{topic.description}</p>
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
              <span className="text-gray-500 dark:text-gray-400">Mastery</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {topicProgress.mastery}%
              </span>
            </div>
            <Progress value={topicProgress.mastery} />
            <div className="grid grid-cols-3 gap-4 text-center pt-1">
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {topicProgress.questionsAttempted}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Attempted</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {topicProgress.questionsCorrect}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Correct</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {topicProgress.accuracy}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
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
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDifficulty(undefined)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  difficulty === undefined
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                Adaptive
              </button>
              {DIFFICULTIES.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    difficulty === level
                      ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  {DIFFICULTY_LABELS[level]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Questions
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setQuestionCount(undefined)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  questionCount === undefined
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                Default
              </button>
              {COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    questionCount === count
                      ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  {count}
                </button>
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
            <p className="text-sm text-amber-600 dark:text-amber-400">
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