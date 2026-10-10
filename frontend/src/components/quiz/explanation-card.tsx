"use client";

import React from "react";
import type { AnswerOption, Question } from "@/types";
import { AnswerOptionRow } from "./answer-option";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ExplanationCardProps {
  question: Question;
  selectedOptionId: string;
  correctOptionId: string;
  explanation: string | null;
  onNext: () => void;
  isLast: boolean;
  isSubmitting?: boolean;
}

/**
 * Post-answer review. The correct option and the explanation both come from the
 * server's grading response, so this screen can only show what the backend is
 * willing to reveal.
 */
export function ExplanationCard({
  question,
  selectedOptionId,
  correctOptionId,
  explanation,
  onNext,
  isLast,
  isSubmitting = false,
}: ExplanationCardProps) {
  const isCorrect = selectedOptionId === correctOptionId;

  const stateFor = (option: AnswerOption) => {
    if (option.id === correctOptionId) return "correct" as const;
    if (option.id === selectedOptionId) return "incorrect" as const;
    return "disabled" as const;
  };

  return (
    <Card padding="none" className="animate-slide-up">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
              isCorrect ? "bg-success" : "bg-error"
            )}
          >
            {isCorrect ? (
              <svg
                className="h-5 w-5 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {isCorrect ? "Correct!" : "Not quite"}
            </h3>
            <p className="text-sm text-muted">
              {isCorrect ? "Nice work." : "Here's why:"}
            </p>
          </div>
        </div>

        <p className="text-sm font-medium text-foreground mb-3">
          {question.text}
        </p>

        <div className="space-y-2 mb-4">
          {question.options.map((option, index) => (
            <AnswerOptionRow
              key={option.id}
              id={option.id}
              text={option.text}
              index={index}
              state={stateFor(option)}
              onClick={() => {}}
            />
          ))}
        </div>

        {explanation && (
          <div className="bg-surface-muted rounded-lg p-4 mb-4">
            <p className="text-foreground text-sm leading-relaxed">
              {explanation}
            </p>
          </div>
        )}

        <Button onClick={onNext} className="w-full" isLoading={isSubmitting}>
          {isLast ? "See results" : "Next question"}
        </Button>
      </CardContent>
    </Card>
  );
}

/** Shown when the clock hits zero before the learner chose anything. */
export function TimeUpCard({ onNext, isLast }: { onNext: () => void; isLast: boolean }) {
  return (
    <Card padding="none" className="animate-slide-up">
      <CardContent className="pt-6 text-center">
        <div className="h-10 w-10 rounded-full bg-warning mx-auto mb-3 flex items-center justify-center">
          <svg
            className="h-5 w-5 text-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-foreground">Time&apos;s up</h3>
        <p className="text-sm text-muted mt-1">
          No answer was recorded for this question.
        </p>
        <Button onClick={onNext} className="w-full mt-4">
          {isLast ? "See results" : "Next question"}
        </Button>
      </CardContent>
    </Card>
  );
}