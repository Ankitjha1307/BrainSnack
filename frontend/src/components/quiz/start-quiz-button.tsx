"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { quizzesApi } from "@/lib/api";
import type { Difficulty } from "@/types";

interface StartQuizButtonProps {
  /** Topic UUID. Omit to let the adaptive engine pick a mixed quiz. */
  topicId?: string;
  difficulty?: Difficulty;
  questionCount?: number;
  label?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Generates a quiz and navigates to the player.
 *
 * Generation is server-side and persisted, so this is a real POST followed by a
 * real route change - not a link to a hardcoded JavaScript quiz that looks the
 * same for every topic.
 */
export function StartQuizButton({
  topicId,
  difficulty,
  questionCount,
  label = "Start quiz",
  variant = "primary",
  size = "md",
  className,
}: StartQuizButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const quiz = await quizzesApi.generate({ topicId, difficulty, questionCount });
      router.push(`/quiz/${quiz.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button onClick={start} variant={variant} size={size} isLoading={isLoading} className="w-full">
        {label}
      </Button>
      {error && <p className="mt-2 text-xs text-foreground dark:text-foreground">{error}</p>}
    </div>
  );
}