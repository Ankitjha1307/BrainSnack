"use client";

import React, { useState } from "react";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardTabs } from "@/components/leaderboard/leaderboard-tabs";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, SkeletonList } from "@/components/ui/state";
import { leaderboardApi } from "@/lib/api";
import { useResource } from "@/hooks/useResource";
import { useAuth } from "@/context/AuthContext";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"daily" | "weekly" | "alltime">("alltime");

  const {
    data: board,
    isLoading,
    error,
    reload,
  } = useResource(() => leaderboardApi.get({ type: tab }), [tab]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted mt-1">
          See how you stack up against other learners
        </p>
      </div>

      <LeaderboardTabs activeTab={tab} onTabChange={setTab} />

      {error && <ErrorState message={error} onRetry={reload} />}

      {isLoading && <SkeletonList rows={4} />}

      {board && board.entries.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon="🏆"
              title="Nobody on this board yet"
              description="Finish a quiz to be the first on the board."
            />
          </CardContent>
        </Card>
      )}

      {board && board.entries.length > 0 && (
        <>
          <LeaderboardTable entries={board.entries} currentUserId={user?.id} />

          {board.myRank && (
            <Card className="border-border">
              <CardContent className="pt-5">
                <p className="text-sm text-muted mb-3">Your position</p>
                <LeaderboardTable entries={[board.myRank]} currentUserId={user?.id} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}