"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FeedTab {
  id: string;
  label: string;
}

interface FeedTabsProps {
  tabs: FeedTab[];
  active: string;
  onChange: (id: string) => void;
}

/** X-style underlined tab bar for the feed scopes. */
export function FeedTabs({ tabs, active, onChange }: FeedTabsProps) {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-800">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative flex-1 py-3 text-sm font-medium transition-colors",
            active === tab.id
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
          )}
        >
          {tab.label}
          {active === tab.id && (
            <span className="absolute inset-x-0 -bottom-px mx-auto h-0.5 w-16 rounded-full bg-primary-600" />
          )}
        </button>
      ))}
    </div>
  );
}
