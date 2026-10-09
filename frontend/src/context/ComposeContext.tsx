"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Post } from "@/types";
import type { Milestone } from "@/lib/milestones";

interface ComposeContextType {
  isOpen: boolean;
  /** A milestone card to pre-attach when the composer opens. */
  pendingMilestone: Milestone | null;
  /** The most recently published post, so open feeds can prepend it. */
  lastPosted: Post | null;
  openCompose: (milestone?: Milestone | null) => void;
  closeCompose: () => void;
  markPosted: (post: Post) => void;
}

const ComposeContext = createContext<ComposeContextType | undefined>(undefined);

/**
 * Single global composer state, so the floating compose button and the
 * "share your win" buttons on results screens all open the same modal.
 */
export function ComposeProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingMilestone, setPendingMilestone] = useState<Milestone | null>(null);
  const [lastPosted, setLastPosted] = useState<Post | null>(null);

  const openCompose = useCallback((milestone?: Milestone | null) => {
    setPendingMilestone(milestone ?? null);
    setIsOpen(true);
  }, []);

  const closeCompose = useCallback(() => {
    setIsOpen(false);
    setPendingMilestone(null);
  }, []);

  const markPosted = useCallback((post: Post) => setLastPosted(post), []);

  const value = useMemo<ComposeContextType>(
    () => ({ isOpen, pendingMilestone, lastPosted, openCompose, closeCompose, markPosted }),
    [isOpen, pendingMilestone, lastPosted, openCompose, closeCompose, markPosted]
  );

  return <ComposeContext.Provider value={value}>{children}</ComposeContext.Provider>;
}

export function useCompose(): ComposeContextType {
  const context = useContext(ComposeContext);
  if (!context) {
    throw new Error("useCompose must be used inside <ComposeProvider>");
  }
  return context;
}
