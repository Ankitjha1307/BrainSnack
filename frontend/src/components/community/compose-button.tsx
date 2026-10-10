"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useCompose } from "@/context/ComposeContext";
import { Button } from "@/components/ui/button";

/**
 * X-style floating compose button: a circular quill/pencil action that opens
 * the new-post composer. Hidden during a quiz so it cannot overlap the player.
 */
export function ComposeFab() {
  const { openCompose } = useCompose();
  const pathname = usePathname();

  if (pathname?.startsWith("/quiz")) return null;

  return (
    <Button
      type="button"
      onClick={() => openCompose()}
      aria-label="Create a new post"
      className="fixed right-4 bottom-24 z-40 h-14 w-14 rounded-base p-0 lg:right-8 lg:bottom-8"
    >
      <span aria-hidden className="text-2xl leading-none">+</span>
    </Button>
  );
}
