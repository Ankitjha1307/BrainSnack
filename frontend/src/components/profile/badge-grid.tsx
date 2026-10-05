"use client";

import React from "react";
import type { Badge } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatDate } from "@/lib/utils";

interface BadgeGridProps {
  badges: Badge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  const earned = badges.filter((b) => b.earnedAt);
  const locked = badges.filter((b) => !b.earnedAt);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Badges
          {earned.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              {earned.length}/{badges.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {badges.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No badges available yet.
          </p>
        ) : (
          <>
            {earned.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {earned.map((badge) => (
                  <div
                    key={badge.id}
                    title={`${badge.name} — earned ${formatDate(badge.earnedAt!)}`}
                    className="flex flex-col items-center p-3 rounded-lg text-center bg-gray-50 dark:bg-gray-700/50"
                  >
                    <span className="text-2xl mb-1" aria-hidden>
                      {badge.icon}
                    </span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">
                      {badge.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {locked.length > 0 && (
              <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Still to earn
                </p>
                {locked.map((badge) => {
                  const progress = Math.min(100, Math.round(badge.progress ?? 0));
                  return (
                    <div key={badge.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn("text-lg", "opacity-40")} aria-hidden>
                            {badge.icon}
                          </span>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                            {badge.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                          {badge.current ?? 0}/{badge.criteriaValue}
                        </span>
                      </div>
                      <Progress value={progress} size="sm" />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}