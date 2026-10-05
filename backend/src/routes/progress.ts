import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authMiddleware } from '../middleware/auth';
import { xpService } from '../services/xpService';
import { badgeService } from '../services/badgeService';
import { streakService } from '../services/streakService';
import { adaptiveService } from '../services/adaptiveService';

const router = Router();

/**
 * GET /api/progress
 *
 * Everything the dashboard and profile need in one round trip. Accuracy is
 * derived from actual `quiz_attempts` rows, not from `score * question_count`,
 * which drifted out of sync the moment a learner skipped or revisited a question.
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [
      userResult,
      statsResult,
      topicProgressResult,
      recentActivity,
      badgeProgress,
      streak,
      weakTopics,
      recentQuizzes,
    ] = await Promise.all([
      query('SELECT xp, level, personal_best FROM users WHERE id = $1', [userId]),
      query<{
        quizzes_completed: string;
        total_questions: string;
        correct_answers: string;
      }>(
        `SELECT
           COUNT(DISTINCT q.id) FILTER (WHERE q.status = 'completed') AS quizzes_completed,
           COUNT(qa.id) AS total_questions,
           COUNT(qa.id) FILTER (WHERE qa.is_correct) AS correct_answers
         FROM quizzes q
         LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id
         WHERE q.user_id = $1 AND q.status = 'completed'`,
        [userId]
      ),
      query(
        `SELECT ltp.topic_id, ltp.accuracy, ltp.questions_attempted, ltp.questions_correct,
                ltp.mastery_percentage, ltp.difficulty_level,
                t.name, t.slug, t.icon, t.color
         FROM learner_topic_progress ltp
         JOIN topics t ON ltp.topic_id = t.id
         WHERE ltp.user_id = $1
         ORDER BY ltp.mastery_percentage DESC`,
        [userId]
      ),
      xpService.getXPTransactions(userId, 10),
      badgeService.getBadgeProgress(userId),
      streakService.getStreak(userId),
      adaptiveService.getWeakestTopics(userId, 3),
      query(
        `SELECT q.id, q.topic_id, t.name AS topic_name, t.icon AS topic_icon,
                q.difficulty, q.question_count, q.score, q.xp_earned,
                q.created_at, q.completed_at
         FROM quizzes q
         LEFT JOIN topics t ON q.topic_id = t.id
         WHERE q.user_id = $1 AND q.status = 'completed'
         ORDER BY q.completed_at DESC
         LIMIT 5`,
        [userId]
      ),
    ]);

    const user = userResult.rows[0];
    const stats = statsResult.rows[0];
    const totalQuestions = parseInt(stats?.total_questions ?? '0', 10);
    const correctAnswers = parseInt(stats?.correct_answers ?? '0', 10);

    return res.json({
      total_xp: user?.xp ?? 0,
      level: user?.level ?? 1,
      personal_best: user?.personal_best ?? 0,
      xp_to_next_level: xpService.xpToNextLevel(user?.xp ?? 0),
      current_streak: streak?.current_streak ?? 0,
      longest_streak: streak?.longest_streak ?? 0,
      streak_alive: await streakService.isStreakAlive(userId),
      quizzes_completed: parseInt(stats?.quizzes_completed ?? '0', 10),
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      overall_accuracy:
        totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
      topic_progress: topicProgressResult.rows,
      weak_topics: weakTopics.map((t) => ({
        topic_id: t.topic_id,
        name: t.name,
        slug: t.slug,
        icon: t.icon,
        accuracy: parseFloat(String(t.accuracy)),
        questions_attempted: t.questions_attempted,
      })),
      recent_activity: recentActivity,
      recent_quizzes: recentQuizzes.rows,
      badges: badgeProgress.earned,
      locked_badges: badgeProgress.locked.slice(0, 4),
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** GET /api/progress/topics */
router.get('/topics', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT ltp.topic_id, ltp.accuracy, ltp.questions_attempted, ltp.questions_correct,
              ltp.mastery_percentage, ltp.difficulty_level,
              t.name, t.slug, t.icon, t.color, t.description
       FROM learner_topic_progress ltp
       JOIN topics t ON ltp.topic_id = t.id
       WHERE ltp.user_id = $1
       ORDER BY ltp.mastery_percentage DESC`,
      [req.userId]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Get topic progress error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
