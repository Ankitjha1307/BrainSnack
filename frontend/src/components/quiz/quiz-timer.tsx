"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface QuizTimerProps {
  timeRemaining: number;
  totalTime: number;
}

export function QuizTimer({ timeRemaining, totalTime }: QuizTimerProps) {
  const percentage = (timeRemaining / totalTime) * 100;
  const isLow = timeRemaining <= 5;
  const isCritical = timeRemaining <= 3;

  const getColor = () => {
    if (isCritical) return "text-foreground";
    if (isLow) return "text-accent-500";
    return "text-primary-500";
  };

  const getStrokeColor = () => {
    if (isCritical) return "stroke-error";
    if (isLow) return "stroke-accent-500";
    return "stroke-primary-500";
  };

  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-12 w-12">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn("transition-all duration-1000 ease-linear", getStrokeColor())}
          />
        </svg>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center text-sm font-bold",
            getColor()
          )}
        >
          {timeRemaining}
        </span>
      </div>
    </div>
  );
}
