"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-base border-2 border-border bg-surface px-4 py-2.5 text-foreground placeholder:text-muted shadow-[2px_2px_0_hsl(var(--border))]",
              "focus:border-main focus:outline-none focus:ring-2 focus:ring-ring",
              "transition-all duration-200",
              icon && "pl-10",
              error && "border-border focus:ring-ring",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-foreground">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
