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
    "bg-primary-100 text-primary-700",
  "ai-ml": "bg-accent-100 text-accent-700",
  science:
    "bg-emerald-100 text-emerald-700",
  history: "bg-primary-100 text-primary-700",
  geography:
    "bg-primary-100 text-primary-700",
  business: "bg-surface-muted text-foreground",
  "general-knowledge":
    "bg-surface-muted text-foreground",
};

export const DEFAULT_TOPIC_THEME =
  "bg-surface-muted text-muted";

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