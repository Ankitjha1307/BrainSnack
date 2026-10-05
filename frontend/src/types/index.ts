/**
 * View models.
 *
 * These are the camelCase shapes the UI renders. `lib/api.ts` maps the
 * snake_case wire format from the Express API into these, so a database column
 * rename never leaks into a React component.
 */

export type Difficulty = "easy" | "medium" | "hard";

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
  streak: number;
  personalBest: number;
  joinedAt: string;
  /** True for a throwaway "continue as guest" session. */
  isGuest?: boolean;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  /** Hex string from the DB, e.g. "#6366f1". */
  color: string;
  questionCount: number;
  conceptCount: number;
  concepts: Concept[];
  /** null when the learner has never attempted this topic. */
  mastery: number | null;
  accuracy: number | null;
  questionsAttempted: number;
  difficultyLevel: string | null;
}

export interface Concept {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface AnswerOption {
  /** Option text is the identifier: the backend stores the chosen index. */
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  concept: string | null;
  options: AnswerOption[];
  difficulty: Difficulty;
  /**
   * Only present after the question has been graded. The server withholds it
   * while a quiz is in progress - do not expect it to exist here.
   */
  correctAnswerId?: string;
  explanation?: string | null;
}

export interface Quiz {
  id: string;
  topicId: string | null;
  topicName: string;
  difficulty: Difficulty;
  questionCount: number;
  timePerQuestion: number;
  totalXP: number;
  /** "ai" when Gemini/mock provider served it, "bank" when Postgres fallback did. */
  source?: "ai" | "bank";
  questions: Question[];
}

export interface GradedAnswer {
  isCorrect: boolean;
  correctAnswerId: string;
  explanation: string | null;
  nextQuestionId: string | null;
}

export interface QuizResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number;
  baseXP: number;
  perfectBonus: number;
  personalBest: number;
  streak: { current: number; longest: number } | null;
  newBadges: Badge[];
  alreadyCompleted?: boolean;
}

export interface QuizHistoryEntry {
  id: string;
  topicId: string | null;
  topicName: string | null;
  topicIcon: string | null;
  difficulty: Difficulty;
  questionCount: number;
  status: "in_progress" | "completed" | "abandoned";
  score: number;
  xpEarned: number;
  createdAt: string;
  completedAt: string | null;
}

export interface XPTransaction {
  id: string;
  amount: number;
  reason: string;
  referenceType: string | null;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  criteriaType: string;
  criteriaValue: number;
  earnedAt?: string;
  /** Present on locked badges: how close the learner is to earning it. */
  progress?: number;
  current?: number;
}

export interface TopicMastery {
  topicId: string;
  topicName: string;
  topicSlug: string;
  topicIcon: string;
  topicColor: string;
  accuracy: number;
  mastery: number;
  questionsAttempted: number;
  questionsCorrect: number;
  difficultyLevel: string;
}

export interface UserProgress {
  totalXP: number;
  level: number;
  personalBest: number;
  xpToNextLevel: number | null;
  currentStreak: number;
  longestStreak: number;
  streakAlive: boolean;
  quizzesCompleted: number;
  totalQuestions: number;
  correctAnswers: number;
  overallAccuracy: number;
  topicProgress: TopicMastery[];
  weakTopics: Array<{
    topicId: string;
    name: string;
    slug: string;
    icon: string;
    accuracy: number;
    questionsAttempted: number;
  }>;
  recentActivity: XPTransaction[];
  recentQuizzes: QuizHistoryEntry[];
  badges: Badge[];
  lockedBadges: Badge[];
}

export interface LeaderboardEntry {
  rank: number;
  user: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "xp" | "level" | "streak" | "personalBest">;
  /** XP for the selected window - not the user's lifetime total. */
  xp: number;
  level: number;
  streak: number;
}

export interface Leaderboard {
  entries: LeaderboardEntry[];
  myRank: LeaderboardEntry | null;
  type: "daily" | "weekly" | "alltime" | "topic";
}

export interface StreakEntry {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Post {
  id: string;
  type: "achievement" | "badge" | "streak" | "challenge" | "general";
  content: Record<string, unknown>;
  caption: string | null;
  createdAt: string;
  likesCount: number;
  likedByUser: boolean;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    xp: number;
    level: number;
  };
}

export interface ChallengeParticipant {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
  streak: number;
  score: number | null;
}

export interface Challenge {
  id: string;
  topicId: string | null;
  topicName: string;
  topicIcon: string;
  topicSlug: string | null;
  targetScore: number;
  status: "pending" | "accepted" | "completed" | "declined";
  createdAt: string;
  completedAt: string | null;
  challenger: ChallengeParticipant;
  challengee: ChallengeParticipant;
  viewerRole: "challenger" | "challengee" | null;
  viewerScore: number | null;
  viewerHasSubmitted: boolean;
  targetReached: boolean | null;
  winnerId: string | null;
}

export interface UserSearchResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
  streak: number;
}
