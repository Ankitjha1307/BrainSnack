"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useCompose } from "@/context/ComposeContext";

/**
 * X-style floating compose button: a circular quill/pencil action that opens
 * the new-post composer. Hidden during a quiz so it cannot overlap the player.
 */
export function ComposeFab() {
  const { openCompose } = useCompose();
  const pathname = usePathname();

  if (pathname?.startsWith("/quiz")) return null;

  return (
    <button
      type="button"
      onClick={() => openCompose()}
      aria-label="Create a new post"
      className="fixed right-4 bottom-24 lg:right-8 lg:bottom-8 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-600/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    </button>
  );
}
