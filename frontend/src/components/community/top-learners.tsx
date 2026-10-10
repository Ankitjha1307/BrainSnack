"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SkeletonList } from "@/components/ui/state";
import { useResource } from "@/hooks/useResource";
import { leaderboardApi } from "@/lib/api";
import { formatXP } from "@/lib/utils";

/** Compact all-time leaderboard teaser for the community right rail. */
export function TopLearners() {
  const { data, isLoading } = useResource(
    () => leaderboardApi.get({ type: "alltime" }),
    []
  );

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Top learners</h2>
          <Link
            href="/leaderboard"
            className="text-xs font-semibold text-primary-700 hover:underline"
          >
            See all
          </Link>
        </div>

        {isLoading ? (
          <SkeletonList rows={3} />
        ) : (
          <ol className="space-y-2">
            {(data?.entries ?? []).slice(0, 5).map((entry) => (
              <li key={entry.user.id} className="flex items-center gap-3">
                <span className="w-4 shrink-0 text-sm font-bold text-muted">
                  {entry.rank}
                </span>
                <Link
                  href={`/u/${entry.user.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2.5"
                >
                  <Avatar
                    src={entry.user.avatarUrl ?? undefined}
                    alt={entry.user.username}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {entry.user.displayName || entry.user.username}
                    </p>
                    <p className="truncate text-xs text-muted">Lv {entry.user.level}</p>
                  </div>
                </Link>
                <span className="shrink-0 text-sm font-semibold text-primary-700">
                  {formatXP(entry.xp)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
