"use client";

import React, { Suspense, useCallback, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useResource } from "@/hooks/useResource";
import { useQuiz } from "@/hooks/useQuiz";
import { useAuth } from "@/context/AuthContext";
import { challengesApi, quizzesApi } from "@/lib/api";
import { QuizCard } from "@/components/quiz/quiz-card";
import { QuestionCard } from "@/components/quiz/question-card";
import { AnswerOptionRow } from "@/components/quiz/answer-option";
import { QuizProgress } from "@/components/quiz/quiz-progress";
import { QuizTimer } from "@/components/quiz/quiz-timer";
import { ExplanationCard, TimeUpCard } from "@/components/quiz/explanation-card";
import { QuizResults } from "@/components/quiz/quiz-results";
import { Button } from "@/components/ui/button";
import { ErrorNotice, ErrorState, LoadingState } from "@/components/ui/state";
import { Card, CardContent } from "@/components/ui/card";

/** Wraps the page so `useSearchParams` has the Suspense boundary it requires. */
export default function QuizPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading your quiz…" />}>
      <QuizPlayer />
    </Suspense>
  );
}

function QuizPlayer() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = params?.id as string | undefined;
  const { refreshUser } = useAuth();

  // A challenge round carries `?challenge=<id>`; finishing the quiz then submits
  // the real server-graded score as the challenge result.
  const challengeId = searchParams.get("challenge");

  const [challengeNote, setChallengeNote] = useState<string | null>(null);

  const {
    data: quiz,
    error: loadError,
    isLoading,
    reload,
  } = useResource(() => quizzesApi.get(quizId!), [quizId]);

  const handleFinished = useCallback(
    async (quizId: string) => {
      await refreshUser();
      if (!challengeId) return;
      try {
        const submission = await challengesApi.submit(challengeId, quizId);
        if (submission.result === "waiting_for_opponent") {
          setChallengeNote(
            `Score submitted: ${submission.yourScore ?? 0}%. Waiting for your opponent to play.`
          );
        } else if (submission.result === "draw") {
          setChallengeNote("It's a draw — you both scored the same.");
        } else {
          setChallengeNote("Challenge decided. Check the challenges page for the result.");
        }
      } catch (err) {
        // The quiz score is already banked; only the challenge hand-off failed.
        setChallengeNote(
          err instanceof Error
            ? `Quiz saved, but the challenge could not be submitted: ${err.message}`
            : "Quiz saved, but the challenge could not be submitted."
        );
      }
    },
    [challengeId, refreshUser]
  );

  const {
    phase,
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedOptionId,
    feedback,
    lastTimedOut,
    answers,
    result,
    timeRemaining,
    isSubmitting,
    error,
    selectOption,
    submitAnswer,
    nextQuestion,
    startQuiz,
    exitQuiz,
  } = useQuiz(quiz, quiz ? () => void handleFinished(quiz.id) : undefined);

  if (isLoading) return <LoadingState label="Loading your quiz…" />;

  if (loadError || !quiz) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <ErrorState
          message={loadError ?? "Quiz not found"}
          onRetry={loadError ? reload : undefined}
          hint="It may belong to another account, or it may have been removed."
        />
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => router.push("/topics")}>
            Back to topics
          </Button>
        </div>
      </div>
    );
  }

  const answeredCount = answers.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // ---- intro -------------------------------------------------------------
  if (phase === "intro") {
    return (
      <div className="space-y-4">
        {challengeId && (
          <Card className="border-primary-200 dark:border-primary-800">
            <CardContent className="pt-4 text-sm text-gray-600 dark:text-gray-300">
              This round counts towards a challenge. Your score is submitted automatically when
              you finish.
            </CardContent>
          </Card>
        )}
        <QuizCard
          quiz={quiz}
          onStart={startQuiz}
          onExit={exitQuiz}
          isStarting={isSubmitting}
          error={error}
          answeredCount={answeredCount}
        />
      </div>
    );
  }

  // ---- finishing ---------------------------------------------------------
  if (phase === "finishing") {
    return (
      <div className="max-w-md mx-auto space-y-4">
        {error ? (
          <>
            <ErrorNotice message={error} />
            <Button className="w-full" onClick={exitQuiz}>
              Retry
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard")}>
              Give up and leave
            </Button>
          </>
        ) : (
          <LoadingState label="Saving your result…" />
        )}
      </div>
    );
  }

  // ---- results -----------------------------------------------------------
  if (phase === "results" && result) {
    return (
      <div className="space-y-4">
        {challengeNote && (
          <Card>
            <CardContent className="pt-5 text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Challenge</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{challengeNote}</p>
            </CardContent>
          </Card>
        )}
        <QuizResults
          result={result}
          topicName={quiz.topicName}
          onBack={() =>
            router.push(challengeId ? "/challenges" : quiz.topicId ? `/topics/${quiz.topicId}` : "/topics")
          }
          onRetake={() =>
            quiz.topicId ? router.push(`/topics/${quiz.topicId}`) : router.push("/topics")
          }
        />
      </div>
    );
  }

  if (!currentQuestion) return null;

  // ---- feedback ----------------------------------------------------------
  if (phase === "feedback") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <QuizProgress current={currentIndex + 1} total={totalQuestions} />
        {lastTimedOut ? (
          <TimeUpCard onNext={nextQuestion} isLast={isLastQuestion} />
        ) : feedback ? (
          <ExplanationCard
            question={currentQuestion}
            selectedOptionId={selectedOptionId ?? ""}
            correctOptionId={feedback.correctAnswerId}
            explanation={feedback.explanation}
            onNext={nextQuestion}
            isLast={isLastQuestion}
            isSubmitting={isSubmitting}
          />
        ) : null}
      </div>
    );
  }

  // ---- question ----------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <QuizProgress current={currentIndex + 1} total={totalQuestions} />
        <QuizTimer timeRemaining={timeRemaining} totalTime={quiz.timePerQuestion} />
      </div>

      <QuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={totalQuestions}
      />

      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => (
          <AnswerOptionRow
            key={option.id}
            id={option.id}
            text={option.text}
            index={index}
            state={selectedOptionId === option.id ? "selected" : "default"}
            onClick={() => selectOption(option.id)}
            disabled={isSubmitting}
          />
        ))}
      </div>

      {error && <ErrorNotice message={error} />}

      {selectedOptionId !== null && (
        <Button onClick={submitAnswer} className="w-full" size="lg" isLoading={isSubmitting}>
          Check answer
        </Button>
      )}

      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={exitQuiz}>
          Finish early
        </Button>
      </div>
    </div>
  );
}