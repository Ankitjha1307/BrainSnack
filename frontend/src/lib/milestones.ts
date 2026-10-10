/**
 * Milestone detection + theming.
 *
 * A milestone is a pre-designed achievement card. Only a handful of fields
 * change per card (name, @username, the achievement text); everything else is a
 * fixed template, and the colour scheme is derived from the achievement type.
 *
 * The card is rendered from data - no image is generated - so the same
 * `Milestone` object is stored on the post `content` and rebuilt in the feed.
 */
import type { Post, QuizResult } from "@/types";

export type MilestoneType =
  | "perfect_score"
  | "personal_best"
  | "streak"
  | "badge"
  | "challenge_win"
  | "topic_mastery";

export interface Milestone {
  type: MilestoneType;
  /** Short label, e.g. "Perfect Score". */
  title: string;
  /** The headline number/word, e.g. "100%" or "7". */
  value: string;
  /** Supporting line, e.g. "5/5 correct". */
  subtitle: string;
  icon: string;
  /**
   * Persisted verbatim on the post. Carries the display fields so the feed can
   * rebuild the exact card without re-running detection logic.
   */
  content: Record<string, unknown>;
}

export interface MilestoneTheme {
  gradient: string;
  ring: string;
  chip: string;
  glow: string;
}

/**
 * Static Tailwind class strings (never interpolated) so the JIT compiler can
 * see them. One scheme per achievement.
 */
const THEMES: Record<MilestoneType, MilestoneTheme> = {
  perfect_score: {
    gradient: "from-main to-main",
    ring: "ring-border",
    chip: "bg-secondary-background text-foreground",
    glow: "shadow-shadow",
  },
  personal_best: {
    gradient: "from-main to-main",
    ring: "ring-border",
    chip: "bg-secondary-background text-foreground",
    glow: "shadow-shadow",
  },
  streak: {
    gradient: "from-main to-main",
    ring: "ring-border",
    chip: "bg-secondary-background text-foreground",
    glow: "shadow-shadow",
  },
  badge: {
    gradient: "from-main to-main",
    ring: "ring-border",
    chip: "bg-secondary-background text-foreground",
    glow: "shadow-shadow",
  },
  challenge_win: {
    gradient: "from-main to-main",
    ring: "ring-border",
    chip: "bg-secondary-background text-foreground",
    glow: "shadow-shadow",
  },
  topic_mastery: {
    gradient: "from-main to-main",
    ring: "ring-border",
    chip: "bg-secondary-background text-foreground",
    glow: "shadow-shadow",
  },
};

export const milestoneTheme = (type: MilestoneType): MilestoneTheme =>
  THEMES[type] ?? THEMES.badge;

/** Streak lengths worth celebrating. */
export const STREAK_MILESTONES = [7, 14, 30, 50, 100, 365];

/** Map a milestone onto the coarser `Post.type` the model stores. */
export const postTypeForMilestone = (type: MilestoneType): Post["type"] => {
  switch (type) {
    case "streak":
      return "streak";
    case "badge":
      return "badge";
    case "challenge_win":
      return "challenge";
    default:
      return "achievement";
  }
};

const makeMilestone = (
  milestone: Omit<Milestone, "content">,
  extra: Record<string, unknown> = {}
): Milestone => ({
  ...milestone,
  content: {
    milestone_type: milestone.type,
    title: milestone.title,
    value: milestone.value,
    subtitle: milestone.subtitle,
    icon: milestone.icon,
    ...extra,
  },
});

export const isCelebratedStreak = (days: number): boolean =>
  STREAK_MILESTONES.includes(days);

/**
 * Milestones a finished quiz can trigger, most impressive first.
 *
 * `personalBest` in the result is the *post-quiz* all-time best, so a tie with a
 * previous best is reported as new; that is acceptable for an opt-in share.
 */
