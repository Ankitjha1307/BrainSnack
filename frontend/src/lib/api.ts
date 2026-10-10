import { API_URL } from "./constants";
import type {
  Badge,
  Challenge,
  Difficulty,
  GradedAnswer,
  Leaderboard,
  LeaderboardEntry,
  Post,
  Question,
  Quiz,
  QuizHistoryEntry,
  QuizResult,
  StreakEntry,
  Topic,
  TopicMastery,
  User,
  UserProgress,
  UserSearchResult,
  XPTransaction,
} from "@/types";

// ---------------------------------------------------------------------------
// transport

export class ApiError extends Error {
  status: number;
  /** Per-field messages returned by the API for form validation. */
  fields?: Record<string, string>;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

const TOKEN_KEY = "brainsnack_token";
const DEFAULT_TIMEOUT_MS = 45000;

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    // A failed fetch is almost always the backend being down; say so plainly
    // instead of surfacing "Failed to fetch" to the learner.
    throw new ApiError(
      (error as Error)?.name === "AbortError"
        ? "The server took too long to respond. Try again."
        : `Cannot reach the BrainSnack API at ${API_URL}. Is the backend running?`,
      0
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    // The API returns `{ error, fields? }`. Reading `.message` here (as the old
    // client did) meant every failure surfaced as a bare "HTTP 400".
    const message =
      (body && typeof body.error === "string" && body.error) ||
      (body && typeof body.message === "string" && body.message) ||
      `Request failed (${response.status})`;
    throw new ApiError(message, response.status, body?.fields);
  }

  return body as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

// ---------------------------------------------------------------------------
// wire -> view-model mappers

const num = (value: unknown): number => {
  const parsed = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
};

const round = (value: unknown): number => Math.round(num(value));

const mapUser = (row: any): User => ({
  id: row.id,
  username: row.username,
  displayName: row.display_name ?? row.username,
  avatarUrl: row.avatar_url ?? null,
  xp: num(row.xp),
  level: num(row.level),
  streak: num(row.streak),
  personalBest: num(row.personal_best),
  joinedAt: row.created_at ?? "",
  // Present only on GET /users/:id; undefined elsewhere so callers can tell
  // "not followed" apart from "field not provided".
  isFollowing: row.is_following === undefined ? undefined : Boolean(row.is_following),
  isMe: row.is_me === undefined ? undefined : Boolean(row.is_me),
});

const mapTopic = (row: any): Topic => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description ?? null,
  icon: row.icon ?? "📚",
  color: row.color ?? "#6366f1",
  questionCount: row.question_count ?? row.questions_count ?? 0,
  conceptCount: row.concepts_count ?? (Array.isArray(row.concepts) ? row.concepts.length : 0),
  concepts: (row.concepts ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
  })),
  mastery: row.mastery === null || row.mastery === undefined ? null : round(row.mastery),
  accuracy: row.accuracy === null || row.accuracy === undefined ? null : round(row.accuracy),
  questionsAttempted: num(row.questions_attempted),
  difficultyLevel: row.difficulty_level ?? null,
});

const mapQuestion = (row: any): Question => {
  const options: string[] = Array.isArray(row.options) ? row.options : [];
  return {
    id: row.id,
    text: row.text ?? row.question ?? "",
    concept: row.concept ?? row.concept_name ?? null,
    options: options.map((text, index) => ({ id: String(index), text })),
    difficulty: (row.difficulty ?? "medium") as Difficulty,
    // The API only sends these once the question has been graded.
    ...(row.correct_answer !== undefined && row.correct_answer !== null
      ? { correctAnswerId: String(row.correct_answer) }
      : {}),
    ...(row.explanation ? { explanation: row.explanation } : {}),
  };
};

const mapBadge = (row: any): Badge => ({
  id: row.id ?? row.badge_id,
  name: row.name,
  slug: row.slug,
  description: row.description ?? null,
  icon: row.icon ?? "🏆",
  criteriaType: row.criteria_type,
  criteriaValue: num(row.criteria_value),
  ...(row.earned_at ? { earnedAt: row.earned_at } : {}),
  ...(row.progress !== undefined ? { progress: round(row.progress), current: num(row.current) } : {}),
});

const mapXpTransaction = (row: any): XPTransaction => ({
  id: row.id,
  amount: num(row.amount),
  reason: row.reason,
  referenceType: row.reference_type ?? null,
  createdAt: row.created_at,
});

const mapMastery = (row: any): TopicMastery => ({
  topicId: row.topic_id,
  topicName: row.name,
  topicSlug: row.slug,
  topicIcon: row.icon ?? "📚",
  topicColor: row.color ?? "#6366f1",
  accuracy: round(row.accuracy),
  mastery: round(row.mastery_percentage),
  questionsAttempted: num(row.questions_attempted),
  questionsCorrect: num(row.questions_correct),
  difficultyLevel: row.difficulty_level ?? "beginner",
});

