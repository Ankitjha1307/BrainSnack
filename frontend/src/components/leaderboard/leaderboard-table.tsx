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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                XP
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Streak
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Level
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {entries.map((entry) => (
              <tr
                key={entry.user.id}
                className={cn(
                  "transition-colors",
                  entry.user.id === currentUserId
                    ? "bg-primary-50 dark:bg-primary-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold",
                        entry.rank === 1 && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
                        entry.rank === 2 && "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300",
                        entry.rank === 3 && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
                        entry.rank > 3 && "text-gray-500 dark:text-gray-400"
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
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {entry.user.username}
                        {entry.user.id === currentUserId && (
                          <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Level {entry.user.level}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {entry.xp.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-accent-500">🔥</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{entry.streak}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
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
