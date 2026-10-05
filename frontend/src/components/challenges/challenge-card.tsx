"use client";

import React from "react";
import type { Challenge } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

interface ChallengeCardProps {
  challenge: Challenge;
  onAccept?: (id: string) => void;
  onComplete?: (id: string) => void;
  currentUserId?: string;
}

const STATUS_STYLES: Record<Challenge["status"], { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  },
  accepted: {
    label: "In progress",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  declined: {
    label: "Declined",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400",
  },
};

export function ChallengeCard({
  challenge,
  onAccept,
  onComplete,
  currentUserId,
}: ChallengeCardProps) {
  const status = STATUS_STYLES[challenge.status] ?? STATUS_STYLES.pending;

  const viewerIsChallenger =
    challenge.viewerRole ??
    (currentUserId ? (challenge.challenger.id === currentUserId ? "challenger" : "challengee") : null);

  const winner =
    challenge.status === "completed" && challenge.winnerId
      ? challenge.challenger.id === challenge.winnerId
        ? challenge.challenger
        : challenge.challengee
      : null;

  const targetReached = challenge.challenger.score !== null && challenge.challenger.score >= challenge.targetScore;
  const challengeeReached =
    challenge.challengee.score !== null && challenge.challengee.score >= challenge.targetScore;

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              src={challenge.challenger.avatarUrl ?? undefined}
              alt={challenge.challenger.username}
              size="md"
            />
            <div className="min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {challenge.challenger.displayName || challenge.challenger.username}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{challenge.topicName}</p>
            </div>
          </div>
          <span
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span>Target: {challenge.targetScore} correct</span>
          <span>Started {formatDate(challenge.createdAt)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[challenge.challenger, challenge.challengee].map((participant, index) => {
            const reached =
              index === 0 ? targetReached : challengeeReached;
            return (
              <div
                key={participant.id}
                className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg min-w-0"
              >
                <Avatar
                  src={participant.avatarUrl ?? undefined}
                  alt={participant.username}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {participant.username}
                    {participant.id === challenge.challenger.id && (
                      <span className="ml-1 text-xs text-gray-400 font-normal">challenger</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {participant.score === null ? (
                      "No score yet"
                    ) : (
                      <>
                        {participant.score} correct
                        {reached && (
                          <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            ✓
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {challenge.status === "pending" && viewerIsChallenger === "challengee" && onAccept && (
          <Button onClick={() => onAccept(challenge.id)} className="w-full" size="sm">
            Accept challenge
          </Button>
        )}

        {challenge.status === "accepted" && !challenge.viewerHasSubmitted && onComplete && (
          <Button onClick={() => onComplete(challenge.id)} className="w-full" size="sm">
            {viewerIsChallenger === "challenger" ? "Complete challenge" : "Take the challenge"}
          </Button>
        )}

        {challenge.status === "accepted" && challenge.viewerHasSubmitted && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Waiting for the other player to finish
          </p>
        )}

        {challenge.status === "completed" && winner && (
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Winner:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {winner.displayName || winner.username}
              </span>
            </p>
            {challenge.completedAt && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Finished {formatDate(challenge.completedAt)}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}