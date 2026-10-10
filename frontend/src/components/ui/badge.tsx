"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "accent";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  const variants = {
    default: "border-border bg-surface-muted text-foreground",
    success: "border-border bg-success/15 text-foreground",
    warning: "border-border bg-warning/15 text-foreground",
    danger: "border-border bg-error/15 text-foreground",
    info: "border-border bg-primary-100 text-primary-700",
    accent: "border-border bg-main text-main-foreground",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-base border px-2.5 py-1 font-semibold",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