const mapHistoryEntry = (row: any): QuizHistoryEntry => ({
  id: row.id,
  topicId: row.topic_id ?? null,
  topicName: row.topic_name ?? null,
  topicIcon: row.topic_icon ?? null,
  difficulty: (row.difficulty ?? "medium") as Difficulty,
  questionCount: num(row.question_count),
  status: row.status,
  score: num(row.score),
  xpEarned: num(row.xp_earned),
  createdAt: row.created_at,
  completedAt: row.completed_at ?? null,
});

const mapPost = (row: any): Post => ({
  id: row.id,
  type: row.type,
  content: typeof row.content === "string" ? safeParse(row.content) : row.content ?? {},
  caption: row.caption ?? null,
  createdAt: row.created_at,
  likesCount: num(row.likes_count),
  likedByUser: Boolean(row.liked_by_user),
  author: {
    id: row.author?.id ?? row.user_id,
    username: row.author?.username ?? row.username,
    displayName: row.author?.displayName ?? row.display_name ?? row.username,
    avatarUrl: row.author?.avatarUrl ?? row.avatar_url ?? null,
    xp: num(row.author?.xp ?? row.xp),
    level: num(row.author?.level ?? row.level),
  },
});

const safeParse = (value: string): Record<string, unknown> => {
  try {
    return JSON.parse(value);
  } catch {
    return { text: value };
  }
};

const mapChallenge = (row: any): Challenge => ({
  id: row.id,
  topicId: row.topic_id ?? null,
  topicName: row.topic_name ?? "General Knowledge",
  topicIcon: row.topic_icon ?? "🧠",
  topicSlug: row.topic_slug ?? null,
  targetScore: num(row.target_score),
  status: row.status,
  createdAt: row.created_at,
  completedAt: row.completed_at ?? null,
  challenger: {
    id: row.challenger?.id ?? row.challenger_id,
    username: row.challenger?.username ?? row.challenger_username,
    displayName: row.challenger?.displayName ?? row.challenger_display_name,
    avatarUrl: row.challenger?.avatarUrl ?? row.challenger_avatar_url ?? null,
    xp: num(row.challenger?.xp ?? row.challenger_xp),
    level: num(row.challenger?.level ?? row.challenger_level),
    streak: num(row.challenger?.streak ?? row.challenger_streak),
    score: row.challenger?.score ?? row.challenger_score ?? null,
  },
  challengee: {
    id: row.challengee?.id ?? row.challengee_id,
    username: row.challengee?.username ?? row.challengee_username,
    displayName: row.challengee?.displayName ?? row.challengee_display_name,
    avatarUrl: row.challengee?.avatarUrl ?? row.challengee_avatar_url ?? null,
    xp: num(row.challengee?.xp ?? row.challengee_xp),
    level: num(row.challengee?.level ?? row.challengee_level),
    streak: num(row.challengee?.streak ?? row.challengee_streak),
    score: row.challengee?.score ?? row.challengee_score ?? null,
  },
  viewerRole: row.viewer_role ?? null,
  viewerScore: row.viewer_score ?? null,
  viewerHasSubmitted: Boolean(row.viewer_has_submitted),
  targetReached: row.target_reached ?? null,
  winnerId: row.winner_id ?? null,
});

const mapLeaderboardEntry = (row: any): LeaderboardEntry => ({
  rank: num(row.rank),
  user: mapUser(row.user ?? row),
  xp: num(row.xp ?? row.board_xp),
  level: num(row.level),
  streak: num(row.streak),
});

const mapQuiz = (row: any): Quiz => ({
  id: row.id,
  topicId: row.topic_id ?? null,
  topicName: row.topic_name ?? "General Knowledge",
  difficulty: (row.difficulty ?? "medium") as Difficulty,
  questionCount: num(row.question_count),
  timePerQuestion: num(row.time_per_question) || 30,
  totalXP: num(row.total_xp),
  source: row.source,
  learnerContext: row.learner_context ?? null,
  questions: (row.questions ?? []).map(mapQuestion),
});

// ---------------------------------------------------------------------------
// endpoints

export const authApi = {
  async register(data: { username: string; email: string; password: string }) {
    const res = await post<{ user: any; token: string }>("/auth/register", data);
    setStoredToken(res.token);
    return mapUser(res.user);
  },
  async login(data: { email: string; password: string }) {
    const res = await post<{ user: any; token: string }>("/auth/login", data);
    setStoredToken(res.token);
    return mapUser(res.user);
  },
  async me() {
    const res = await get<{ user: any }>("/auth/me");
    return mapUser(res.user);
  },
  logout() {
    clearStoredToken();
    return Promise.resolve();
  },
};

