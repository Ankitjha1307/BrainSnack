// BrainSnack Type Definitions

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak: number;
  last_active: string | null;
  personal_best: number;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak: number;
  personal_best: number;
  created_at: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string | null;
  created_at: string;
}

export interface Concept {
  id: string;
  topic_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  topic_id: string;
  concept_id: string | null;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  topic_id: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  question_count: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  xp_earned: number;
  score: number;
  created_at: string;
  completed_at: string | null;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  question_id: string;
  selected_answer: number | null;
  is_correct: boolean;
  time_taken: number;
  created_at: string;
}

export interface LearnerTopicProgress {
  id: string;
  user_id: string;
  topic_id: string;
  accuracy: number;
  questions_attempted: number;
  questions_correct: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  mastery_percentage: number;
  updated_at: string;
}

export interface LearnerConceptProgress {
  id: string;
  user_id: string;
  concept_id: string;
  accuracy: number;
  questions_attempted: number;
  questions_correct: number;
  mastery_percentage: number;
  updated_at: string;
}

export interface XpTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  criteria_type: 'xp' | 'streak' | 'quiz_count' | 'perfect_score' | 'topic_mastery' | 'level';
  criteria_value: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface Follow {
  id: string;
  follower_id: string;
  followee_id: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  type: 'achievement' | 'badge' | 'streak' | 'challenge' | 'general';
  content: Record<string, any>;
  caption: string | null;
  created_at: string;
  user?: UserPublic;
  likes_count?: number;
  liked_by_user?: boolean;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  challenger_id: string;
  challengee_id: string;
  topic_id: string | null;
  target_score: number;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  challenger_score: number | null;
  challengee_score: number | null;
  created_at: string;
  completed_at: string | null;
  challenger?: UserPublic;
  challengee?: UserPublic;
  topic?: Topic;
}

// API Request/Response types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  display_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
}

export interface GenerateQuizRequest {
  topic_id?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  question_count?: number;
  learner_context?: string;
}

export interface SubmitAttemptRequest {
  question_id: string;
  selected_answer: number;
  time_taken?: number;
}

export interface SubmitAnswerRequest {
  quiz_id: string;
  question_id: string;
  selected_answer: number;
  time_taken?: number;
}

export interface CreatePostRequest {
  type: 'achievement' | 'badge' | 'streak' | 'challenge' | 'general';
  content: Record<string, any>;
  caption?: string;
}

export interface CreateChallengeRequest {
  challengee_id: string;
  topic_id?: string;
  target_score?: number;
}

export interface CompleteChallengeRequest {
  score: number;
}

// AI Service types
export interface AIGenerateQuizRequest {
  // Mirrors ai-service/app/models/schemas.py::QuizRequest
  topic: string;
  question_count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  weak_concepts?: string[];
  recent_mistakes?: string[];
  user_performance?: Record<string, unknown>;
}

export interface AIQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  concept?: string;
}

export interface AIGenerateQuizResponse {
  questions: AIQuestion[];
  topic_id?: string;
}

export interface AIValidateQuestionRequest {
  // Mirrors ai-service/app/models/schemas.py::QuestionValidationRequest
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIValidateQuestionResponse {
  valid: boolean;
  issues?: string[];
  suggestions?: string[];
}

export interface AIAdaptiveRecommendationRequest {
  // Mirrors ai-service/app/models/schemas.py::AdaptiveRecommendationRequest
  user_id: string;
  recent_performance: Array<Record<string, unknown>>;
  topic_mastery: Record<string, number>;
  weak_concepts: string[];
  current_difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIAdaptiveRecommendationResponse {
  recommended_difficulty: 'easy' | 'medium' | 'hard';
  recommended_topics: string[];
  reason: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  user: UserPublic;
  xp: number;
  level: number;
  streak: number;
  rank: number;
}

// Progress types
export interface UserProgress {
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  quizzes_completed: number;
  total_questions: number;
  correct_answers: number;
  overall_accuracy: number;
  topic_progress: TopicProgressSummary[];
  recent_activity: XpTransaction[];
  badges: UserBadge[];
}

export interface TopicProgressSummary {
  topic: Topic;
  accuracy: number;
  questions_attempted: number;
  questions_correct: number;
  mastery_percentage: number;
  difficulty_level: string;
}

// Express extensions
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

// XP values
export const XP_VALUES = {
  easy: 10,
  medium: 20,
  hard: 30,
} as const;

// Level thresholds (XP needed for each level)
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 6800, 8000, 9300, 10700, 12200, 13800, 15500, 17300,
];
