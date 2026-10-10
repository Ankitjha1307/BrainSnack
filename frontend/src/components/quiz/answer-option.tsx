"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type OptionState = "default" | "selected" | "correct" | "incorrect" | "disabled";

interface AnswerOptionRowProps {
  id: string;
  text: string;
  index: number;
  state: OptionState;
  onClick: () => void;
  disabled?: boolean;
}

const LETTERS = "ABCDEFGH";

const stateStyles: Record<OptionState, string> = {
  default: "border-border bg-surface hover:border-main hover:bg-accent-soft",
  selected: "border-main bg-accent-soft",
  correct: "border-border bg-success/10",
  incorrect: "border-border bg-error/10",
  disabled: "border-border bg-surface-muted opacity-60 cursor-default",
};

const labelStyles: Record<OptionState, string> = {
  default: "bg-surface-muted text-foreground",
  selected: "bg-main text-main-foreground",
  correct: "bg-success text-secondary-background",
  incorrect: "bg-error text-secondary-background",
  disabled: "bg-surface-muted text-muted",
};

export function AnswerOptionRow({
  text,
  index,
  state,
  onClick,
  disabled = false,
}: AnswerOptionRowProps) {
  const interactive = !disabled && state === "default";

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={onClick}
      disabled={!interactive}
      aria-pressed={state === "selected"}
      className={cn(
        "h-auto w-full justify-start p-4 text-left",
        stateStyles[state],
        interactive && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <span
        className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
          labelStyles[state]
        )}
      >
        {LETTERS[index] ?? index + 1}
      </span>
      <span className="flex-1 text-foreground font-medium">{text}</span>
      {state === "correct" && (
        <svg
          className="h-5 w-5 text-foreground flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {state === "incorrect" && (
        <svg
          className="h-5 w-5 text-foreground flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </Button>
  );
}