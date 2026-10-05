"use client";

import React from "react";
import { cn } from "@/lib/utils";

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
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
            activeTab === tab.id
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}