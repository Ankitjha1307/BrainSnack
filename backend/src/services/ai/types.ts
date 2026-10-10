/**
 * Shared AI types.
 *
 * These mirror the request/response shapes the old standalone FastAPI service
 * exposed (`ai-service/app/models/schemas.py`), so the ported mock and Gemini
 * providers stay drop-in compatible with the REST layer that used to call out
 * over HTTP.
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizRequest {
  topic: string;
  question_count: number;
  difficulty: Difficulty;
  weak_concepts: string[];
  recent_mistakes: string[];
  user_performance?: Record<string, unknown>;
  learner_context?: string;
}

/** A question as a provider produces it (camelCase `correctAnswer`, like the Python service). */
export interface ProviderQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  concept: string;
  difficulty: Difficulty;
}

export interface QuizResponse {
  questions: ProviderQuestion[];
}

export interface QuestionValidationRequest {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  concept?: string;
  difficulty?: Difficulty;
}

export interface QuestionValidationResult {
  valid: boolean;
  score: number;
  feedback: string;
  issues: string[];
  suggestions: string[];
}

export interface AdaptiveRecommendationRequest {
  user_id: string;
  recent_performance: Array<Record<string, unknown>>;
  topic_mastery: Record<string, number>;
  weak_concepts: string[];
  current_difficulty: Difficulty;
}

export interface AdaptiveRecommendationResult {
  recommended_topic: string;
  recommended_difficulty: Difficulty;
  focus_concepts: string[];
  reason: string;
}

export interface AIProvider {
  readonly name: 'mock' | 'gemini';
  generateQuiz(request: QuizRequest): Promise<QuizResponse>;
  validateQuestion(request: QuestionValidationRequest): Promise<QuestionValidationResult>;
  getAdaptiveRecommendation(
    request: AdaptiveRecommendationRequest
  ): Promise<AdaptiveRecommendationResult>;
}
