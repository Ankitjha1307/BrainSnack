"use client";

import React from "react";
import type { Question } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_LABELS } from "@/lib/constants";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  /** Correct option id, once the server has graded this question. */
  correctOptionId?: string;
  selectedOptionId?: string | null;
  reveal?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  correctOptionId,
  selectedOptionId,
  reveal = false,
}: QuestionCardProps) {
  return (
    <Card padding="none" className="animate-fade-in">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          {question.concept ? (
            <Badge variant="info">{question.concept}</Badge>
          ) : (
            <span />
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {questionNumber} of {totalQuestions}
          </span>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
          {question.text}
        </h2>

        {reveal && correctOptionId !== undefined && (
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            {selectedOptionId === correctOptionId
              ? "You picked the right answer."
              : `The right answer was option ${String.fromCharCode(65 + Number(correctOptionId))}.`}
          </p>
        )}

        {!reveal && (
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            Difficulty: {DIFFICULTY_LABELS[question.difficulty] ?? question.difficulty}
          </p>
        )}
      </CardContent>
    </Card>
  );
}