"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ErrorNotice } from "@/components/ui/state";
import { topicsApi, usersApi } from "@/lib/api";
import { useResource } from "@/hooks/useResource";
import type { Topic, UserSearchResult } from "@/types";

interface CreateChallengeProps {
  onSubmit: (data: { challengeeId: string; topicId?: string; targetScore: number }) => Promise<void>;
  onCancel: () => void;
}

/**
 * Target scores are quiz percentages - the API accepts 50-100 (see
 * MIN_TARGET_SCORE in backend/src/routes/challenges.ts).
 */
const TARGET_SCORES = [50, 70, 80, 100];

export function CreateChallenge({ onSubmit, onCancel }: CreateChallengeProps) {
  const [opponentSearch, setOpponentSearch] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState<UserSearchResult | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>(undefined);
  const [targetScore, setTargetScore] = useState(80);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The server needs 2+ characters (see GET /api/users/search), so searching on
  // every keystroke below that just spams the API.
  const { data: results, isLoading: isSearching } = useResource<UserSearchResult[]>(
    () =>
      opponentSearch.trim().length >= 2 ? usersApi.search(opponentSearch.trim()) : Promise.resolve([]),
    [opponentSearch]
  );

  const { data: topics } = useResource<Topic[]>(() => topicsApi.list(), []);

  const handleSubmit = async () => {
    if (!selectedOpponent) {
      setError("Pick someone to challenge first");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit({
        challengeeId: selectedOpponent.id,
        topicId: selectedTopicId,
        targetScore,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the challenge");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Challenge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <ErrorNotice message={error} />}

        {/* Opponent search */}
        <div>
          <label
            htmlFor="challenge-opponent"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Challenge someone
          </label>
          <Input
            id="challenge-opponent"
            placeholder="Search by username…"
            value={opponentSearch}
            onChange={(e) => setOpponentSearch(e.target.value)}
            disabled={Boolean(selectedOpponent)}
          />
          {selectedOpponent ? (
            <div className="mt-2 flex items-center gap-2 p-2 bg-primary-50 rounded-lg">
              <Avatar
                src={selectedOpponent.avatarUrl ?? undefined}
                alt={selectedOpponent.username}
                size="sm"
              />
              <span className="text-sm font-medium text-primary-700 truncate">
                {selectedOpponent.username}
              </span>
              <Button
                type="button"
                variant="danger"
                size="sm"
                aria-label="Remove selected opponent"
                onClick={() => {
                  setSelectedOpponent(null);
                  setOpponentSearch("");
                }}
                className="ml-auto h-8 w-8 p-0"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          ) : (
            opponentSearch.trim().length >= 2 && (
              <div className="mt-2 border border-surface-muted rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {isSearching && <p className="p-3 text-sm text-muted">Searching…</p>}
                {!isSearching && results?.length === 0 && (
                  <p className="p-3 text-sm text-muted">No users found</p>
                )}
                {results?.map((user) => (
                  <Button
                    key={user.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedOpponent(user);
                      setOpponentSearch("");
                    }}
                    className="h-auto w-full justify-start rounded-none p-3 text-left shadow-none"
                  >
                    <Avatar src={user.avatarUrl ?? undefined} alt={user.username} size="sm" />
                    <span className="text-sm font-medium text-foreground truncate">
                      {user.username}
                    </span>
                  </Button>
                ))}
              </div>
            )
          )}
        </div>

        {/* Topic selection */}
        <div>
          <p className="block text-sm font-medium text-foreground mb-1.5">
            Topic
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={selectedTopicId === undefined ? "primary" : "outline"}
              size="sm"
              onClick={() => setSelectedTopicId(undefined)}
              className="h-auto justify-start p-3 text-left"
            >
              <span className="text-lg" aria-hidden>
                🎲
              </span>
              <span className="text-sm font-medium text-foreground">Any topic</span>
            </Button>
            {topics?.slice(0, 5).map((topic) => (
              <Button
                key={topic.id}
                type="button"
                variant={selectedTopicId === topic.id ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedTopicId(topic.id)}
                className="h-auto justify-start p-3 text-left"
              >
                <span className="text-lg" aria-hidden>
                  {topic.icon}
                </span>
                <span className="text-sm font-medium text-foreground truncate">
                  {topic.name}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Target score */}
        <div>
          <p className="block text-sm font-medium text-foreground mb-1.5">
            Score to win (% correct)
          </p>
          <div className="flex gap-2">
            {TARGET_SCORES.map((score) => (
              <Button
                key={score}
                type="button"
                variant={targetScore === score ? "primary" : "outline"}
                size="sm"
                onClick={() => setTargetScore(score)}
                className="flex-1"
              >
                {score}%
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            className="flex-1"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!selectedOpponent}
          >
            Send challenge
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}