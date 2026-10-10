"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { UserSearchResult } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/api";
import { useResource } from "@/hooks/useResource";

interface WhoToFollowProps {
  onFollowed?: (user: UserSearchResult) => void;
}

/**
 * Highest-XP learners the viewer is not following. This is the fuel for the
 * cold-start state: a brand-new account follows nobody, so instead of an empty
 * feed we offer people to follow.
 */
export function WhoToFollow({ onFollowed }: WhoToFollowProps) {
  const { data, isLoading, error, reload } = useResource<UserSearchResult[]>(
    () => usersApi.suggestions(),
    []
  );
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const follow = async (user: UserSearchResult) => {
    setBusy(user.id);
    try {
      await usersApi.follow(user.id);
      setFollowing((state) => ({ ...state, [user.id]: true }));
      onFollowed?.(user);
      // The suggestions endpoint excludes followees, so drop the now-followed
      // user from the list (kept in place rather than un-rendering instantly so
      // the button can show its "Following" confirmation).
      setTimeout(reload, 600);
    } catch {
      // Leave the button actionable so the learner can retry.
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-surface-muted dark:bg-foreground" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/3 rounded bg-surface-muted dark:bg-foreground" />
              <div className="h-3 w-1/4 rounded bg-surface-muted dark:bg-foreground" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-surface-muted0 dark:text-muted">{error}</p>;
  }

  const users = data ?? [];
  if (users.length === 0) {
    return (
      <p className="text-sm text-surface-muted0 dark:text-muted">
        You&apos;re following everyone already. Nice.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {users.map((user) => {
        const done = following[user.id];
        return (
          <li key={user.id} className="flex items-center gap-3">
            <Link href={`/u/${user.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar src={user.avatarUrl ?? undefined} alt={user.username} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground dark:text-secondary-background">
                  {user.displayName || user.username}
                </p>
                <p className="truncate text-xs text-surface-muted0 dark:text-muted">
                  @{user.username} · Lv {user.level}
                </p>
              </div>
            </Link>
            <Button
              size="sm"
              variant={done ? "ghost" : "primary"}
              disabled={done || busy === user.id}
              isLoading={busy === user.id}
              onClick={() => follow(user)}
            >
              {done ? "Following" : "Follow"}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
