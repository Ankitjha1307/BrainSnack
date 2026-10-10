"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <div className="flex border-b border-surface-muted dark:border-foreground">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative h-auto flex-1 rounded-none border-x-0 border-t-0 py-3 text-sm font-medium shadow-none",
            active === tab.id ? "border-b-2 border-main text-foreground" : "text-muted"
          )}
        >
          {tab.label}
          {active === tab.id && (
            <span className="absolute inset-x-0 bottom-0 mx-auto h-1 w-16 bg-main" />
          )}
        </Button>
      ))}
    </div>
  );
}
