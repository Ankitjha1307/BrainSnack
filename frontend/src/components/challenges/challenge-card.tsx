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
    className: "bg-warning/15 text-foreground",
  },
  accepted: {
    label: "In progress",
    className: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200",
  },
  completed: {
    label: "Completed",
    className: "bg-success/15 text-foreground",
  },
  declined: {
    label: "Declined",
    className: "bg-surface-muted text-muted",
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
              <p className="font-medium text-foreground dark:text-secondary-background truncate">
                {challenge.challenger.displayName || challenge.challenger.username}
              </p>
              <p className="text-sm text-surface-muted0 dark:text-muted truncate">{challenge.topicName}</p>
            </div>
          </div>
          <span
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted dark:text-muted mb-4">
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
                className="flex items-center gap-2 p-3 bg-surface-muted dark:bg-foreground/60 rounded-lg min-w-0"
              >
                <Avatar
                  src={participant.avatarUrl ?? undefined}
                  alt={participant.username}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground dark:text-secondary-background truncate">
                    {participant.username}
                    {participant.id === challenge.challenger.id && (
                      <span className="ml-1 text-xs text-muted font-normal">challenger</span>
                    )}
                  </p>
                  <p className="text-xs text-surface-muted0 dark:text-muted">
                    {participant.score === null ? (
                      "No score yet"
                    ) : (
                      <>
                        {participant.score} correct
                        {reached && (
                          <span className="ml-1 text-foreground dark:text-foreground font-medium">
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
          <p className="text-center text-sm text-surface-muted0 dark:text-muted">
            Waiting for the other player to finish
          </p>
        )}

        {challenge.status === "completed" && winner && (
          <div className="text-center p-3 bg-surface-muted dark:bg-foreground/60 rounded-lg">
            <p className="text-sm text-muted dark:text-muted">
              Winner:{" "}
              <span className="font-medium text-foreground dark:text-secondary-background">
                {winner.displayName || winner.username}
              </span>
            </p>
            {challenge.completedAt && (
              <p className="text-xs text-surface-muted0 dark:text-muted mt-1">
                Finished {formatDate(challenge.completedAt)}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}