import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { GenerateQuizRequest, AIQuestion } from '../types';
import { generateQuizWithAI } from '../services/ai';
import { adaptiveService } from '../services/adaptiveService';
import { xpService } from '../services/xpService';
import { streakService } from '../services/streakService';
import { badgeService } from '../services/badgeService';
import { Quiz, Question, Concept, Topic, QuizAttempt, User, newId } from '../models';

const router = Router();

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const MAX_QUESTIONS = 20;
const TIME_PER_QUESTION_SECONDS = 30;

const isDifficulty = (value: unknown): value is Difficulty =>
  typeof value === 'string' && (DIFFICULTIES as readonly string[]).includes(value);

/** Public question payload. The answer key is only added once a quiz is graded. */
const toPublicQuestion = (doc: any, concept: string | null, position?: number) => ({
  id: String(doc._id),
  text: doc.question,
  options: Array.isArray(doc.options) ? doc.options : [],
  difficulty: doc.difficulty,
  concept: concept ?? null,
  position,
});

interface OrderedQuestion {
  doc: any;
  concept: string | null;
  position: number;
}

/**
 * Load a quiz's questions in the order its `question_ids` array defines, with
 * concept names resolved in a single extra query.
 */
const loadOrderedQuestions = async (questionIds: string[]): Promise<OrderedQuestion[]> => {
  if (questionIds.length === 0) return [];

  const docs = await Question.find({ _id: { $in: questionIds } }).lean();
  const byId = new Map(docs.map((d: any) => [String(d._id), d]));

  const conceptIds = [
    ...new Set(docs.map((d: any) => d.concept_id).filter((id: any): id is string => Boolean(id))),
  ];
  const concepts = conceptIds.length
    ? await Concept.find({ _id: { $in: conceptIds } }).select('name').lean()
    : [];
  const conceptName = new Map(concepts.map((c: any) => [String(c._id), c.name]));

  return questionIds
    .map((id, index) => {
      const doc = byId.get(id);
      if (!doc) return null;
      return {
        doc,
        concept: doc.concept_id ? conceptName.get(String(doc.concept_id)) ?? null : null,
        position: index + 1,
      };
    })
    .filter((row): row is OrderedQuestion => row !== null);
};

/** Persist the generated questions as documents and return their ids in order. */
const createQuizQuestions = async (
  topicId: string,
  generated: AIQuestion[]
): Promise<string[]> => {
  const ids: string[] = [];

  for (const q of generated) {
    let conceptId: string | null = null;
    if (q.concept) {
      const concept = await Concept.findOne({
        $or: [{ slug: q.concept }, { name: q.concept }],
      })
        .select('_id')
        .lean();
      conceptId = concept ? String((concept as any)._id) : null;
    }

    const created = await Question.create({
      topic_id: topicId,
      concept_id: conceptId,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation || null,
      difficulty: q.difficulty,
    });
    ids.push(created._id);
  }

  return ids;
};

