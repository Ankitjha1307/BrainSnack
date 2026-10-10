"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground dark:text-muted">
          Question {current} of {total}
        </span>
        <span className="text-surface-muted0 dark:text-muted">
          {Math.round(percentage)}%
        </span>
      </div>
      <Progress value={percentage} size="md" />
    </div>
  );
}
