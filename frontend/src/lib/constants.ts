export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Tailwind classes per topic, keyed by slug. Falls back to a neutral slate. */
const TOPIC_THEME: Record<string, string> = {
  programming:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "ai-ml": "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  science:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  history: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  geography:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  business: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
  "general-knowledge":
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
};

export const DEFAULT_TOPIC_THEME =
  "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300";

export function topicTheme(slug: string | null | undefined): string {
  if (!slug) return DEFAULT_TOPIC_THEME;
  return TOPIC_THEME[slug] ?? DEFAULT_TOPIC_THEME;
}

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/topics", label: "Topics" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/community", label: "Community" },
  { href: "/challenges", label: "Challenges" },
  { href: "/profile", label: "Profile" },
] as const;