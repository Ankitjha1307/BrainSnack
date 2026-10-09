"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WhoToFollow } from "./who-to-follow";

/**
 * Shown on the Following tab when the viewer follows nobody (the cold-start
 * case) or the people they follow have not posted. It must never be a blank
 * screen: it explains why the feed is quiet and gives two ways out.
 */
export function FollowingEmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className="text-center">
        <div className="text-4xl mb-3" aria-hidden>
          🌱
        </div>
        <p className="font-semibold text-gray-900 dark:text-white">Your feed is quiet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          Follow a few learners and their wins will show up here.
        </p>
      </div>

      <div className="mt-5">
        <WhoToFollow />
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button variant="outline" onClick={onBrowse}>
          Browse trending →
        </Button>
        <Link href="/topics">
          <Button className="w-full">Take your first quiz</Button>
        </Link>
      </div>
    </div>
  );
}
