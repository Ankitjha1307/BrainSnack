"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Only the windows the API actually serves. "Friends" and "By Topic" need a
 *  real endpoint before they can be offered - see leaderboard/page.tsx. */
type TabType = "daily" | "weekly" | "alltime";

interface LeaderboardTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string }[] = [
  { id: "daily", label: "Today" },
  { id: "weekly", label: "This week" },
  { id: "alltime", label: "All time" },
];

export function LeaderboardTabs({ activeTab, onTabChange }: LeaderboardTabsProps) {
  return (
    <div className="flex gap-1 rounded-base border-2 border-border bg-surface-muted p-1 shadow-shadow">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          type="button"
          variant={activeTab === tab.id ? "primary" : "ghost"}
          size="sm"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1",
          )}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}