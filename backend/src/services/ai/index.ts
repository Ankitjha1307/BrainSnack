
import { config } from '../../config/index';
import {
  Question,
  Quiz,
  QuizAttempt,
  LearnerTopicProgress,
  LearnerConceptProgress,
} from '../../models';
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
 * Liveness for the in-process AI provider.
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
 * Uses the configured AI provider first. If the AI returns an invalid,
 * incomplete, or wrong-difficulty quiz, the MongoDB question bank is used.
 */
export const generateQuizWithAI = async (
  userId: string,
  topic: { id: string; name: string; slug: string } | null,
  difficulty: Difficulty,
  questionCount: number,
  excludeQuestionIds: string[] = [],
  learnerContext = ''
): Promise<{ questions: AIQuestion[]; source: 'ai' | 'bank' | 'dummy' }> => {
  const [weakTopics, mistakes, performance] = await Promise.all([
    LearnerTopicProgress.aggregate([
      { $match: { user_id: userId, questions_attempted: { $gt: 0 } } },
      { $sort: { accuracy: 1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'topics',
          localField: 'topic_id',
          foreignField: '_id',
          as: 'topic',
        },
      },
      { $unwind: '$topic' },
      { $project: { _id: 0, name: '$topic.name' } },
    ]),

    QuizAttempt.aggregate([
      { $match: { is_correct: false } },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quiz_id',
          foreignField: '_id',
          as: 'quiz',
        },
      },
      { $unwind: '$quiz' },
      { $match: { 'quiz.user_id': userId } },
      { $sort: { created_at: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'questions',
          localField: 'question_id',
          foreignField: '_id',
          as: 'question',
        },
      },
      { $unwind: '$question' },
      { $project: { _id: 0, question: '$question.question' } },
    ]),

    QuizAttempt.aggregate([
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quiz_id',
          foreignField: '_id',
          as: 'quiz',
        },
      },
      { $unwind: '$quiz' },
      {
        $match: {
          'quiz.user_id': userId,
          'quiz.created_at': {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: null,
          accuracy: {
            $avg: { $cond: ['$is_correct', 100, 0] },
          },
          avg_time: { $avg: '$time_taken' },
        },
      },
    ]),
  ]);

  const request: QuizRequest = {
    topic: topic ? topic.slug : 'general-knowledge',
    question_count: questionCount,
    difficulty,
    weak_concepts: weakTopics.map((row: any) => row.name),
    recent_mistakes: mistakes.map((row: any) => row.question),
    user_performance: {
      accuracy: Math.round(performance[0]?.accuracy ?? 0),
      avg_time: Math.round(performance[0]?.avg_time ?? 0),
    },
    learner_context: learnerContext.trim().slice(0, 2000),
  };

  try {
    const response = await getProvider().generateQuiz(request);

    // Reject malformed questions before converting provider fields into
    // the application's AIQuestion format.
    const aiQuestions = (response.questions ?? [])
      .filter((q) => {
        return (
          typeof q.question === 'string' &&
          q.question.trim().length > 0 &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          q.options.every(
            (option) =>
              typeof option === 'string' &&
              option.trim().length > 0
          ) &&
          new Set(
            q.options.map((option) => option.trim().toLowerCase())
          ).size === 4 &&
          Number.isInteger(q.correctAnswer) &&
          q.correctAnswer >= 0 &&
          q.correctAnswer <= 3 &&
          typeof q.explanation === 'string' &&
          q.explanation.trim().length > 0 &&
          typeof q.concept === 'string' &&
          q.concept.trim().length > 0 &&
          q.difficulty === difficulty
        );
      })
      .slice(0, questionCount)
      .map<AIQuestion>((q) => ({
        question: q.question.trim(),
        options: q.options.map((option) => option.trim()),
        correct_answer: q.correctAnswer,
        explanation: q.explanation.trim(),
        difficulty: q.difficulty,
        concept: q.concept.trim(),
      }));

    if (aiQuestions.length === questionCount) {
      // Validate every question before serving the quiz.
      const validated = await filterValidQuestions(aiQuestions);

      // Never return an incomplete AI quiz or a quiz whose difficulty
      // differs from the requested difficulty.
      if (
        validated.length === questionCount &&
        validated.every((q) => q.difficulty === difficulty)
      ) {
        return { questions: validated, source: 'ai' };
      }

      console.warn(
        `[ai] expected ${questionCount} validated ${difficulty} questions, ` +
          `received ${validated.length}; using local bank`
      );
    } else {
      console.warn(
        `[ai] received ${aiQuestions.length}/${questionCount} valid ` +
          `${difficulty} questions; using local bank`
      );
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

  if (bankQuestions.length > 0) {
    return { questions: bankQuestions, source: 'bank' };
  }

  console.warn(
    `[ai] no provider or bank questions available; using offline demo fallback for ${questionCount} questions`
  );

  const category =
    topic?.name ??
    learnerContext?.match(/^Category:\s*(.+)$/m)?.[1]?.trim() ??
    'General Knowledge';
  const fallbackQuestion: AIQuestion = {
    question: `Which approach is the best starting point for learning ${category}?`,
    options: [
      'Understand the core idea, then practise it with an example.',
      'Memorise unrelated facts without checking their meaning.',
      'Skip the basics and only study the hardest edge cases.',
      'Avoid practising so mistakes cannot be discovered.',
    ],
    correct_answer: 0,
    explanation:
      'Starting with the core idea and applying it to an example creates a useful foundation for deeper learning.',
    difficulty,
    concept: category,
  };

  return {
    questions: Array.from({ length: questionCount }, (_, index) => ({
      ...fallbackQuestion,
      question:
        index === 0
          ? fallbackQuestion.question
          : `What is a practical way to build confidence in ${category}?`,
    })),
    source: 'dummy',
  };
};

/**
 * Validate each generated question.
 */
const filterValidQuestions = async (
  questions: AIQuestion[]
): Promise<AIQuestion[]> => {
  const results = await Promise.all(
    questions.map(async (q) => {
      const verdict = await validateQuestionWithAI(
        q.question,
        q.options,
        q.correct_answer,
        {
          explanation: q.explanation,
          concept: q.concept ?? '',
          difficulty: q.difficulty,
        }
      );

      return { question: q, verdict };
    })
  );

  const kept = results
    .filter((result) => result.verdict.valid)
    .map((result) => result.question);

  const rejected = results.filter(
    (result) => !result.verdict.valid
  );

  if (rejected.length > 0) {
    console.warn(
      `[ai] dropped ${rejected.length} question(s): ${rejected
        .map(
          (result) =>
            result.verdict.issues?.join('; ') ||
            'failed validation'
        )
        .join(' | ')}`
    );
  }

  return kept;
};

export const validateQuestionWithAI = async (
  question: string,
  options: string[],
  correctAnswer: number,
  context: {
    explanation?: string;
    concept?: string;
    difficulty?: Difficulty;
  } = {}
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
  } catch {
    // Local structural validation if the provider validator fails.
    const localIssues: string[] = [];

    if (question.trim().length < 10) {
      localIssues.push('Question is too short');
    }

    if (options.length !== 4) {
      localIssues.push('Question must have exactly 4 options');
    }

    if (
      options.some(
        (option) =>
          typeof option !== 'string' || !option.trim()
      )
    ) {
      localIssues.push('Options must be non-empty strings');
    }

    if (
      new Set(
        options.map((option) => option.trim().toLowerCase())
      ).size !== options.length
    ) {
      localIssues.push('Options contain duplicates');
    }

    if (
      !Number.isInteger(correctAnswer) ||
      correctAnswer < 0 ||
      correctAnswer >= options.length
    ) {
      localIssues.push('Correct answer index is out of range');
    }

    return {
      valid: localIssues.length === 0,
      issues: localIssues,
      suggestions: [],
    };
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
      {
        $lookup: {
          from: 'topics',
          localField: 'topic_id',
          foreignField: '_id',
          as: 'topic',
        },
      },
      { $unwind: '$topic' },
      {
        $project: {
          _id: 0,
          name: '$topic.name',
          accuracy: 1,
        },
      },
    ]),

    LearnerConceptProgress.aggregate([
      {
        $match: {
          user_id: userId,
          questions_attempted: { $gt: 0 },
        },
      },
      { $sort: { accuracy: 1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'concepts',
          localField: 'concept_id',
          foreignField: '_id',
          as: 'concept',
        },
      },
      { $unwind: '$concept' },
      { $project: { _id: 0, name: '$concept.name' } },
    ]),
  ]);

  const topicMastery: Record<string, number> = {};

  topics.forEach((row: any) => {
    topicMastery[row.name] = row.accuracy ?? 0;
  });

  const weakConcepts = weakestConcepts.map(
    (row: any) => row.name
  );

  const request: AdaptiveRecommendationRequest = {
    user_id: userId,
    recent_performance: scores.map((row: any) => ({
      correct: row.score >= 70,
      score: row.score,
    })),
    topic_mastery: topicMastery,
    weak_concepts: weakConcepts,
    current_difficulty: 'medium',
  };

  try {
    const response =
      await getProvider().getAdaptiveRecommendation(request);

    return {
      recommended_difficulty: response.recommended_difficulty,
      recommended_topics: response.recommended_topic
        ? [
            response.recommended_topic,
            ...(response.focus_concepts ?? []),
          ]
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

  // Local recommendation fallback.
  const scoreValues = scores.map(
    (row: any) => Number(row.score)
  );

  const avgScore =
    scoreValues.length > 0
      ? scoreValues.reduce((a, b) => a + b, 0) /
        scoreValues.length
      : 0;

  const recommendedDifficulty: Difficulty =
    avgScore >= 85
      ? 'hard'
      : avgScore >= 60
        ? 'medium'
        : 'easy';

  const sortedTopics = Object.entries(topicMastery).sort(
    (a, b) => a[1] - b[1]
  );

  const recommendedTopics = sortedTopics
    .slice(0, 3)
    .map(([name]) => name);

  return {
    recommended_difficulty: recommendedDifficulty,
    recommended_topics:
      recommendedTopics.length > 0
        ? recommendedTopics
        : ['General Knowledge'],
    reason: scoreValues.length
      ? `Based on your average score of ${avgScore.toFixed(0)}% over your last ${scoreValues.length} quizzes, ${recommendedDifficulty} difficulty will keep you in the flow.`
      : 'Finish your first quiz and BrainSnack will tune this to your level.',
  };
};

// ---------------------------------------------------------------------------
// MongoDB question-bank fallback
// ---------------------------------------------------------------------------

/**
 * Pull local questions while avoiding recently seen questions.
 *
 * The existing fallback permits neighboring difficulties to keep quizzes
 * available when the requested difficulty has too few seeded questions.
 */
const getLocalQuestions = async (
  topicId?: string,
  difficulty?: Difficulty,
  count: number = 5,
  excludeQuestionIds: string[] = []
): Promise<AIQuestion[]> => {
  const match: Record<string, unknown> = {};

  if (topicId) {
    match.topic_id = topicId;
  }

  if (difficulty) {
    const ladder: Record<Difficulty, Difficulty[]> = {
      easy: ['easy', 'medium'],
      medium: ['medium', 'easy', 'hard'],
      hard: ['hard', 'medium'],
    };

    match.difficulty = { $in: ladder[difficulty] };
  }

  if (excludeQuestionIds.length > 0) {
    match._id = { $nin: excludeQuestionIds };
  }

  const rows = await Question.aggregate([
    { $match: match },
    { $sample: { size: count } },
    {
      $lookup: {
        from: 'concepts',
        localField: 'concept_id',
        foreignField: '_id',
        as: 'concept',
      },
    },
    {
      $unwind: {
        path: '$concept',
        preserveNullAndEmptyArrays: true,
      },
    },
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

export const generateQuizRaw = (
  request: QuizRequest
): Promise<QuizResponse> =>
  getProvider().generateQuiz(request);

export const getAdaptiveRecommendationForRequest = (
  request: AdaptiveRecommendationRequest
): Promise<AdaptiveRecommendationResult> =>
  getProvider().getAdaptiveRecommendation(request);

export { getProvider };

export const aiService = {
  generateQuizWithAI,
  validateQuestionWithAI,
  getAdaptiveRecommendation,
  getAIStatus,
};