export const usersApi = {
  me: () => get<any>("/users/me").then(mapUser),
  get: (id: string) => get<any>(`/users/${id}`).then(mapUser),
  stats: (id: string) =>
    get<any>(`/users/${id}/stats`).then((row) => ({
      quizzesCompleted: num(row.quizzes_completed),
      questionsAnswered: num(row.questions_answered),
      questionsCorrect: num(row.questions_correct),
      accuracy: num(row.accuracy),
      followers: num(row.followers),
      following: num(row.following),
    })),
  search: (query: string): Promise<UserSearchResult[]> =>
    get<any[]>(`/users/search?q=${encodeURIComponent(query)}`).then((rows) =>
      rows.map((row) => ({ ...mapUser(row) }) as UserSearchResult)
    ),
  suggestions: (): Promise<UserSearchResult[]> =>
    get<any[]>("/users/suggestions").then((rows) =>
      rows.map((row) => ({ ...mapUser(row) }) as UserSearchResult)
    ),
  followers: (id: string): Promise<UserSearchResult[]> =>
    get<any[]>(`/users/${id}/followers`).then((rows) =>
      rows.map((row) => ({ ...mapUser(row) }) as UserSearchResult)
    ),
  following: (id: string): Promise<UserSearchResult[]> =>
    get<any[]>(`/users/${id}/following`).then((rows) =>
      rows.map((row) => ({ ...mapUser(row) }) as UserSearchResult)
    ),
  follow: (id: string) => post<{ following: boolean }>(`/users/${id}/follow`).then((r) => r.following),
  unfollow: (id: string) => del<{ following: boolean }>(`/users/${id}/follow`).then((r) => r.following),
};

export const topicsApi = {
  list: (): Promise<Topic[]> => get<any[]>("/topics").then((rows) => rows.map(mapTopic)),
  get: (idOrSlug: string): Promise<Topic> =>
    get<any>(`/topics/${encodeURIComponent(idOrSlug)}`).then(mapTopic),
};

export const quizzesApi = {
  /**
   * Generates and persists a quiz, returning it without the answer key.
   * `difficulty` is omitted to let the adaptive engine choose.
   */
  generate: (params: {
    topicId?: string;
    difficulty?: Difficulty;
    questionCount?: number;
    learnerContext?: string;
  } = {}): Promise<Quiz> => {
    const body: Record<string, unknown> = {};
    if (params.topicId) body.topic_id = params.topicId;
    if (params.difficulty) body.difficulty = params.difficulty;
    if (params.questionCount) body.question_count = params.questionCount;
    if (params.learnerContext?.trim()) body.learner_context = params.learnerContext.trim();
    return post<any>("/quizzes/generate", body).then(mapQuiz);
  },
  get: (id: string): Promise<Quiz> => get<any>(`/quizzes/${id}`).then(mapQuiz),
  history: (): Promise<QuizHistoryEntry[]> =>
    get<any[]>("/quizzes").then((rows) => rows.map(mapHistoryEntry)),
  answer: (
    quizId: string,
    questionId: string,
    selectedOptionId: string,
    timeTaken: number
  ): Promise<GradedAnswer> =>
    post<any>(`/quizzes/${quizId}/answer`, {
      question_id: questionId,
      selected_answer: Number(selectedOptionId),
      time_taken: Math.round(timeTaken),
    }).then((row) => ({
      isCorrect: Boolean(row.is_correct),
      correctAnswerId: String(row.correct_answer),
      explanation: row.explanation ?? null,
      nextQuestionId: row.next_question ?? null,
    })),
  complete: (quizId: string): Promise<QuizResult> =>
    post<any>(`/quizzes/${quizId}/complete`).then((row) => ({
      score: num(row.score),
      correctAnswers: num(row.correct_answers),
      totalQuestions: num(row.total_questions),
      xpEarned: num(row.xp_earned),
      baseXP: num(row.base_xp),
      perfectBonus: num(row.perfect_bonus),
      personalBest: num(row.personal_best),
      streak: row.streak ? { current: num(row.streak.current), longest: num(row.streak.longest) } : null,
      newBadges: (row.new_badges ?? []).map(mapBadge),
      alreadyCompleted: Boolean(row.already_completed),
    })),
};

