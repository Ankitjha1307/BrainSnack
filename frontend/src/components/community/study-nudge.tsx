"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/** Cheeky lines that rotate to keep the left rail alive without shouting. */
const NUDGES = [
  { emoji: "🧠", text: "Your brain called. It wants a snack." },
  { emoji: "⚡", text: "Five questions. Zero excuses." },
  { emoji: "🔥", text: "Streaks don't build themselves." },
  { emoji: "🚀", text: "Small quizzes, big brain energy." },
  { emoji: "🍿", text: "Learning is the best kind of snack." },
];

const FACTS = [
  "Octopuses have three hearts and blue blood.",
  "The Eiffel Tower grows about 15 cm taller in summer.",
  "Honey never spoils — 3,000-year-old jars are still edible.",
  "Sharks are older than trees.",
  "Bananas are berries, but strawberries aren't.",
  "A day on Venus is longer than its year.",
  "There are more possible chess games than atoms in the universe.",
];

export function StudyNudge() {
  const [nudge, setNudge] = useState(0);
  const [fact, setFact] = useState(0);

  // Rotate after mount so the first server render is deterministic.
  useEffect(() => {
    const id = window.setInterval(() => {
      setNudge((n) => (n + 1) % NUDGES.length);
      setFact((f) => (f + 1) % FACTS.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700" />
      <CardContent className="pt-5">
        <p key={`n-${nudge}`} className="animate-fade-in text-sm font-semibold text-foreground">
          <span className="mr-1.5" aria-hidden>
            {NUDGES[nudge].emoji}
          </span>
          {NUDGES[nudge].text}
        </p>

        <div className="mt-4 rounded-base border-2 border-border bg-accent-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-700">
            Did you know?
          </p>
          <p key={`f-${fact}`} className="mt-1 animate-fade-in text-sm text-foreground">
            {FACTS[fact]}
          </p>
        </div>

        <Link href="/topics" className="mt-4 block">
          <Button className="w-full">Take another quiz</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
