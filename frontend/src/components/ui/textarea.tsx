"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          "w-full resize-none rounded-base border-2 border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted shadow-[2px_2px_0_hsl(var(--border))] focus:border-main focus:outline-none focus:ring-2 focus:ring-ring",
          error && "border-border",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-foreground">{error}</p>}
    </div>
  )
);

Textarea.displayName = "Textarea";
