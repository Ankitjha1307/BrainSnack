"use client";

import React from "react";
import { cn } from "@/lib/utils";

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
  default:
    "border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20",
  selected: "border-primary-500 bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-500/20",
  correct: "border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-500/20",
  incorrect: "border-red-500 bg-red-50 dark:bg-red-900/30 ring-2 ring-red-500/20",
  disabled: "border-gray-200 dark:border-gray-700 opacity-60 cursor-default",
};

const labelStyles: Record<OptionState, string> = {
  default: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  selected: "bg-primary-500 text-white",
  correct: "bg-green-500 text-white",
  incorrect: "bg-red-500 text-white",
  disabled: "bg-gray-100 dark:bg-gray-700 text-gray-400",
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
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      aria-pressed={state === "selected"}
      className={cn(
        "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
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
      <span className="flex-1 text-gray-900 dark:text-white font-medium">{text}</span>
      {state === "correct" && (
        <svg
          className="h-5 w-5 text-green-500 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {state === "incorrect" && (
        <svg
          className="h-5 w-5 text-red-500 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </button>
  );
}