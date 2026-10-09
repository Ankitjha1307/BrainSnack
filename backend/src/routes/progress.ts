import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { xpService } from '../services/xpService';
import { badgeService } from '../services/badgeService';
import { streakService } from '../services/streakService';
import { adaptiveService } from '../services/adaptiveService';
import { User, Quiz, QuizAttempt, LearnerTopicProgress } from '../models';

const router = Router();

/** Learner topic progress joined with its topic, as the dashboard consumes it. */
const topicProgressPipeline = (userId: string): any[] => [
  { $match: { user_id: userId } },
  { $lookup: { from: 'topics', localField: 'topic_id', foreignField: '_id', as: 'topic' } },
  { $unwind: '$topic' },
  { $sort: { mastery_percentage: -1 } },
  {
    $project: {
      _id: 0,
      topic_id: 1,
      accuracy: 1,
      questions_attempted: 1,
      questions_correct: 1,
      mastery_percentage: 1,
      difficulty_level: 1,
      name: '$topic.name',
      slug: '$topic.slug',
      icon: '$topic.icon',
      color: '$topic.color',
      description: '$topic.description',
    },
  },
];

/**
 * GET /api/progress
 *
 * Everything the dashboard and profile need in one round trip. Accuracy is
 * derived from actual `quiz_attempts` documents, not from `score * question_count`,
 * which drifts out of sync the moment a learner skips or revisits a question.
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [user, quizStats, topicProgress, recentActivity, badgeProgress, streak, weakTopics, recentQuizzes] =
      await Promise.all([
        User.findById(userId).select('xp level personal_best').lean(),
        QuizAttempt.aggregate<{ total: number; correct: number }>([
          { $lookup: { from: 'quizzes', localField: 'quiz_id', foreignField: '_id', as: 'quiz' } },
          { $unwind: '$quiz' },
          { $match: { 'quiz.user_id': userId, 'quiz.status': 'completed' } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              correct: { $sum: { $cond: ['$is_correct', 1, 0] } },
            },
          },
        ]),
        LearnerTopicProgress.aggregate(topicProgressPipeline(userId)),
        xpService.getXPTransactions(userId, 10),
        badgeService.getBadgeProgress(userId),
        streakService.getStreak(userId),
        adaptiveService.getWeakestTopics(userId, 3),
        Quiz.aggregate([
          { $match: { user_id: userId, status: 'completed' } },
          { $sort: { completed_at: -1 } },
          { $limit: 5 },
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
              score: 1,
              xp_earned: 1,
              created_at: 1,
              completed_at: 1,
            },
          },
        ]),
      ]);

    const quizzesCompleted = await Quiz.countDocuments({ user_id: userId, status: 'completed' });
    const totalQuestions = quizStats[0]?.total ?? 0;
    const correctAnswers = quizStats[0]?.correct ?? 0;

    return res.json({
      total_xp: (user as any)?.xp ?? 0,
      level: (user as any)?.level ?? 1,
      personal_best: (user as any)?.personal_best ?? 0,
      xp_to_next_level: xpService.xpToNextLevel((user as any)?.xp ?? 0),
      current_streak: streak?.current_streak ?? 0,
      longest_streak: streak?.longest_streak ?? 0,
      streak_alive: await streakService.isStreakAlive(userId),
      quizzes_completed: quizzesCompleted,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      overall_accuracy:
        totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
      topic_progress: topicProgress,
      weak_topics: weakTopics.map((t) => ({
        topic_id: t.topic_id,
        name: t.name,
        slug: t.slug,
        icon: t.icon,
        accuracy: Number(t.accuracy),
        questions_attempted: t.questions_attempted,
      })),
      recent_activity: recentActivity,
      recent_quizzes: recentQuizzes,
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
    const rows = await LearnerTopicProgress.aggregate(topicProgressPipeline(req.userId!));
    return res.json(rows);
  } catch (error) {
    console.error('Get topic progress error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
