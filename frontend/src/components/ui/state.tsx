"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

/** Skeleton rows, used by lists that should not flash a spinner on every filter. */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  hint,
}: {
  message: string;
  onRetry?: () => void;
  hint?: string;
}) {
  return (
    <Card padding="none">
      <CardContent className="pt-6 text-center">
        <div className="text-3xl mb-2">⚠️</div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{message}</p>
        {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>}
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-14">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-medium text-gray-900 dark:text-white">{title}</p>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Inline, dismissable-free error strip for forms and mutations. */
export function ErrorNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300"
    >
      {message}
    </div>
  );
}