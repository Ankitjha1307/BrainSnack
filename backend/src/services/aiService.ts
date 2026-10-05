import { config } from '../config/index';
import { query } from '../db';
import {
  AIQuestion,
  AIValidateQuestionResponse,
  AIAdaptiveRecommendationResponse,
  Question,
} from '../types';

const AI_BASE_URL = config.aiService.url;

type Difficulty = 'easy' | 'medium' | 'hard';

/** Shape the Python service actually accepts (see ai-service/app/models/schemas.py). */
interface AIQuizServiceRequest {
  topic: string;
  question_count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  weak_concepts: string[];
  recent_mistakes: string[];
  user_performance?: Record<string, unknown>;
}

interface AIQuestionService {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIStatus {
  reachable: boolean;
  provider?: string;
  detail?: string;
}

async function callAIEndpoint<T>(endpoint: string, data: unknown): Promise<T | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.aiService.timeout);

  try {
    const response = await fetch(`${AI_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Surface the body: a 422 here means our payload no longer matches the
      // AI service schema, which used to fail silently into the fallback.
      const body = await response.text().catch(() => '');
      console.warn(
        `[ai] ${endpoint} -> ${response.status} ${response.statusText}${body ? ` | ${body.slice(0, 300)}` : ''}`
      );
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[ai] ${endpoint} unreachable: ${reason}`);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Cheap liveness probe so the demo can show whether AI is actually wired up. */
export const getAIStatus = async (): Promise<AIStatus> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(`${AI_BASE_URL}/health`, { signal: controller.signal });
    if (!response.ok) {
      return { reachable: false, detail: `health check returned ${response.status}` };
    }
    const body = (await response.json()) as { provider?: string };
    return { reachable: true, provider: body.provider };
  } catch (error) {
    return {
      reachable: false,
      detail: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Generate questions for a topic.
 *
 * Tries the AI service first (Gemini or the mock provider), then falls back to
 * the seeded question bank in Postgres. Always returns a usable list or throws.
 */
export const generateQuizWithAI = async (
  userId: string,
  topic: { id: string; name: string; slug: string } | null,
  difficulty: 'easy' | 'medium' | 'hard',
  questionCount: number,
  excludeQuestionIds: string[] = []
): Promise<{ questions: AIQuestion[]; source: 'ai' | 'bank' }> => {
  // Adaptive signals: which topics the learner is weakest in, and which
  // questions they have already got wrong (both feed the AI prompt and the
  // mock provider's ranking).
  const [weakTopicsResult, mistakesResult, accuracyResult] = await Promise.all([
    query<{ name: string }>(
      `SELECT t.name
       FROM learner_topic_progress ltp
       JOIN topics t ON ltp.topic_id = t.id
       WHERE ltp.user_id = $1 AND ltp.questions_attempted > 0
       ORDER BY ltp.accuracy ASC
       LIMIT 3`,
      [userId]
    ),
    query<{ question: string }>(
      `SELECT q.question
       FROM quiz_attempts qa
       JOIN questions q ON qa.question_id = q.id
       JOIN quizzes qu ON qa.quiz_id = qu.id
       WHERE qu.user_id = $1 AND qa.is_correct = FALSE
       ORDER BY qa.created_at DESC
       LIMIT 5`,
      [userId]
    ),
    query<{ accuracy: string; avg_time: string }>(
      `SELECT
         COALESCE(AVG(CASE WHEN qa.is_correct THEN 100 ELSE 0 END), 0)::text AS accuracy,
         COALESCE(AVG(qa.time_taken), 0)::text AS avg_time
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE q.user_id = $1 AND q.created_at > NOW() - INTERVAL '30 days'`,
      [userId]
    ),
  ]);

  const request: AIQuizServiceRequest = {
    // The AI service keys its question bank off the topic slug/name, not a UUID.
    topic: topic ? topic.slug : 'general-knowledge',
    question_count: questionCount,
    difficulty,
    weak_concepts: weakTopicsResult.rows.map((r) => r.name),
    recent_mistakes: mistakesResult.rows.map((r) => r.question),
    user_performance: {
      accuracy: Math.round(parseFloat(accuracyResult.rows[0]?.accuracy ?? '0')),
      avg_time: Math.round(parseFloat(accuracyResult.rows[0]?.avg_time ?? '0')),
    },
  };

  const response = await callAIEndpoint<{ quiz?: { questions?: AIQuestionService[] } }>(
    '/generate-quiz',
    request
  );

  const aiQuestions = (response?.quiz?.questions ?? [])
    .filter((q) => Array.isArray(q.options) && q.options.length >= 2 && typeof q.correctAnswer === 'number')
    .filter((q) => q.correctAnswer >= 0 && q.correctAnswer < q.options.length)
    .slice(0, questionCount)
    .map<AIQuestion>((q) => ({
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer,
      explanation: q.explanation ?? '',
      difficulty: q.difficulty ?? difficulty,
      concept: q.concept ?? '',
    }));

  if (aiQuestions.length > 0) {
    // Run every AI-authored question past the validator before it reaches a
    // learner. A structurally broken question (duplicate options, empty
    // explanation, out-of-range key) is dropped rather than served.
    const validated = await filterValidQuestions(aiQuestions);
    if (validated.length > 0) {
      return { questions: validated, source: 'ai' };
    }
    console.warn('[ai] all generated questions failed validation; using local bank');
  }

  const bankQuestions = await getLocalQuestions(topic?.id, difficulty, questionCount, excludeQuestionIds);
  return { questions: bankQuestions, source: 'bank' };
};

/**
 * Ask the AI service to score each question's structure, keeping the good ones.
 * If the validator is unreachable every question is kept - a broken validator
 * should not take the whole quiz down.
 */
const filterValidQuestions = async (questions: AIQuestion[]): Promise<AIQuestion[]> => {
  const results = await Promise.all(
    questions.map(async (q) => {
      const verdict = await validateQuestionWithAI(q.question, q.options, q.correct_answer, {
        explanation: q.explanation,
        concept: q.concept ?? '',
        difficulty: q.difficulty,
      });
      return { question: q, verdict };
    })
  );

  const kept = results.filter((r) => r.verdict.valid).map((r) => r.question);
  const rejected = results.filter((r) => !r.verdict.valid);

  if (rejected.length > 0) {
    console.warn(
      `[ai] dropped ${rejected.length} question(s): ${rejected
        .map((r) => (r.verdict.issues ?? []).join('; ') || 'failed validation')
        .join(' | ')}`
    );
  }

  return kept;
};

export const validateQuestionWithAI = async (
  question: string,
  options: string[],
  correctAnswer: number,
  context: { explanation?: string; concept?: string; difficulty?: Difficulty } = {}
): Promise<AIValidateQuestionResponse> => {
  const response = await callAIEndpoint<{
    is_valid?: boolean;
    score?: number;
    feedback?: string;
    issues?: string[];
  }>('/validate-question', {
    question,
    options,
    correctAnswer,
    explanation: context.explanation ?? '',
    concept: context.concept ?? '',
    difficulty: context.difficulty ?? 'medium',
  });

  if (response && typeof response.is_valid === 'boolean') {
    return {
      valid: response.is_valid,
      issues: response.issues ?? [],
      suggestions: response.feedback ? [response.feedback] : [],
    };
  }

  // Validator unavailable: fall back to local structural checks.
  const localIssues: string[] = [];
  if (question.trim().length < 10) localIssues.push('Question is too short');
  if (options.length < 2) localIssues.push('Needs at least 2 options');
  if (new Set(options).size !== options.length) localIssues.push('Options contain duplicates');
  if (correctAnswer < 0 || correctAnswer >= options.length) localIssues.push('Correct answer index is out of range');

  return { valid: localIssues.length === 0, issues: localIssues };
};

export const getAdaptiveRecommendation = async (
  userId: string
): Promise<AIAdaptiveRecommendationResponse> => {
  const [scoresResult, topicsResult, weakestConceptResult] = await Promise.all([
    query<{ score: number }>(
      `SELECT score FROM quizzes
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY completed_at DESC
       LIMIT 10`,
      [userId]
    ),
    query<{ name: string; accuracy: string }>(
      `SELECT t.name, ltp.accuracy
       FROM learner_topic_progress ltp
       JOIN topics t ON ltp.topic_id = t.id
       WHERE ltp.user_id = $1`,
      [userId]
    ),
    query<{ name: string }>(
      `SELECT c.name
       FROM learner_concept_progress lcp
       JOIN concepts c ON lcp.concept_id = c.id
       WHERE lcp.user_id = $1 AND lcp.questions_attempted > 0
       ORDER BY lcp.accuracy ASC
       LIMIT 5`,
      [userId]
    ),
  ]);

  const topicMastery: Record<string, number> = {};
  topicsResult.rows.forEach((row) => {
    topicMastery[row.name] = parseFloat(row.accuracy);
  });

  const weakConcepts = weakestConceptResult.rows.map((r) => r.name);

  const response = await callAIEndpoint<{
    recommended_topic?: string;
    recommended_difficulty?: 'easy' | 'medium' | 'hard';
    focus_concepts?: string[];
    reason?: string;
  }>('/adaptive-recommendation', {
    user_id: userId,
    recent_performance: scoresResult.rows.map((r) => ({ correct: r.score >= 70, score: r.score })),
    topic_mastery: topicMastery,
    weak_concepts: weakConcepts,
    current_difficulty: 'medium',
  });

  if (response?.recommended_difficulty) {
    return {
      recommended_difficulty: response.recommended_difficulty,
      recommended_topics: response.recommended_topic
        ? [response.recommended_topic, ...(response.focus_concepts ?? [])]
        : [],
      reason: response.reason ?? '',
    };
  }

  // Local fallback: same thresholds the quiz difficulty picker uses.
  const scores = scoresResult.rows.map((r) => parseFloat(String(r.score)));
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const recommendedDifficulty: 'easy' | 'medium' | 'hard' =
    avgScore >= 85 ? 'hard' : avgScore >= 60 ? 'medium' : 'easy';

  const sortedTopics = Object.entries(topicMastery).sort((a, b) => a[1] - b[1]);
  const recommendedTopics = sortedTopics.slice(0, 3).map(([name]) => name);

  return {
    recommended_difficulty: recommendedDifficulty,
    recommended_topics: recommendedTopics.length > 0 ? recommendedTopics : ['General Knowledge'],
    reason: scores.length
      ? `Based on your average score of ${avgScore.toFixed(0)}% over your last ${scores.length} quizzes, ${recommendedDifficulty} difficulty will keep you in the flow.`
      : 'Finish your first quiz and BrainSnack will tune this to your level.',
  };
};

/** Fallback: draw questions from the seeded bank, avoiding ones already served. */
const getLocalQuestions = async (
  topicId?: string,
  difficulty?: 'easy' | 'medium' | 'hard',
  count: number = 5,
  excludeQuestionIds: string[] = []
): Promise<AIQuestion[]> => {
  let sql = `
    SELECT id, question, options, correct_answer, explanation, difficulty, concept_id
    FROM questions
    WHERE 1=1
  `;
  const params: unknown[] = [];
  let paramIndex = 1;

  if (topicId) {
    sql += ` AND topic_id = $${paramIndex++}`;
    params.push(topicId);
  }

  if (difficulty) {
    // Pull the requested difficulty plus its neighbours so a learner at the
    // edge of their ability still gets a full-length quiz.
    sql += ` AND difficulty = ANY($${paramIndex++})`;
    const ladder = { easy: ['easy', 'medium'], medium: ['medium', 'easy', 'hard'], hard: ['hard', 'medium'] }[
      difficulty
    ];
    params.push(ladder);
  }

  if (excludeQuestionIds.length > 0) {
    sql += ` AND NOT (id = ANY($${paramIndex++}))`;
    params.push(excludeQuestionIds);
  }

  sql += ` ORDER BY RANDOM() LIMIT $${paramIndex++}`;
  params.push(count);

  const result = await query<Question>(sql, params);

  return result.rows.map((q) => ({
    question: q.question,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation || '',
    difficulty: q.difficulty,
    concept: q.concept_id || '',
  }));
};

export const aiService = {
  generateQuizWithAI,
  validateQuestionWithAI,
  getAdaptiveRecommendation,
  getAIStatus,
};
