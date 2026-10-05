"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { quizzesApi } from "@/lib/api";
import type { GradedAnswer, Question, Quiz, QuizResult } from "@/types";

export type QuizPhase =
  | "intro"
  | "question"
  | "feedback"
  | "finishing"
  | "results";

export interface LocalAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  /** True when the clock ran out before the learner answered. */
  timedOut: boolean;
}

const message = (error: unknown): string =>
  error instanceof Error ? error.message : "Something went wrong";

/**
 * Drives the quiz player.
 *
 * Grading is a server concern: `POST /quizzes/:id/answer` returns the verdict,
 * the correct option and the explanation, and `POST /quizzes/:id/complete`
 * returns the authoritative score and XP award. Nothing here decides whether an
 * answer was right - the previous version compared the selection against a
 * `correctAnswerId` that the API shipped to the browser.
 */
export function useQuiz(quiz: Quiz | null, onFinished?: (result: QuizResult) => void) {
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<GradedAnswer | null>(null);
  /** True when the feedback screen is showing because the clock ran out. */
  const [lastTimedOut, setLastTimedOut] = useState(false);
  const [answers, setAnswers] = useState<LocalAnswer[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = quiz?.questions ?? [];
  const total = questions.length;
  const currentQuestion: Question | null = questions[index] ?? null;
  const perQuestion = quiz?.timePerQuestion || 30;

  // Guards against the timer effect firing a second submit for the same question.
  const handlingRef = useRef<string | null>(null);

  const finish = useCallback(async () => {
    if (!quiz) return;
    setPhase("finishing");
    setError(null);
    try {
      const completed = await quizzesApi.complete(quiz.id);
      setResult(completed);
      setPhase("results");
      onFinished?.(completed);
    } catch (err) {
      // Stay on `finishing` so the learner can retry - XP is only banked once
      // the server has accepted the completion.
      setError(message(err));
    }
  }, [quiz, onFinished]);

  const start = useCallback(() => {
    setPhase("question");
    setIndex(0);
    setSelected(null);
    setFeedback(null);
    setAnswers([]);
    setError(null);
    handlingRef.current = null;
  }, []);

  const advance = useCallback(() => {
    setSelected(null);
    setFeedback(null);
    setLastTimedOut(false);
    if (index + 1 >= total) {
      void finish();
      return;
    }
    setIndex((i) => i + 1);
    setPhase("question");
  }, [index, total, finish]);

  const submit = useCallback(async () => {
    if (!quiz || !currentQuestion || selected === null) return;
    if (handlingRef.current === currentQuestion.id) return;
    handlingRef.current = currentQuestion.id;

    setIsSubmitting(true);
    setError(null);
    const elapsed = Math.max(1, perQuestion - timeRemaining);

    try {
      const graded = await quizzesApi.answer(
        quiz.id,
        currentQuestion.id,
        selected,
        elapsed
      );
      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          selectedOptionId: selected,
          isCorrect: graded.isCorrect,
          timedOut: false,
        },
      ]);
      setFeedback(graded);
      setLastTimedOut(false);
      setPhase("feedback");
    } catch (err) {
      handlingRef.current = null;
      setError(message(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, currentQuestion, selected, perQuestion, timeRemaining]);

  /** The clock ran out: no answer is recorded, but the learner moves on. */
  const skip = useCallback(() => {
    if (!currentQuestion) return;
    if (handlingRef.current === currentQuestion.id) return;
    handlingRef.current = currentQuestion.id;

    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOptionId: null,
        isCorrect: false,
        timedOut: true,
      },
    ]);
    setFeedback(null);
    setLastTimedOut(true);
    setPhase("feedback");
  }, [currentQuestion]);

  const exit = useCallback(() => {
    void finish();
  }, [finish]);

  // ---- timer -------------------------------------------------------------
  useEffect(() => {
    if (phase !== "question") return;
    setTimeRemaining(perQuestion);

    const id = setInterval(() => {
      setTimeRemaining((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [phase, index, perQuestion]);

  useEffect(() => {
    if (phase !== "question" || timeRemaining > 0) return;
    if (selected !== null) {
      void submit();
    } else {
      skip();
    }
  }, [phase, timeRemaining, selected, submit, skip]);

  return {
    phase,
    currentQuestion,
    currentIndex: index,
    totalQuestions: total,
    selectedOptionId: selected,
    feedback,
    lastTimedOut,
    answers,
    result,
    timeRemaining,
    isSubmitting,
    error,
    correctCount: answers.filter((a) => a.isCorrect).length,
    selectOption: setSelected,
    submitAnswer: submit,
    skipQuestion: skip,
    nextQuestion: advance,
    startQuiz: start,
    exitQuiz: exit,
  };
}