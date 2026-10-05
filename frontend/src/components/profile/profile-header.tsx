"use client";

import React from "react";
import type { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ProfileHeaderProps {
  user: User;
  isOwnProfile?: boolean;
  onEdit?: () => void;
}

export function ProfileHeader({ user, isOwnProfile, onEdit }: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar src={user.avatarUrl ?? undefined} alt={user.username} size="xl" />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.displayName || user.username}
              </h1>
              <Badge variant="accent">Level {user.level}</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">@{user.username}</p>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Joined {formatDate(user.joinedAt)}
              </span>
            </div>
          </div>
          {isOwnProfile && onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
