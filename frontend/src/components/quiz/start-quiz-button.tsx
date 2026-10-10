"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { quizzesApi, topicsApi } from "@/lib/api";
import type { Topic } from "@/types";
import type { Difficulty } from "@/types";
import { cn } from "@/lib/utils";

interface StartQuizButtonProps {
  topicId?: string;
  difficulty?: Difficulty;
  questionCount?: number;
  label?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

type GenerationStage = "setup" | "preparing" | "creating" | "checking";

const stages: Array<{ id: GenerationStage; label: string }> = [
  { id: "preparing", label: "Preparing your learning context" },
  { id: "creating", label: "Creating questions with Gemini" },
  { id: "checking", label: "Checking quality and difficulty" },
];

export function StartQuizButton({
  topicId,
  difficulty,
  questionCount,
  label = "Start quiz",
  variant = "primary",
  size = "md",
  className,
}: StartQuizButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<GenerationStage>("setup");
  const [error, setError] = useState<string | null>(null);
  const [learnerContext, setLearnerContext] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const contextKey = "brainsnack-learner-context";

  useEffect(() => {
    const stored = window.localStorage.getItem(contextKey) ?? "";
    setLearnerContext(stored);
  }, []);

  const isGenerating = stage !== "setup";

  const openModal = () => {
    setError(null);
    setStage("setup");
    setIsOpen(true);
    if (topics.length === 0) {
      topicsApi.list().then(setTopics).catch(() => setTopics([]));
    }
  };

  const closeModal = () => {
    if (!isGenerating) setIsOpen(false);
  };

  const start = async () => {
    setError(null);
    setStage("preparing");
    const categoryContext =
      categoryId && topics.find((topic) => topic.id === categoryId)
        ? `Category: ${topics.find((topic) => topic.id === categoryId)?.name}`
        : "";
    const context = [categoryContext, learnerContext.trim()]
      .filter(Boolean)
      .join("\n")
      .slice(0, 2000);
    window.localStorage.setItem(contextKey, context);

    const creatingTimer = window.setTimeout(() => setStage("creating"), 700);
    const checkingTimer = window.setTimeout(() => setStage("checking"), 2200);

    try {
      const quiz = await quizzesApi.generate({
        topicId: topicId ?? (categoryId || undefined),
        difficulty,
        questionCount,
        learnerContext: context,
      });
      window.clearTimeout(creatingTimer);
      window.clearTimeout(checkingTimer);
      router.push(`/quiz/${quiz.id}`);
    } catch (err) {
      window.clearTimeout(creatingTimer);
      window.clearTimeout(checkingTimer);
      setStage("setup");
      const message =
        err instanceof Error
          ? err.message
          : "We could not create your quiz. Please try again.";
      console.error("[quiz-generation] request failed", {
        message,
        topicId: topicId ?? (categoryId || null),
        hasContext: Boolean(context),
      });
      setError(message);
    }
  };

  return (
    <>
      <div className={cn("space-y-1", className)}>
        <Button
          onClick={openModal}
          variant={variant}
          size={size}
          className="w-full rounded-xl"
        >
          {label}
        </Button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-generator-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-secondary-background shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
                  BrainSnack AI
                </p>
                <h2 id="quiz-generator-title" className="text-xl font-semibold text-foreground">
                  {isGenerating ? "Building your quiz" : "Make this session yours"}
                </h2>
                <p className="mt-1 text-sm text-surface-muted">
                  {isGenerating
                    ? "This usually takes a few seconds."
                    : "Give the AI a little context for a more useful quiz."}
                </p>
              </div>
              {!isGenerating && (
                <button
                  type="button"
                  aria-label="Close quiz generator"
                  onClick={closeModal}
                  className="rounded-full p-2 text-surface-muted transition hover:bg-surface-muted hover:text-foreground"
                >
                  <span aria-hidden>×</span>
                </button>
              )}
            </div>

            <div className="px-6 py-6">
              {isGenerating ? (
                <div className="space-y-5">
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={cn(
                        "h-full rounded-full bg-main transition-all duration-700",
                        stage === "preparing" && "w-1/3",
                        stage === "creating" && "w-2/3",
                        stage === "checking" && "w-full"
                      )}
                    />
                  </div>
                  <div className="space-y-3">
                    {stages.map((item) => {
                      const currentIndex = stages.findIndex((entry) => entry.id === stage);
                      const itemIndex = stages.findIndex((entry) => entry.id === item.id);
                      const complete = itemIndex < currentIndex;
                      const current = item.id === stage;
                      return (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          <span
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full border",
                              complete || current
                                ? "border-main bg-main text-main-foreground"
                                : "border-border text-surface-muted"
                            )}
                          >
                            {complete ? "✓" : current ? <span className="h-2 w-2 animate-pulse rounded-full bg-current" /> : itemIndex + 1}
                          </span>
                          <span className={current ? "font-medium text-foreground" : "text-surface-muted"}>
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="quiz-category" className="mb-2 block text-sm font-semibold text-black">
                      Choose a category
                    </label>
                    <select
                      id="quiz-category"
                      value={categoryId}
                      onChange={(event) => setCategoryId(event.target.value)}
                      className="h-11 w-full rounded-xl border border-border bg-secondary-background px-3 text-sm text-black outline-none transition focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Mixed topics</option>
                      {topics.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.icon} {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Textarea
                    label="What should this quiz focus on?"
                    value={learnerContext}
                    onChange={(event) => setLearnerContext(event.target.value.slice(0, 2000))}
                    placeholder="Tell us what you know, what feels difficult, or what you want to achieve."
                    rows={5}
                    maxLength={2000}
                    className="rounded-xl border-border shadow-none focus:ring-2"
                  />
                  <div className="flex items-center justify-between text-xs text-surface-muted">
                    <span>Optional, but it helps personalize the questions.</span>
                    <span>{learnerContext.length}/2000</span>
                  </div>
                  {error && (
                    <div className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-foreground" role="alert">
                      <p className="font-semibold">We couldn&apos;t create that quiz.</p>
                      <p className="mt-1">{error}</p>
                    </div>
                  )}
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button type="button" variant="ghost" className="rounded-xl" onClick={closeModal}>
                      Not now
                    </Button>
                    <Button type="button" className="rounded-xl px-6" onClick={start}>
                      Generate my quiz
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
