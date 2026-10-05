import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../db';
import { authMiddleware } from '../middleware/auth';
import { Quiz, Question, GenerateQuizRequest, AIQuestion } from '../types';
import { aiService } from '../services/aiService';
import { adaptiveService } from '../services/adaptiveService';
import { xpService } from '../services/xpService';
import { streakService } from '../services/streakService';
import { badgeService } from '../services/badgeService';

const router = Router();

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const MAX_QUESTIONS = 20;
const TIME_PER_QUESTION_SECONDS = 30;

const isDifficulty = (value: unknown): value is Difficulty =>
  typeof value === 'string' && (DIFFICULTIES as readonly string[]).includes(value);

/** Question payload sent to the client. Deliberately omits `correct_answer`
 *  and `explanation` - grading is a server concern, and shipping the answer key
 *  makes every quiz trivially cheatable from devtools. */
const toPublicQuestion = (row: any, position?: number) => ({
  id: row.id,
  text: row.question,
  options: Array.isArray(row.options) ? row.options : [],
  difficulty: row.difficulty,
  concept: row.concept_name ?? null,
  position,
});

/** POST /api/quizzes/generate */
router.post('/generate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const body = (req.body ?? {}) as GenerateQuizRequest;

    // ---- validate -------------------------------------------------------
    let topicId: string | undefined;
    let topic: { id: string; name: string; slug: string } | null = null;

    if (body.topic_id !== undefined && body.topic_id !== null && body.topic_id !== '') {
      const topicResult = await query<{ id: string; name: string; slug: string }>(
        'SELECT id, name, slug FROM topics WHERE id::text = $1 OR slug = $1',
        [String(body.topic_id)]
      );
      if (topicResult.rows.length === 0) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      topic = topicResult.rows[0];
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
    const recentlySeen = await query<{ question_id: string }>(
      `SELECT DISTINCT qq.question_id
       FROM quiz_questions qq
       JOIN quizzes q ON q.id = qq.quiz_id
       WHERE q.user_id = $1 AND q.created_at > NOW() - INTERVAL '1 hour'
       LIMIT 60`,
      [userId]
    );

    const { questions: generated, source } = await aiService.generateQuizWithAI(
      userId,
      topic,
      difficulty,
      questionCount,
      recentlySeen.rows.map((r) => r.question_id)
    );

    if (generated.length === 0) {
      return res.status(422).json({
        error: 'No questions available for this topic yet',
        detail:
          'The AI service returned nothing and the local question bank had no match. Seed the database or check the AI service logs.',
      });
    }

    // ---- persist --------------------------------------------------------
    const quizId = uuidv4();
    const persisted = await transaction(async (client) => {
      await client.query(
        `INSERT INTO quizzes (id, user_id, topic_id, difficulty, question_count, status)
         VALUES ($1, $2, $3, $4, $5, 'in_progress')`,
        [quizId, userId, topicId ?? null, difficulty, generated.length]
      );

      const questionIds: string[] = [];
      for (const [index, q] of generated.entries()) {
        // A brand-new AI question has no home in the bank, and questions.topic_id
        // is NOT NULL, so park unattributed questions under General Knowledge
        // when the learner picked a different topic.
        let conceptId: string | null = null;
        if (q.concept) {
          const conceptResult = await client.query<{ id: string }>(
            'SELECT id FROM concepts WHERE slug = $1 OR name = $1 LIMIT 1',
            [q.concept]
          );
          conceptId = conceptResult.rows[0]?.id ?? null;
        }

        const questionId = uuidv4();
        const insert = await client.query<Question>(
          `INSERT INTO questions (id, topic_id, concept_id, question, options, correct_answer, explanation, difficulty)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            questionId,
            topicId ?? null,
            conceptId,
            q.question,
            JSON.stringify(q.options),
            q.correct_answer,
            q.explanation || null,
            q.difficulty,
          ]
        );

        await client.query(
          `INSERT INTO quiz_questions (quiz_id, question_id, position) VALUES ($1, $2, $3)`,
          [quizId, questionId, index + 1]
        );

        questionIds.push(insert.rows[0].id);
      }

      return questionIds;
    });

    const questionsResult = await query(
      `SELECT qq.position, q.id, q.question, q.options, q.difficulty, c.name AS concept_name
       FROM quiz_questions qq
       JOIN questions q ON q.id = qq.question_id
       LEFT JOIN concepts c ON q.concept_id = c.id
       WHERE qq.quiz_id = $1
       ORDER BY qq.position`,
      [quizId]
    );

    return res.status(201).json({
      id: quizId,
      topic_id: topicId ?? null,
      topic_name: topic?.name ?? 'General Knowledge',
      difficulty,
      question_count: persisted.length,
      time_per_question: TIME_PER_QUESTION_SECONDS,
      total_xp: estimateXp(generated, difficulty),
      source,
      questions: questionsResult.rows.map((row) => toPublicQuestion(row, row.position)),
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
    const result = await query(
      `SELECT q.id, q.topic_id, t.name AS topic_name, t.icon AS topic_icon,
              q.difficulty, q.question_count, q.status, q.score, q.xp_earned,
              q.created_at, q.completed_at
       FROM quizzes q
       LEFT JOIN topics t ON q.topic_id = t.id
       WHERE q.user_id = $1
       ORDER BY q.created_at DESC
       LIMIT $2`,
      [req.userId, limit]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Quiz history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** GET /api/quizzes/:id - owner-only. Serves the exact question set via quiz_questions. */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const quizResult = await query<Quiz>(
      'SELECT * FROM quizzes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    const quiz = quizResult.rows[0];

    const questionsResult = await query(
      `SELECT qq.position, q.id, q.question, q.options, q.difficulty, c.name AS concept_name
       FROM quiz_questions qq
       JOIN questions q ON q.id = qq.question_id
       LEFT JOIN concepts c ON q.concept_id = c.id
       WHERE qq.quiz_id = $1
       ORDER BY qq.position`,
      [quiz.id]
    );

    const attemptsResult = await query(
      `SELECT qa.question_id, qa.selected_answer, qa.is_correct, qa.time_taken
       FROM quiz_attempts qa WHERE qa.quiz_id = $1`,
      [quiz.id]
    );

    const topicResult = quiz.topic_id
      ? await query('SELECT name FROM topics WHERE id = $1', [quiz.topic_id])
      : { rows: [] as Array<{ name: string }> };

    // Explanations are only released once the learner has committed to an
    // answer, so an in-progress quiz never leaks the key.
    const graded = quiz.status !== 'in_progress';

    return res.json({
      id: quiz.id,
      topic_id: quiz.topic_id,
      topic_name: topicResult.rows[0]?.name ?? 'General Knowledge',
      difficulty: quiz.difficulty,
      question_count: quiz.question_count,
      status: quiz.status,
      score: quiz.score,
      xp_earned: quiz.xp_earned,
      created_at: quiz.created_at,
      completed_at: quiz.completed_at,
      time_per_question: TIME_PER_QUESTION_SECONDS,
      total_xp: quiz.xp_earned,
      questions: questionsResult.rows.map((row) =>
        graded ? { ...toPublicQuestion(row, row.position), correct_answer: row.correct_answer, explanation: row.explanation } : toPublicQuestion(row, row.position)
      ),
      attempts: attemptsResult.rows,
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
      return res.status(400).json({ error: 'question_id and an integer selected_answer are required' });
    }

    const quizResult = await query<Quiz>(
      'SELECT * FROM quizzes WHERE id = $1 AND user_id = $2',
      [quizId, userId]
    );
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    const quiz = quizResult.rows[0];
    if (quiz.status !== 'in_progress') {
      return res.status(400).json({ error: 'Quiz is already completed' });
    }

    // Membership check: the question must actually belong to this quiz. Without
    // it a client could submit answers for any question id in the system.
    const membership = await query<Question>(
      `SELECT q.* FROM quiz_questions qq
       JOIN questions q ON q.id = qq.question_id
       WHERE qq.quiz_id = $1 AND qq.question_id = $2`,
      [quizId, question_id]
    );
    if (membership.rows.length === 0) {
      return res.status(404).json({ error: 'Question is not part of this quiz' });
    }
    const question = membership.rows[0];

    if (selected < 0 || selected >= (Array.isArray(question.options) ? question.options.length : 0)) {
      return res.status(400).json({ error: 'selected_answer is out of range' });
    }

    const isCorrect = selected === question.correct_answer;
    const elapsed = Math.max(0, Math.min(parseInt(String(time_taken), 10) || 0, 600));

    // Upsert. The UNIQUE(quiz_id, question_id) constraint makes a resubmit a
    // no-op for stats purposes; adaptive progress is only advanced when the
    // stored verdict actually changes, so nobody can grind mastery by spamming.
    const previous = await query<{ is_correct: boolean }>(
      'SELECT is_correct FROM quiz_attempts WHERE quiz_id = $1 AND question_id = $2',
      [quizId, question_id]
    );

    const saved = await query<{ is_correct: boolean; time_taken: number }>(
      `INSERT INTO quiz_attempts (quiz_id, question_id, selected_answer, is_correct, time_taken)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (quiz_id, question_id) DO UPDATE
         SET selected_answer = EXCLUDED.selected_answer,
             is_correct      = EXCLUDED.is_correct,
             time_taken      = EXCLUDED.time_taken,
             created_at      = CURRENT_TIMESTAMP
       RETURNING is_correct, time_taken`,
      [quizId, question_id, selected, isCorrect, elapsed]
    );

    const changedVerdict =
      previous.rows.length === 0 || previous.rows[0].is_correct !== isCorrect;

    if (changedVerdict) {
      if (quiz.topic_id) {
        await adaptiveService.updateTopicProgress(userId, quiz.topic_id, isCorrect);
      }
      if (question.concept_id) {
        await adaptiveService.updateConceptProgress(userId, question.concept_id, isCorrect);
      }
    }

    return res.json({
      is_correct: isCorrect,
      correct_answer: question.correct_answer,
      explanation: question.explanation,
      // Position in the quiz so the client can show progress without re-fetching.
      next_question: await nextQuestionId(quizId, question_id),
      answered: saved.rowCount ?? 0 > 0,
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

    const quizResult = await query<Quiz>(
      'SELECT * FROM quizzes WHERE id = $1 AND user_id = $2',
      [quizId, userId]
    );
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    const quiz = quizResult.rows[0];

    // Idempotent: a double-tap on "Finish" must not pay XP twice.
    if (quiz.status === 'completed') {
      const summary = await summarize(quizId);
      return res.json({
        ...summary,
        xp_earned: quiz.xp_earned,
        new_badges: [],
        already_completed: true,
      });
    }

    const { total, correct } = await summarize(quizId);
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    // XP is earned per question actually answered correctly, at that question's
    // difficulty. (The old code awarded full XP for every question as long as
    // one answer anywhere in the quiz was right.)
    const breakdown = await query<{ difficulty: Difficulty; is_correct: boolean }>(
      `SELECT q.difficulty, qa.is_correct
       FROM quiz_attempts qa
       JOIN questions q ON q.id = qa.question_id
       WHERE qa.quiz_id = $1`,
      [quizId]
    );

    let baseXp = 0;
    for (const row of breakdown.rows) {
      if (row.is_correct) {
        baseXp += xpService.getXpForDifficulty(row.difficulty as Difficulty);
      }
    }

    const perfectBonus = total > 0 && score === 100 ? 100 : 0;
    const xpEarned = baseXp + perfectBonus;

    const topicNameResult = quiz.topic_id
      ? await query<{ name: string }>('SELECT name FROM topics WHERE id = $1', [quiz.topic_id])
      : { rows: [] as Array<{ name: string }> };
    const topicName = topicNameResult.rows[0]?.name ?? 'General Knowledge';

    await transaction(async (client) => {
      await client.query(
        `UPDATE quizzes
         SET status = 'completed', score = $1, xp_earned = $2, completed_at = CURRENT_TIMESTAMP
         WHERE id = $3 AND status = 'in_progress'`,
        [score, xpEarned, quizId]
      );
      await client.query(
        `UPDATE users
         SET personal_best = GREATEST(personal_best, $1),
             last_active = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [score, userId]
      );
    });

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
  const result = await query<{ total: string; correct: string }>(
    `SELECT COUNT(*) AS total,
            COUNT(*) FILTER (WHERE is_correct) AS correct
     FROM quiz_attempts WHERE quiz_id = $1`,
    [quizId]
  );
  return {
    total: parseInt(result.rows[0]?.total ?? '0', 10),
    correct: parseInt(result.rows[0]?.correct ?? '0', 10),
  };
};

const nextQuestionId = async (quizId: string, questionId: string): Promise<string | null> => {
  const result = await query<{ id: string }>(
    `SELECT qq.question_id AS id
     FROM quiz_questions qq
     WHERE qq.quiz_id = $1 AND qq.position > (
       SELECT position FROM quiz_questions WHERE quiz_id = $1 AND question_id = $2
     )
     ORDER BY qq.position
     LIMIT 1`,
    [quizId, questionId]
  );
  return result.rows[0]?.id ?? null;
};

const personalBest = async (userId: string): Promise<number> => {
  const result = await query<{ personal_best: number }>(
    'SELECT personal_best FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0]?.personal_best ?? 0;
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
