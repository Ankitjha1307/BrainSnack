"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-200 border-t-primary-500" />
      <p className="text-sm text-muted">{label}</p>
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
          className="animate-pulse rounded-xl border border-border bg-surface p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-surface-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-surface-muted" />
              <div className="h-3 w-2/3 rounded bg-surface-muted" />
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
        <p className="text-sm font-medium text-foreground">{message}</p>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
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
      <p className="font-medium text-foreground">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
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
      className="rounded-lg border border-border bg-error/10 p-3 text-sm text-foreground"
    >
      {message}
    </div>
  );
}