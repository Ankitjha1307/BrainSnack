"use client";

import React from "react";
import type { LeaderboardEntry } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="bg-secondary-background dark:bg-foreground rounded-xl border border-surface-muted dark:border-foreground overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-muted dark:border-foreground bg-surface-muted dark:bg-foreground/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-muted0 dark:text-muted uppercase tracking-wider">
                Rank
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-muted0 dark:text-muted uppercase tracking-wider">
                User
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-surface-muted0 dark:text-muted uppercase tracking-wider">
                XP
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-surface-muted0 dark:text-muted uppercase tracking-wider hidden sm:table-cell">
                Streak
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-surface-muted0 dark:text-muted uppercase tracking-wider hidden sm:table-cell">
                Level
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-muted dark:divide-foreground">
            {entries.map((entry) => (
              <tr
                key={entry.user.id}
                className={cn(
                  "transition-colors",
                  entry.user.id === currentUserId
                    ? "bg-primary-50 dark:bg-primary-900/20"
                    : "hover:bg-surface-muted dark:hover:bg-foreground/50"
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold",
                        entry.rank === 1 && "bg-warning text-foreground dark:bg-warning/30 dark:text-foreground",
                        entry.rank === 2 && "bg-surface-muted text-foreground dark:bg-muted dark:text-muted",
                        entry.rank === 3 && "bg-primary-500 text-primary-500 dark:bg-primary-500/30 dark:text-primary-500",
                        entry.rank > 3 && "text-surface-muted0 dark:text-muted"
                      )}
                    >
                      {entry.rank}
                    </span>
                    {entry.rank <= 3 && (
                      <span className="text-lg">
                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={entry.user.avatarUrl ?? undefined} alt={entry.user.username} size="sm" />
                    <div>
                      <p className="font-medium text-foreground dark:text-secondary-background text-sm">
                        {entry.user.username}
                        {entry.user.id === currentUserId && (
                          <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-surface-muted0 dark:text-muted">
                        Level {entry.user.level}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-foreground dark:text-secondary-background">
                    {entry.xp.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-accent-500">🔥</span>
                    <span className="text-sm text-muted dark:text-muted">{entry.streak}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className="text-sm text-muted dark:text-muted">
                    Lvl {entry.level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
