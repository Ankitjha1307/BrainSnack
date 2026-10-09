import { Router, Request, Response } from 'express';
import {
  generateQuizRaw,
  getAdaptiveRecommendationForRequest,
  validateQuestionWithAI,
  getAIStatus,
  getProvider,
} from '../services/ai';
import {
  AdaptiveRecommendationRequest,
  Difficulty,
  QuestionValidationRequest,
  QuizRequest,
} from '../services/ai/types';

const router = Router();

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const isDifficulty = (value: unknown): value is Difficulty =>
  typeof value === 'string' && (DIFFICULTIES as string[]).includes(value);

/**
 * These three routes mirror the standalone FastAPI service's surface
 * (`POST /generate-quiz`, `/validate-question`, `/adaptive-recommendation`).
 * AI now runs in-process, so they are thin wrappers over the shared provider.
 *
 * They are intentionally unauthenticated, matching the old service: they are
 * developer/tooling endpoints, and the product UI reaches AI through
 * `/api/quizzes/generate` (which is authenticated and persists its output).
 */

/** GET /api/ai/health - which provider is live, and why. */
router.get('/health', async (_req: Request, res: Response) => {
  const status = await getAIStatus();
  return res.json(status);
});

/** POST /api/ai/generate-quiz */
router.post('/generate-quiz', async (req: Request, res: Response) => {
  try {
    const body = (req.body ?? {}) as Partial<QuizRequest>;

    const topic = typeof body.topic === 'string' && body.topic.trim() ? body.topic.trim() : '';
    if (!topic) {
      return res.status(400).json({ error: 'topic is required' });
    }

    const requestedCount = Number(body.question_count ?? 5);
    const questionCount = Number.isFinite(requestedCount)
      ? Math.min(Math.max(Math.trunc(requestedCount), 1), 20)
      : 5;

    const difficulty: Difficulty = isDifficulty(body.difficulty) ? body.difficulty : 'medium';

    const request: QuizRequest = {
      topic,
      question_count: questionCount,
      difficulty,
      weak_concepts: Array.isArray(body.weak_concepts) ? body.weak_concepts : [],
      recent_mistakes: Array.isArray(body.recent_mistakes) ? body.recent_mistakes : [],
      user_performance: body.user_performance,
    };

    const response = await generateQuizRaw(request);
    return res.json({ questions: response.questions, provider: getProvider().name });
  } catch (error) {
    console.error('AI generate-quiz error:', error);
    return res.status(500).json({ error: 'Could not generate questions' });
  }
});

/** POST /api/ai/validate-question */
router.post('/validate-question', async (req: Request, res: Response) => {
  try {
    const body = (req.body ?? {}) as Partial<QuestionValidationRequest>;

    if (typeof body.question !== 'string' || !Array.isArray(body.options)) {
      return res.status(400).json({ error: 'question and options are required' });
    }

    const result = await validateQuestionWithAI(
      body.question,
      body.options,
      Number(body.correctAnswer ?? 0),
      {
        explanation: body.explanation,
        concept: body.concept,
        difficulty: isDifficulty(body.difficulty) ? body.difficulty : undefined,
      }
    );

    return res.json({ ...result, provider: getProvider().name });
  } catch (error) {
    console.error('AI validate-question error:', error);
    return res.status(500).json({ error: 'Could not validate the question' });
  }
});

/** POST /api/ai/adaptive-recommendation */
router.post('/adaptive-recommendation', async (req: Request, res: Response) => {
  try {
    const body = (req.body ?? {}) as Partial<AdaptiveRecommendationRequest>;

    const request: AdaptiveRecommendationRequest = {
      user_id: String(body.user_id ?? 'anonymous'),
      recent_performance: Array.isArray(body.recent_performance)
        ? body.recent_performance
        : [],
      topic_mastery:
        body.topic_mastery && typeof body.topic_mastery === 'object'
          ? body.topic_mastery
          : {},
      weak_concepts: Array.isArray(body.weak_concepts) ? body.weak_concepts : [],
      current_difficulty: isDifficulty(body.current_difficulty)
        ? body.current_difficulty
        : 'medium',
    };

    const response = await getAdaptiveRecommendationForRequest(request);
    return res.json({ ...response, provider: getProvider().name });
  } catch (error) {
    console.error('AI adaptive-recommendation error:', error);
    return res.status(500).json({ error: 'Could not produce a recommendation' });
  }
});

export default router;
