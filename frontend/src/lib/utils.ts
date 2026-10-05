import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * XP required to reach each level. Mirrors `LEVEL_THRESHOLDS` in
 * `backend/src/types/index.ts` - the previous `xp / 1000 + 1` formula here
 * disagreed with the server, so the same account rendered at two different
 * levels depending on which page you looked at.
 */
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 6800, 8000, 9300,
  10700, 12200, 13800, 15500, 17300,
];

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPForLevel(level: number): number {
  return LEVEL_THRESHOLDS[Math.max(0, Math.min(level - 1, LEVEL_THRESHOLDS.length - 1))];
}

/** Progress toward the next level as a percentage, or 100 at max level. */
export function getLevelProgress(xp: number): number {
  const level = getLevelFromXP(xp);
  const floor = getXPForLevel(level);
  const ceiling = LEVEL_THRESHOLDS[level];
  if (ceiling === undefined) return 100;
  return Math.min(100, Math.max(0, ((xp - floor) / (ceiling - floor)) * 100));
}

export function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 10000) return `${Math.round(xp / 1000)}K`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return xp.toString();
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(date: string): string {
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return "";

  const diffMs = Date.now() - then;
  const future = diffMs < 0;
  const abs = Math.abs(diffMs);

  const mins = Math.floor(abs / 60000);
  const hours = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);

  const phrase =
    mins < 1 ? "just now" : mins < 60 ? `${mins}m` : hours < 24 ? `${hours}h` : `${days}d`;

  if (phrase === "just now") return phrase;
  return future ? `in ${phrase}` : `${phrase} ago`;
}

/** Deterministic avatar so every account has a face without an upload flow. */
export function avatarUrl(userId: string, seed: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed || userId)}`;
}

/** Tailwind text colour for a score, used on quiz results and progress bars. */
export function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-primary-600 dark:text-primary-400";
  if (score >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}
