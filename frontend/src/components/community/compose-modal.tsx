"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompose } from "@/context/ComposeContext";
import { CreatePost } from "./create-post";
import { postsApi } from "@/lib/api";
import { ErrorNotice } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { postTypeForMilestone, type Milestone } from "@/lib/milestones";

/**
 * The single new-post composer, opened by the FAB or a "share your win" button.
 * Renders as a bottom sheet on mobile and a centred dialog on desktop.
 */
export function ComposeModal() {
  const { isOpen, pendingMilestone, closeCompose, markPosted } = useCompose();
  const router = useRouter();

  const [attached, setAttached] = useState<Milestone | null>(pendingMilestone);
  const [error, setError] = useState("");

  // Reset the attachment whenever a new compose session begins.
  useEffect(() => {
    setAttached(pendingMilestone);
    setError("");
  }, [pendingMilestone, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCompose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeCompose]);

  if (!isOpen) return null;

  const handleSubmit = async ({
    caption,
    milestone,
  }: {
    caption: string;
    milestone: Milestone | null;
  }) => {
    setError("");
    try {
      const created = await postsApi.create({
        caption,
        type: milestone ? postTypeForMilestone(milestone.type) : "general",
        content: milestone?.content,
      });
      markPosted(created);
      closeCompose();
      // Land on the feed so the new post is visible; if already there, the
      // community page prepends `lastPosted` itself.
      if (typeof window !== "undefined" && window.location.pathname !== "/community") {
        router.push("/community");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not share that post");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create a new post"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-foreground/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={closeCompose}
    >
      <Card
        padding="none"
        className="w-full max-h-[92vh] max-w-lg overflow-y-auto rounded-t-base p-4 animate-slide-up sm:rounded-base sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground dark:text-secondary-background">New post</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={closeCompose}
            aria-label="Close composer"
            className="h-8 w-8 rounded-base p-0 text-muted"
          >
            ✕
          </Button>
        </div>

        {pendingMilestone && !attached && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAttached(pendingMilestone)}
            className="mb-3 w-full border-dashed"
          >
            ✨ Attach your achievement card
          </Button>
        )}

        {error && (
          <div className="mb-3">
            <ErrorNotice message={error} />
          </div>
        )}

        <CreatePost
          milestone={attached}
          onRemoveMilestone={() => setAttached(null)}
          onSubmit={handleSubmit}
          autoFocus
        />
      </Card>
    </div>
  );
}
