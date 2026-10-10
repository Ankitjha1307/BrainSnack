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
    "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200",
  "ai-ml": "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-200",
  science:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  history: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200",
  geography:
    "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200",
  business: "bg-surface-muted text-foreground dark:bg-surface-muted dark:text-foreground",
  "general-knowledge":
    "bg-surface-muted text-foreground dark:bg-surface-muted dark:text-foreground",
};

export const DEFAULT_TOPIC_THEME =
  "bg-surface-muted text-muted dark:bg-surface-muted dark:text-muted";

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