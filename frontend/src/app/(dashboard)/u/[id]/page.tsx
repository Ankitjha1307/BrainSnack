"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { User, UserSearchResult } from "@/types";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/ui/state";
import { usersApi } from "@/lib/api";
import { useResource } from "@/hooks/useResource";
import { useAuth } from "@/context/AuthContext";

interface UserStats {
  quizzesCompleted: number;
  questionsAnswered: number;
  questionsCorrect: number;
  accuracy: number;
  followers: number;
  following: number;
}

/** Compact link rows for the follower/following panels. */
function MiniUserList({ users }: { users: UserSearchResult[] }) {
  if (users.length === 0) {
    return <p className="text-sm text-muted">Nothing here yet.</p>;
  }
  return (
    <ul className="space-y-2">
      {users.map((user) => (
        <li key={user.id}>
          <Link href={`/u/${user.id}`} className="flex min-w-0 items-center gap-3 rounded-lg p-1.5 hover:bg-surface-muted transition-colors">
            <Avatar src={user.avatarUrl ?? undefined} alt={user.username} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.displayName || user.username}
              </p>
              <p className="truncate text-xs text-muted">
                @{user.username} · Lv {user.level}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { user: me } = useAuth();

  const {
    data: profile,
    isLoading,
    error,
    reload,
  } = useResource<User>(() => usersApi.get(id), [id]);
  const { data: stats } = useResource<UserStats>(() => usersApi.stats(id), [id]);
  const { data: followers } = useResource<UserSearchResult[]>(
    () => usersApi.followers(id),
    [id]
  );
  const { data: following } = useResource<UserSearchResult[]>(
    () => usersApi.following(id),
    [id]
  );

  const [isFollowing, setIsFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  // `is_following` is only present on GET /users/:id; sync it once loaded.
  useEffect(() => {
    if (profile?.isFollowing !== undefined) setIsFollowing(profile.isFollowing);
  }, [profile?.isFollowing]);

  if (isLoading) return <LoadingState label="Loading profile…" />;
  if (error || !profile) {
    return <ErrorState message={error ?? "User not found"} onRetry={reload} />;
  }

  const isMe = profile.isMe ?? me?.id === profile.id;
  const canFollow = !isMe;

  const toggleFollow = async () => {
    if (!canFollow) return;
    setBusy(true);
    try {
      const next = isFollowing
        ? await usersApi.unfollow(profile.id)
        : await usersApi.follow(profile.id);
      setIsFollowing(next);
    } catch {
      // Keep the previous state; the learner can retry.
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProfileHeader
        user={profile}
        actions={
          canFollow ? (
            <Button
              variant={isFollowing ? "outline" : "primary"}
              onClick={toggleFollow}
              isLoading={busy}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          ) : undefined
        }
      />

      {stats && (
        <ProfileStats
          totalXP={profile.xp}
          level={profile.level}
          streak={profile.streak}
          personalBest={profile.personalBest}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {stats?.followers ?? 0}
            </p>
            <p className="text-xs text-muted uppercase tracking-wide">
              Followers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {stats?.following ?? 0}
            </p>
            <p className="text-xs text-muted uppercase tracking-wide">
              Following
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-5">
            <h2 className="mb-3 text-base font-semibold text-foreground">
              Followers
            </h2>
            <MiniUserList users={followers ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <h2 className="mb-3 text-base font-semibold text-foreground">
              Following
            </h2>
            <MiniUserList users={following ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}