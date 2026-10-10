"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StreakDisplayProps {
  streak: number;
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
            <svg className="h-6 w-6 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground dark:text-secondary-background">{streak}</p>
            <p className="text-sm text-surface-muted0 dark:text-muted">Day Streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