/** POST /api/quizzes/generate */
router.post('/generate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const body = (req.body ?? {}) as GenerateQuizRequest;

    // ---- validate -------------------------------------------------------
    let topicId: string | null = null;
    let topic: { id: string; name: string; slug: string } | null = null;

    if (body.topic_id !== undefined && body.topic_id !== null && body.topic_id !== '') {
      const found = await Topic.findOne({
        $or: [{ _id: String(body.topic_id) }, { slug: String(body.topic_id) }],
      }).lean();
      if (!found) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      topic = { id: String((found as any)._id), name: (found as any).name, slug: (found as any).slug };
      topicId = topic.id;
    }

    const requestedCount = Number(body.question_count ?? 5);
    const questionCount = Number.isFinite(requestedCount)
      ? Math.min(Math.max(Math.trunc(requestedCount), 3), MAX_QUESTIONS)
      : 5;

    let difficulty: Difficulty;
    if (body.difficulty === undefined || body.difficulty === null) {
      difficulty = topicId
        ? await adaptiveService.getRecommendedDifficulty(userId, topicId)
        : 'medium';
    } else if (isDifficulty(body.difficulty)) {
      difficulty = body.difficulty;
    } else {
      return res.status(400).json({
        error: `difficulty must be one of: ${DIFFICULTIES.join(', ')}`,
      });
    }

    // ---- generate -------------------------------------------------------
    // Prefer questions this learner has not just seen, so back-to-back quizzes
    // on the same topic do not repeat themselves.
    const recentQuizzes = await Quiz.find({
      user_id: userId,
      created_at: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    })
      .select('question_ids')
      .lean();
    const recentlySeen = [
      ...new Set(recentQuizzes.flatMap((q: any) => q.question_ids ?? [])),
    ].slice(0, 60);

    const { questions: generated, source } = await generateQuizWithAI(
      userId,
      topic,
      difficulty,
      questionCount,
      recentlySeen
    );

    if (generated.length === 0) {
      return res.status(422).json({
        error: 'No questions available for this topic yet',
        detail:
          'The AI provider returned nothing and the local question bank had no match. Seed the database or check the AI provider configuration.',
      });
    }

    // ---- persist --------------------------------------------------------
    // questions.topic_id is required, so unattributed AI questions are parked
    // under General Knowledge when the learner picked a different topic.
    let questionTopicId = topicId;
    if (!questionTopicId) {
      const general = await Topic.findOne({ slug: 'general-knowledge' }).select('_id').lean();
      questionTopicId = general ? String((general as any)._id) : null;
    }
    if (!questionTopicId) {
      return res
        .status(422)
        .json({ error: 'No topic is available to attach the generated questions to' });
    }

    const quizId = newId();
    const questionIds = await createQuizQuestions(questionTopicId, generated);

    await Quiz.create({
      _id: quizId,
      user_id: userId,
      topic_id: topicId,
      difficulty,
      question_count: questionIds.length,
      status: 'in_progress',
      question_ids: questionIds,
    });

    const rows = await loadOrderedQuestions(questionIds);

    return res.status(201).json({
      id: quizId,
      topic_id: topicId,
      topic_name: topic?.name ?? 'General Knowledge',
      difficulty,
      question_count: questionIds.length,
      time_per_question: TIME_PER_QUESTION_SECONDS,
      total_xp: estimateXp(generated, difficulty),
      source,
      questions: rows.map((row) => toPublicQuestion(row.doc, row.concept, row.position)),
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** GET /api/quizzes - history for the signed-in learner */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 100);

    const rows = await Quiz.aggregate([
      { $match: { user_id: req.userId } },
      { $sort: { created_at: -1 } },
      { $limit: limit },
      { $lookup: { from: 'topics', localField: 'topic_id', foreignField: '_id', as: 'topic' } },
      { $unwind: { path: '$topic', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: '$_id',
          topic_id: 1,
          topic_name: '$topic.name',
          topic_icon: '$topic.icon',
          difficulty: 1,
          question_count: 1,
          status: 1,
          score: 1,
          xp_earned: 1,
          created_at: 1,
          completed_at: 1,
        },
      },
    ]);

    return res.json(rows);
  } catch (error) {
    console.error('Quiz history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** GET /api/quizzes/:id - owner-only. Serves the exact question set in order. */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user_id: req.userId }).lean();
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questionIds = (quiz as any).question_ids ?? [];
    const [rows, attempts, topic] = await Promise.all([
      loadOrderedQuestions(questionIds),
      QuizAttempt.find({ quiz_id: (quiz as any)._id })
        .select('question_id selected_answer is_correct time_taken')
        .lean(),
      (quiz as any).topic_id
        ? Topic.findById((quiz as any).topic_id).select('name').lean()
        : Promise.resolve(null),
    ]);

    // Explanations are only released once the learner has committed to an
    // answer, so an in-progress quiz never leaks the key.
    const graded = (quiz as any).status !== 'in_progress';

    return res.json({
      id: String((quiz as any)._id),
      topic_id: (quiz as any).topic_id ?? null,
      topic_name: (topic as any)?.name ?? 'General Knowledge',
      difficulty: (quiz as any).difficulty,
      question_count: (quiz as any).question_count,
      status: (quiz as any).status,
      score: (quiz as any).score,
      xp_earned: (quiz as any).xp_earned,
      created_at: (quiz as any).created_at,
      completed_at: (quiz as any).completed_at,
      time_per_question: TIME_PER_QUESTION_SECONDS,
      total_xp: (quiz as any).xp_earned,
      questions: rows.map((row) =>
        graded
          ? {
              ...toPublicQuestion(row.doc, row.concept, row.position),
              correct_answer: row.doc.correct_answer,
              explanation: row.doc.explanation,
            }
          : toPublicQuestion(row.doc, row.concept, row.position)
      ),
      attempts: attempts.map((a: any) => ({
        question_id: a.question_id,
        selected_answer: a.selected_answer,
        is_correct: a.is_correct,
        time_taken: a.time_taken,
      })),
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** POST /api/quizzes/:id/answer - grade one question, server-side. */
router.post('/:id/answer', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { question_id, selected_answer, time_taken = 0 } = req.body ?? {};
    const userId = req.userId!;
    const quizId = req.params.id;

    const selected = Number(selected_answer);
    if (!question_id || !Number.isInteger(selected)) {
      return res
        .status(400)
        .json({ error: 'question_id and an integer selected_answer are required' });
    }

    const quiz = await Quiz.findOne({ _id: quizId, user_id: userId }).lean();
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    if ((quiz as any).status !== 'in_progress') {
      return res.status(400).json({ error: 'Quiz is already completed' });
    }

    // Membership check: the question must actually belong to this quiz. Without
    // it a client could submit answers for any question id in the system.
    const questionId = String(question_id);
    if (!((quiz as any).question_ids ?? []).includes(questionId)) {
      return res.status(404).json({ error: 'Question is not part of this quiz' });
    }

    const question = await Question.findById(questionId).lean();
    if (!question) {
      return res.status(404).json({ error: 'Question is not part of this quiz' });
    }

    const optionCount = Array.isArray((question as any).options)
      ? (question as any).options.length
      : 0;
    if (selected < 0 || selected >= optionCount) {
      return res.status(400).json({ error: 'selected_answer is out of range' });
    }

    const isCorrect = selected === (question as any).correct_answer;
    const elapsed = Math.max(0, Math.min(parseInt(String(time_taken), 10) || 0, 600));

    // The unique (quiz_id, question_id) index makes a resubmit a no-op for
    // stats purposes; adaptive progress only advances when the verdict changes.
    const previous = await QuizAttempt.findOne({ quiz_id: quizId, question_id: questionId })
      .select('is_correct')
      .lean();

    await QuizAttempt.findOneAndUpdate(
      { quiz_id: quizId, question_id: questionId },
      { $set: { selected_answer: selected, is_correct: isCorrect, time_taken: elapsed } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const changedVerdict = !previous || (previous as any).is_correct !== isCorrect;
    if (changedVerdict) {
      if ((quiz as any).topic_id) {
        await adaptiveService.updateTopicProgress(userId, (quiz as any).topic_id, isCorrect);
      }
      if ((question as any).concept_id) {
        await adaptiveService.updateConceptProgress(
          userId,
          String((question as any).concept_id),
          isCorrect
        );
      }
    }

    const index = ((quiz as any).question_ids ?? []).indexOf(questionId);
    const nextQuestion =
      index >= 0 && index + 1 < (quiz as any).question_ids.length
        ? (quiz as any).question_ids[index + 1]
        : null;

    return res.json({
      is_correct: isCorrect,
      correct_answer: (question as any).correct_answer,
      explanation: (question as any).explanation,
      next_question: nextQuestion,
      answered: true,
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** POST /api/quizzes/:id/complete */
router.post('/:id/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const quizId = req.params.id;

    const quiz = await Quiz.findOne({ _id: quizId, user_id: userId }).lean();
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Idempotent: a double-tap on "Finish" must not pay XP twice.
    if ((quiz as any).status === 'completed') {
      const summary = await summarize(quizId);
      return res.json({
        ...summary,
        xp_earned: (quiz as any).xp_earned,
        new_badges: [],
        already_completed: true,
      });
    }

    const { total, correct } = await summarize(quizId);
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    // XP is earned per question actually answered correctly, at that question's
    // difficulty.
    const attempts = await QuizAttempt.find({ quiz_id: quizId })
      .select('question_id is_correct')
      .lean();
    const attemptedQuestionIds = [...new Set(attempts.map((a: any) => String(a.question_id)))];
    const questionDocs = attemptedQuestionIds.length
      ? await Question.find({ _id: { $in: attemptedQuestionIds } })
          .select('difficulty')
          .lean()
      : [];
    const difficultyById = new Map(questionDocs.map((q: any) => [String(q._id), q.difficulty]));

    let baseXp = 0;
    for (const attempt of attempts as any[]) {
      if (attempt.is_correct) {
        baseXp += xpService.getXpForDifficulty(
          (difficultyById.get(String(attempt.question_id)) as Difficulty) ?? 'medium'
        );
      }
    }

    const perfectBonus = total > 0 && score === 100 ? 100 : 0;
    const xpEarned = baseXp + perfectBonus;

    const topic = (quiz as any).topic_id
      ? await Topic.findById((quiz as any).topic_id).select('name').lean()
      : null;
    const topicName = (topic as any)?.name ?? 'General Knowledge';

    // Guarded update: if two requests race, only the first flips the status.
    await Quiz.updateOne(
      { _id: quizId, status: 'in_progress' },
      { $set: { status: 'completed', score, xp_earned: xpEarned, completed_at: new Date() } }
    );
    await User.updateOne(
      { _id: userId },
      { $max: { personal_best: score }, $set: { last_active: new Date() } }
    );

    const reason =
      perfectBonus > 0
        ? `Perfect score on ${topicName} (+${baseXp} + ${perfectBonus} bonus)`
        : `${correct}/${total} on ${topicName}`;

    await xpService.awardXP(userId, xpEarned, reason, 'quiz', quizId);
    const streak = await streakService.updateStreak(userId);
    const newBadges = await badgeService.checkAndAwardBadges(userId);

    return res.json({
      score,
      correct_answers: correct,
      total_questions: total,
      xp_earned: xpEarned,
      base_xp: baseXp,
      perfect_bonus: perfectBonus,
      new_badges: newBadges,
      streak: streak
        ? { current: streak.current_streak, longest: streak.longest_streak }
        : null,
      personal_best: await personalBest(userId),
    });
  } catch (error) {
    console.error('Complete quiz error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

// ---------------------------------------------------------------------------
// helpers

const summarize = async (quizId: string) => {
  const rows = await QuizAttempt.aggregate<{ total: number; correct: number }>([
    { $match: { quiz_id: quizId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        correct: { $sum: { $cond: ['$is_correct', 1, 0] } },
      },
    },
  ]);
  return { total: rows[0]?.total ?? 0, correct: rows[0]?.correct ?? 0 };
};

const personalBest = async (userId: string): Promise<number> => {
  const user = await User.findById(userId).select('personal_best').lean();
  return (user as any)?.personal_best ?? 0;
};

/** Upper bound on what this quiz can pay out, so the UI can show the stake. */
const estimateXp = (questions: AIQuestion[], fallback: Difficulty): number => {
  let xp = 0;
  for (const q of questions) {
    const difficulty = isDifficulty(q.difficulty) ? q.difficulty : fallback;
    xp += xpService.getXpForDifficulty(difficulty);
  }
  return xp + 100; // + perfect-score bonus
};
