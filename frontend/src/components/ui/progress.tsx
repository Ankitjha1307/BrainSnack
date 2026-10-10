"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function Progress({
  value,
  max = 100,
  className,
  variant = "default",
  size = "md",
  showLabel = false,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variants = {
    default: "bg-primary-500",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-error",
  };

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-muted">
            Progress
          </span>
          <span className="text-sm font-medium text-muted">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={cn("w-full overflow-hidden rounded-base border-2 border-border bg-surface-muted", sizes[size])}>
        <div
          className={cn("h-full border-r-2 border-border transition-all duration-500 ease-out", variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