export function milestonesFromQuizResult(result: QuizResult): Milestone[] {
  const out: Milestone[] = [];

  if (result.score === 100 && result.totalQuestions > 0) {
    out.push(
      makeMilestone(
        {
          type: "perfect_score",
          title: "Perfect Score",
          value: "100%",
          subtitle: `${result.correctAnswers}/${result.totalQuestions} correct`,
          icon: "🌟",
        },
        {
          score: 100,
          correct_answers: result.correctAnswers,
          total_questions: result.totalQuestions,
          xp_earned: result.xpEarned,
        }
      )
    );
  }

  if (result.streak && isCelebratedStreak(result.streak.current)) {
    out.push(
      makeMilestone(
        {
          type: "streak",
          title: "Streak Milestone",
          value: `${result.streak.current}`,
          subtitle: "days in a row",
          icon: "🔥",
        },
        { streak_days: result.streak.current }
      )
    );
  }

  for (const badge of result.newBadges) {
    out.push(
      makeMilestone(
        {
          type: "badge",
          title: "Badge Unlocked",
          value: badge.name,
          subtitle: badge.description ?? "New achievement",
          icon: badge.icon || "🏆",
        },
        { badge_name: badge.name, badge_icon: badge.icon }
      )
    );
  }

  if (result.score > 0 && result.score < 100 && result.personalBest === result.score) {
    out.push(
      makeMilestone(
        {
          type: "personal_best",
          title: "New Personal Best",
          value: `${result.score}%`,
          subtitle: `${result.correctAnswers}/${result.totalQuestions} correct`,
          icon: "🏅",
        },
        { score: result.score, personal_best: result.personalBest }
      )
    );
  }

  return out;
}

/** The single card the composer will attach (X only composes one post). */
export const primaryMilestone = (milestones: Milestone[]): Milestone | null =>
  milestones[0] ?? null;

export function milestoneFromChallengeWin(params: {
  opponent?: string | null;
  score?: number | null;
}): Milestone {
  return makeMilestone(
    {
      type: "challenge_win",
      title: "Challenge Won",
      value: params.score != null ? `${params.score}%` : "Victory",
      subtitle: params.opponent ? `Beat ${params.opponent}` : "You came out on top",
      icon: "⚔️",
    },
    { opponent: params.opponent ?? null, score: params.score ?? null }
  );
}

/**
 * Rebuild a card from a stored post. New posts carry the display fields on
 * `content`; seeded/legacy posts do not, so fall back to deriving them from the
 * coarse `type` and known content keys.
 */
export function milestoneFromPost(post: Post): Milestone | null {
  const content = (post.content ?? {}) as Record<string, unknown>;
  const declared = content.milestone_type as MilestoneType | undefined;

  if (declared) {
    return {
      type: declared,
      title: String(content.title ?? "Achievement"),
      value: String(content.value ?? ""),
      subtitle: String(content.subtitle ?? ""),
      icon: String(content.icon ?? "🏆"),
      content,
    };
  }

  const score = typeof content.score === "number" ? content.score : null;
  const topic = typeof content.topic === "string" ? content.topic : "";

  switch (post.type) {
    case "badge":
      return makeMilestone(
        {
          type: "badge",
          title: "Badge Unlocked",
          value: String(content.badge_name ?? "New Badge"),
          subtitle: topic || "New achievement",
          icon: String(content.badge_icon ?? "🏆"),
        },
        content
      );
    case "streak":
      return makeMilestone(
        {
          type: "streak",
          title: "Streak Milestone",
          value: String(content.streak_days ?? "0"),
          subtitle: "days in a row",
          icon: "🔥",
        },
        content
      );
    case "challenge":
      return makeMilestone(
        {
          type: "challenge_win",
          title: "Challenge Won",
          value: score != null ? `${score}%` : "Victory",
          subtitle: content.opponent ? `Beat ${content.opponent}` : "You came out on top",
          icon: "⚔️",
        },
        content
      );
    case "achievement":
      if (score === 100) {
        return makeMilestone(
          {
            type: "perfect_score",
            title: "Perfect Score",
            value: "100%",
            subtitle: topic || "Flawless run",
            icon: "🌟",
          },
          content
        );
      }
      return makeMilestone(
        {
          type: "personal_best",
          title: "Achievement",
          value: score != null ? `${score}%` : "Well done",
          subtitle: topic || "Keep it up",
          icon: "🏅",
        },
        content
      );
    default:
      return null;
  }
}
