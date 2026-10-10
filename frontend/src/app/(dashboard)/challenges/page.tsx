"use client";

import React, { useState } from "react";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { CreateChallenge } from "@/components/challenges/create-challenge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorNotice, ErrorState, SkeletonList } from "@/components/ui/state";
import { challengesApi, quizzesApi } from "@/lib/api";
import { useResource } from "@/hooks/useResource";
import { useRouter } from "next/navigation";
import type { Challenge } from "@/types";

export default function ChallengesPage() {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const {
    data: challenges,
    setData,
    isLoading,
    error,
    reload,
  } = useResource<Challenge[]>(() => challengesApi.list(), []);

  const handleAccept = async (id: string) => {
    setActionError("");
    setBusyId(id);
    try {
      const updated = await challengesApi.accept(id);
      setData((current) =>
        (current ?? []).map((c) => (c.id === id ? updated : c))
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not accept the challenge");
      reload();
    } finally {
      setBusyId(null);
    }
  };

  const handleDecline = async (id: string) => {
    setActionError("");
    setBusyId(id);
    try {
      await challengesApi.decline(id);
      // A declined challenge is closed - drop it rather than showing a ghost.
      setData((current) => (current ?? []).filter((c) => c.id !== id));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not decline the challenge");
      reload();
    } finally {
      setBusyId(null);
    }
  };

  /**
   * Playing a challenge is: generate a quiz for its topic, then hand the quiz id
   * to the player. The player submits the finished quiz as the challenge score -
   * the API only accepts a score that came from a real completed quiz.
   */
  const handlePlay = async (challenge: Challenge) => {
    setActionError("");
    setBusyId(challenge.id);
    try {
      const quiz = await quizzesApi.generate({
        topicId: challenge.topicId ?? undefined,
        questionCount: 5,
      });
      router.push(`/quiz/${quiz.id}?challenge=${challenge.id}`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not start the challenge quiz"
      );
      setBusyId(null);
    }
  };

  const handleCreate = async (data: {
    challengeeId: string;
    topicId?: string;
    targetScore: number;
  }) => {
    const created = await challengesApi.create(data);
    setData((current) => [created, ...(current ?? [])]);
    setShowCreate(false);
  };

  const open = (challenges ?? []).filter((c) => c.status === "accepted");
  const incoming = (challenges ?? []).filter(
    (c) => c.status === "pending" && c.viewerRole === "challengee"
  );
  const finished = (challenges ?? []).filter((c) => c.status === "completed" || c.status === "declined");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-secondary-background">Challenges</h1>
          <p className="text-surface-muted0 dark:text-muted mt-1">
            Head to head: whoever scores higher wins 100 XP
          </p>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? "Close" : "New Challenge"}
        </Button>
      </div>

      {showCreate && (
        <CreateChallenge onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      )}

      {actionError && <ErrorNotice message={actionError} />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {isLoading && <SkeletonList rows={3} />}

      {challenges && challenges.length === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon="⚔️"
              title="No challenges yet"
              description="Pick a learner and set a target score to start one."
              action={
                <Button onClick={() => setShowCreate(true)}>Create a challenge</Button>
              }
            />
          </CardContent>
        </Card>
      )}

      {challenges && challenges.length > 0 && (
        <div className="space-y-8">
          {incoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-surface-muted0 dark:text-muted">
                Waiting on you
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incoming.map((challenge) => (
                  <div key={challenge.id} className="space-y-2">
                    <ChallengeCard challenge={challenge} />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAccept(challenge.id)}
                        isLoading={busyId === challenge.id}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDecline(challenge.id)}
                        disabled={busyId === challenge.id}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {open.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-surface-muted0 dark:text-muted">
                In progress
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {open.map((challenge) => (
                  <div key={challenge.id} className="space-y-2">
                    <ChallengeCard challenge={challenge} />
                    {challenge.viewerHasSubmitted ? (
                      <p className="text-xs text-center text-surface-muted0 dark:text-muted py-2">
                        Your score is in. Waiting for your opponent.
                      </p>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handlePlay(challenge)}
                        isLoading={busyId === challenge.id}
                      >
                        {challenge.viewerRole === "challenger"
                          ? "Play my round"
                          : "Play the challenge"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {finished.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-surface-muted0 dark:text-muted">
                Finished
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finished.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}