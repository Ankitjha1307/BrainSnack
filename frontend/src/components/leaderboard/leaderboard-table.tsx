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
    <div className="bg-secondary-background rounded-xl border border-surface-muted overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-muted bg-surface-muted">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                Rank
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                User
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                XP
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider hidden sm:table-cell">
                Streak
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider hidden sm:table-cell">
                Level
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-muted">
            {entries.map((entry) => (
              <tr
                key={entry.user.id}
                className={cn(
                  "transition-colors",
                  entry.user.id === currentUserId
                    ? "bg-primary-50"
                    : "hover:bg-surface-muted"
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold",
                        entry.rank === 1 && "bg-warning text-foreground",
                        entry.rank === 2 && "bg-surface-muted text-foreground",
                        entry.rank === 3 && "bg-primary-500 text-main-foreground",
                        entry.rank > 3 && "text-muted"
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
                      <p className="font-medium text-foreground text-sm">
                        {entry.user.username}
                        {entry.user.id === currentUserId && (
                          <span className="ml-2 text-xs text-primary-600">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted">
                        Level {entry.user.level}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-foreground">
                    {entry.xp.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-accent-500">🔥</span>
                    <span className="text-sm text-muted">{entry.streak}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className="text-sm text-muted">
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
