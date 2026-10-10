"use client";

import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { milestoneTheme, type Milestone } from "@/lib/milestones";

export interface MilestoneCardUser {
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  level?: number;
}

interface MilestoneCardProps {
  milestone: Milestone;
  user: MilestoneCardUser;
  /** `preview` is the share-friendly 4:5 sheet; `feed` is the compact inline card. */
  variant?: "feed" | "preview";
  className?: string;
}

/**
 * The fixed achievement template. Only the user's name, @username and the
 * milestone text change between cards; the layout and colour scheme (derived
 * from the achievement type) are constant.
 */
export function MilestoneCard({
  milestone,
  user,
  variant = "feed",
  className,
}: MilestoneCardProps) {
  const theme = milestoneTheme(milestone.type);
  const preview = variant === "preview";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-base border-2 border-border bg-main text-foreground shadow-shadow",
        theme.gradient,
        theme.ring,
        theme.glow,
        preview ? "aspect-[4/5] p-6 flex flex-col justify-between" : "p-4",
        className
      )}
    >
      {/* Soft light bloom for depth. */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-foreground/10" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-foreground/10" />

      <div className="relative flex items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
            theme.chip
          )}
        >
          <span aria-hidden>{milestone.icon}</span>
          {milestone.title}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
          BrainSnack
        </span>
      </div>

      <div
        className={cn(
          "relative flex flex-col items-center justify-center text-center",
          preview ? "py-8" : "py-4"
        )}
      >
        <span
          className={cn(
            "font-foreground leading-none drop-shadow-sm",
            preview ? "text-6xl" : "text-3xl"
          )}
        >
          {milestone.value}
        </span>
        {milestone.subtitle && (
          <span
            className={cn(
              "mt-2 font-medium text-foreground",
              preview ? "text-sm" : "text-xs"
            )}
          >
            {milestone.subtitle}
          </span>
        )}
      </div>

      <div className="relative flex items-center gap-2">
        <span className="rounded-full ring-2 ring-border">
          <Avatar
            src={user.avatarUrl ?? undefined}
            alt={user.username}
            fallback={user.displayName || user.username}
            size={preview ? "md" : "sm"}
          />
        </span>
        <div className="min-w-0 text-left">
          <p className={cn("truncate font-semibold", preview ? "text-sm" : "text-xs")}>
            {user.displayName || user.username}
          </p>
          <p className={cn("truncate text-foreground", preview ? "text-xs" : "text-[10px]")}>
            @{user.username}
            {user.level ? ` · Lv ${user.level}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
