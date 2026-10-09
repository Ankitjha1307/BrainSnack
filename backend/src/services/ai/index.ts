import { config } from '../../config/index';
import { Question, Quiz, QuizAttempt, LearnerTopicProgress, LearnerConceptProgress } from '../../models';
import {
  AIQuestion,
  AIValidateQuestionResponse,
  AIAdaptiveRecommendationResponse,
} from '../../types';
import { getProvider, getProviderDetail } from './providers';
import {
  AdaptiveRecommendationRequest,
  AdaptiveRecommendationResult,
  Difficulty,
  QuestionValidationRequest,
  QuizRequest,
  QuizResponse,
} from './types';

export interface AIStatus {
  reachable: boolean;
  provider?: string;
  detail?: string;
}

/**
 * Liveness for the in-process provider.
 *
 * There is no separate service to poll any more; the provider is always
 * "reachable" as long as the process is up. `provider` tells the app which
 * implementation is actually answering (gemini vs the local mock bank).
 */
export const getAIStatus = async (): Promise<AIStatus> => ({
  reachable: true,
  provider: getProvider().name,
  detail: getProviderDetail(),
});

// ---------------------------------------------------------------------------
// Quiz generation
// ---------------------------------------------------------------------------

/**
 * Generate questions for a topic.
 *
 * Tries the configured provider first (Gemini or the mock bank), then falls
 * back to the seeded question bank in MongoDB. Always returns a usable list.
 */
export const generateQuizWithAI = async (
  userId: string,
  topic: { id: string; name: string; slug: string } | null,
  difficulty: Difficulty,
  questionCount: number,
  excludeQuestionIds: string[] = []
): Promise<{ questions: AIQuestion[]; source: 'ai' | 'bank' }> => {
  const [weakTopics, mistakes, performance] = await Promise.all([
    LearnerTopicProgress.aggregate([
      { $match: { user_id: userId, questions_attempted: { $gt: 0 } } },
      { $sort: { accuracy: 1 } },
      { $limit: 3 },
      { $lookup: { from: 'topics', localField: 'topic_id', foreignField: '_id', as: 'topic' } },
      { $unwind: '$topic' },
      { $project: { _id: 0, name: '$topic.name' } },
    ]),
    QuizAttempt.aggregate([
      { $match: { is_correct: false } },
      { $lookup: { from: 'quizzes', localField: 'quiz_id', foreignField: '_id', as: 'quiz' } },
      { $unwind: '$quiz' },
      { $match: { 'quiz.user_id': userId } },
      { $sort: { created_at: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'questions', localField: 'question_id', foreignField: '_id', as: 'question' } },
      { $unwind: '$question' },
      { $project: { _id: 0, question: '$question.question' } },
    ]),
    QuizAttempt.aggregate([
      { $lookup: { from: 'quizzes', localField: 'quiz_id', foreignField: '_id', as: 'quiz' } },
      { $unwind: '$quiz' },
      {
        $match: {
          'quiz.user_id': userId,
          'quiz.created_at': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: null,
          accuracy: { $avg: { $cond: ['$is_correct', 100, 0] } },
          avg_time: { $avg: '$time_taken' },
        },
      },
    ]),
  ]);

  const request: QuizRequest = {
    // The provider keys its question bank off the topic slug/name, not a UUID.
    topic: topic ? topic.slug : 'general-knowledge',
    question_count: questionCount,
    difficulty,
    weak_concepts: weakTopics.map((r: any) => r.name),
    recent_mistakes: mistakes.map((r: any) => r.question),
    user_performance: {
      accuracy: Math.round(performance[0]?.accuracy ?? 0),
      avg_time: Math.round(performance[0]?.avg_time ?? 0),
    },
  };

  try {
    const response = await getProvider().generateQuiz(request);
    const aiQuestions = (response.questions ?? [])
      .filter(
        (q) =>
          Array.isArray(q.options) && q.options.length >= 2 && typeof q.correctAnswer === 'number'
      )
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
      // Run every generated question past the validator before it reaches a
      // learner. A structurally broken question is dropped, not served.
      const validated = await filterValidQuestions(aiQuestions);
      if (validated.length > 0) {
        return { questions: validated, source: 'ai' };
      }
      console.warn('[ai] all generated questions failed validation; using local bank');
    }
  } catch (error) {
    console.warn(
      `[ai] provider "${getProvider().name}" failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }

  const bankQuestions = await getLocalQuestions(
    topic?.id,
    difficulty,
    questionCount,
    excludeQuestionIds
  );
  return { questions: bankQuestions, source: 'bank' };
};

/**
 * Ask the provider to score each question's structure, keeping the good ones.
 * If validation itself fails every question is kept - a broken validator should
 * not take the whole quiz down.
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
  const request: QuestionValidationRequest = {
    question,
    options,
    correctAnswer,
    explanation: context.explanation ?? '',
    concept: context.concept ?? '',
    difficulty: context.difficulty ?? 'medium',
  };

  try {
    const result = await getProvider().validateQuestion(request);
    return {
      valid: result.valid,
      issues: result.issues ?? [],
      suggestions: result.suggestions ?? [],
    };
  } catch (error) {
    // Validator unavailable: fall back to local structural checks.
    const localIssues: string[] = [];
    if (question.trim().length < 10) localIssues.push('Question is too short');
    if (options.length < 2) localIssues.push('Needs at least 2 options');
    if (new Set(options).size !== options.length) localIssues.push('Options contain duplicates');
    if (correctAnswer < 0 || correctAnswer >= options.length)
      localIssues.push('Correct answer index is out of range');
    return { valid: localIssues.length === 0, issues: localIssues };
  }
};

// ---------------------------------------------------------------------------
// Adaptive recommendations
// ---------------------------------------------------------------------------

export const getAdaptiveRecommendation = async (
  userId: string
): Promise<AIAdaptiveRecommendationResponse> => {
  const [scores, topics, weakestConcepts] = await Promise.all([
    Quiz.find({ user_id: userId, status: 'completed' })
      .sort({ completed_at: -1 })
      .limit(10)
      .select('score')
      .lean(),
    LearnerTopicProgress.aggregate([
      { $match: { user_id: userId } },
      { $lookup: { from: 'topics', localField: 'topic_id', foreignField: '_id', as: 'topic' } },
      { $unwind: '$topic' },
      { $project: { _id: 0, name: '$topic.name', accuracy: 1 } },
    ]),
    LearnerConceptProgress.aggregate([
      { $match: { user_id: userId, questions_attempted: { $gt: 0 } } },
      { $sort: { accuracy: 1 } },
      { $limit: 5 },
      { $lookup: { from: 'concepts', localField: 'concept_id', foreignField: '_id', as: 'concept' } },
      { $unwind: '$concept' },
      { $project: { _id: 0, name: '$concept.name' } },
    ]),
  ]);

  const topicMastery: Record<string, number> = {};
  topics.forEach((row: any) => {
    topicMastery[row.name] = row.accuracy ?? 0;
  });

  const weakConcepts = weakestConcepts.map((r: any) => r.name);

  const request: AdaptiveRecommendationRequest = {
    user_id: userId,
    recent_performance: scores.map((r: any) => ({ correct: r.score >= 70, score: r.score })),
    topic_mastery: topicMastery,
    weak_concepts: weakConcepts,
    current_difficulty: 'medium',
  };

  try {
    const response = await getProvider().getAdaptiveRecommendation(request);
    return {
      recommended_difficulty: response.recommended_difficulty,
      recommended_topics: response.recommended_topic
        ? [response.recommended_topic, ...(response.focus_concepts ?? [])]
        : [],
      reason: response.reason ?? '',
    };
  } catch (error) {
    console.warn(
      `[ai] adaptive recommendation failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }

  // Local fallback: same thresholds the quiz difficulty picker uses.
  const scoreValues = scores.map((r: any) => Number(r.score));
  const avgScore =
    scoreValues.length > 0 ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length : 0;

  const recommendedDifficulty: Difficulty =
    avgScore >= 85 ? 'hard' : avgScore >= 60 ? 'medium' : 'easy';

  const sortedTopics = Object.entries(topicMastery).sort((a, b) => a[1] - b[1]);
  const recommendedTopics = sortedTopics.slice(0, 3).map(([name]) => name);

  return {
    recommended_difficulty: recommendedDifficulty,
    recommended_topics: recommendedTopics.length > 0 ? recommendedTopics : ['General Knowledge'],
    reason: scoreValues.length
      ? `Based on your average score of ${avgScore.toFixed(0)}% over your last ${scoreValues.length} quizzes, ${recommendedDifficulty} difficulty will keep you in the flow.`
      : 'Finish your first quiz and BrainSnack will tune this to your level.',
  };
};

