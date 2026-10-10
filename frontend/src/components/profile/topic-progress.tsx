"use client";

import React from "react";
import type { TopicMastery } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TopicProgressProps {
  topicMastery: TopicMastery[];
}

export function TopicProgress({ topicMastery }: TopicProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Topic Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topicMastery.map((tm) => (
          <div key={tm.topicId} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {tm.topicName}
                </span>
                <span className="text-xs text-muted capitalize">
                  {tm.difficultyLevel}
                </span>
              </div>
              <span className="text-sm font-medium text-muted">
                {tm.mastery}%
              </span>
            </div>
            <Progress value={tm.mastery} size="sm" />
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{tm.questionsAttempted} attempted</span>
              <span>
                {tm.questionsCorrect} correct ({tm.accuracy}%)
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
