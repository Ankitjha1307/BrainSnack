"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatXP, getLevelFromXP, getLevelProgress } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface XPDisplayProps {
  xp: number;
}

export function XPDisplay({ xp }: XPDisplayProps) {
  const level = getLevelFromXP(xp);
  const progress = getLevelProgress(xp);

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-surface-muted0 dark:text-muted">Level {level}</span>
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{formatXP(xp)} XP</span>
        </div>
        <Progress value={progress} size="md" />
        <p className="text-xs text-muted dark:text-surface-muted0 mt-2 text-center">
          {1000 - (xp % 1000)} XP to Level {level + 1}
        </p>
      </CardContent>
    </Card>
  );
}