/** Fallback: draw questions from the seeded bank, avoiding ones already served. */
const getLocalQuestions = async (
  topicId?: string,
  difficulty?: Difficulty,
  count: number = 5,
  excludeQuestionIds: string[] = []
): Promise<AIQuestion[]> => {
  const match: Record<string, unknown> = {};
  if (topicId) match.topic_id = topicId;

  if (difficulty) {
    // Pull the requested difficulty plus its neighbours so a learner at the
    // edge of their ability still gets a full-length quiz.
    const ladder: Record<Difficulty, Difficulty[]> = {
      easy: ['easy', 'medium'],
      medium: ['medium', 'easy', 'hard'],
      hard: ['hard', 'medium'],
    };
    match.difficulty = { $in: ladder[difficulty] };
  }

  if (excludeQuestionIds.length > 0) match._id = { $nin: excludeQuestionIds };

  const rows = await Question.aggregate([
    { $match: match },
    { $sample: { size: count } },
    { $lookup: { from: 'concepts', localField: 'concept_id', foreignField: '_id', as: 'concept' } },
    { $unwind: { path: '$concept', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        question: 1,
        options: 1,
        correct_answer: 1,
        explanation: 1,
        difficulty: 1,
        concept: '$concept.name',
      },
    },
  ]);

  return rows.map((q: any) => ({
    question: q.question,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation || '',
    difficulty: q.difficulty,
    concept: q.concept || '',
  }));
};

// ---------------------------------------------------------------------------
// Raw provider access (used by the /api/ai REST surface)
// ---------------------------------------------------------------------------

export const generateQuizRaw = async (request: QuizRequest): Promise<QuizResponse> =>
  getProvider().generateQuiz(request);

export const getAdaptiveRecommendationForRequest = async (
  request: AdaptiveRecommendationRequest
): Promise<AdaptiveRecommendationResult> => getProvider().getAdaptiveRecommendation(request);

export { getProvider };

export const aiService = {
  generateQuizWithAI,
  validateQuestionWithAI,
  getAdaptiveRecommendation,
  getAIStatus,
};
