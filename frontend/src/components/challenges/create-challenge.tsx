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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
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
            <div className="mt-2 flex items-center gap-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <Avatar
                src={selectedOpponent.avatarUrl ?? undefined}
                alt={selectedOpponent.username}
                size="sm"
              />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300 truncate">
                {selectedOpponent.username}
              </span>
              <button
                type="button"
                aria-label="Remove selected opponent"
                onClick={() => {
                  setSelectedOpponent(null);
                  setOpponentSearch("");
                }}
                className="ml-auto text-primary-500 hover:text-primary-700"
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
              </button>
            </div>
          ) : (
            opponentSearch.trim().length >= 2 && (
              <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {isSearching && <p className="p-3 text-sm text-gray-500">Searching…</p>}
                {!isSearching && results?.length === 0 && (
                  <p className="p-3 text-sm text-gray-500 dark:text-gray-400">No users found</p>
                )}
                {results?.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedOpponent(user);
                      setOpponentSearch("");
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <Avatar src={user.avatarUrl ?? undefined} alt={user.username} size="sm" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.username}
                    </span>
                  </button>
                ))}
              </div>
            )
          )}
        </div>

        {/* Topic selection */}
        <div>
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Topic
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedTopicId(undefined)}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                selectedTopicId === undefined
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <span className="text-lg" aria-hidden>
                🎲
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Any topic</span>
            </button>
            {topics?.slice(0, 5).map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedTopicId(topic.id)}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                  selectedTopicId === topic.id
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {topic.icon}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {topic.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Target score */}
        <div>
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Score to win (% correct)
          </p>
          <div className="flex gap-2">
            {TARGET_SCORES.map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setTargetScore(score)}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  targetScore === score
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                {score}%
              </button>
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