export const progressApi = {
  get: (): Promise<UserProgress> =>
    get<any>("/progress").then((row) => ({
      totalXP: num(row.total_xp),
      level: num(row.level),
      personalBest: num(row.personal_best),
      xpToNextLevel: row.xp_to_next_level === null ? null : num(row.xp_to_next_level),
      currentStreak: num(row.current_streak),
      longestStreak: num(row.longest_streak),
      streakAlive: Boolean(row.streak_alive),
      quizzesCompleted: num(row.quizzes_completed),
      totalQuestions: num(row.total_questions),
      correctAnswers: num(row.correct_answers),
      overallAccuracy: num(row.overall_accuracy),
      topicProgress: (row.topic_progress ?? []).map(mapMastery),
      weakTopics: (row.weak_topics ?? []).map((t: any) => ({
        topicId: t.topic_id,
        name: t.name,
        slug: t.slug,
        icon: t.icon ?? "📚",
        accuracy: round(t.accuracy),
        questionsAttempted: num(t.questions_attempted),
      })),
      recentActivity: (row.recent_activity ?? []).map(mapXpTransaction),
      recentQuizzes: (row.recent_quizzes ?? []).map(mapHistoryEntry),
      badges: (row.badges ?? []).map(mapBadge),
      lockedBadges: (row.locked_badges ?? []).map(mapBadge),
    })),
  topics: (): Promise<TopicMastery[]> =>
    get<any[]>("/progress/topics").then((rows) => rows.map(mapMastery)),
};

export const leaderboardApi = {
  get: (params: { type?: "daily" | "weekly" | "alltime"; topicId?: string } = {}): Promise<Leaderboard> => {
    const search = new URLSearchParams();
    search.set("type", params.type ?? "alltime");
    if (params.topicId) search.set("topic_id", params.topicId);
    return get<any>(`/leaderboard?${search.toString()}`).then((row) => ({
      entries: (row.leaderboard ?? []).map(mapLeaderboardEntry),
      myRank: row.userRank ? mapLeaderboardEntry(row.userRank) : null,
      type: row.type ?? params.type ?? "alltime",
    }));
  },
  streaks: (): Promise<StreakEntry[]> =>
    get<any[]>("/leaderboard/streaks").then((rows) =>
      rows.map((row, index) => ({
        rank: num(row.rank) || index + 1,
        id: row.id,
        username: row.username,
        displayName: row.display_name ?? row.username,
        avatarUrl: row.avatar_url ?? null,
        xp: num(row.xp),
        level: num(row.level),
        currentStreak: num(row.current_streak),
        longestStreak: num(row.longest_streak),
      }))
    ),
};

export const postsApi = {
  feed: (limit = 20, scope: "discover" | "following" = "discover"): Promise<Post[]> =>
    get<any[]>(`/posts?limit=${limit}&scope=${scope}`).then((rows) => rows.map(mapPost)),
  mine: (): Promise<Post[]> => get<any[]>("/posts/mine").then((rows) => rows.map(mapPost)),
  create: (data: {
    caption: string;
    type?: Post["type"];
    content?: Record<string, unknown>;
  }): Promise<Post> =>
    post<any>("/posts", {
      type: data.type ?? "general",
      caption: data.caption,
      content: data.content,
    }).then(mapPost),
  like: (id: string): Promise<{ liked: boolean; likesCount: number }> =>
    post<any>(`/posts/${id}/like`).then((r) => ({
      liked: Boolean(r.liked),
      likesCount: num(r.likes_count),
    })),
  unlike: (id: string): Promise<{ liked: boolean; likesCount: number }> =>
    del<any>(`/posts/${id}/like`).then((r) => ({
      liked: Boolean(r.liked),
      likesCount: num(r.likes_count),
    })),
  remove: (id: string) => del<{ message: string }>(`/posts/${id}`),
};

export const challengesApi = {
  list: (): Promise<Challenge[]> => get<any[]>("/challenges").then((rows) => rows.map(mapChallenge)),
  create: (data: { challengeeId: string; topicId?: string; targetScore?: number }): Promise<Challenge> =>
    post<any>("/challenges", {
      challengee_id: data.challengeeId,
      topic_id: data.topicId,
      target_score: data.targetScore,
    }).then(mapChallenge),
  accept: (id: string): Promise<Challenge> => post<any>(`/challenges/${id}/accept`).then(mapChallenge),
  decline: (id: string) => post<{ status: string }>(`/challenges/${id}/decline`),
  /** Submit a completed quiz as your challenge score. */
  submit: (id: string, quizId: string) =>
    post<any>(`/challenges/${id}/submit`, { quiz_id: quizId }).then((row) => ({
      challenge: mapChallenge(row.challenge ?? row),
      result: row.result ?? "waiting_for_opponent",
      winnerId: row.winner_id ?? null,
      yourScore: row.your_score ?? null,
      targetScore: row.target_score ?? null,
      targetReached: row.target_reached ?? null,
    })),
};

export interface SystemStatus {
  status: "ok" | "degraded";
  database: { ok: boolean; error?: string };
  ai_service: { reachable: boolean; provider?: string; detail?: string };
}

export const systemApi = {
  /** Lets the app label quiz sources honestly: "AI" vs "local bank". */
  status: (): Promise<SystemStatus | null> => get<any>("/status").catch(() => null),
};

export type { Badge, TopicMastery };
