import { Router, Request, Response } from 'express';
import { PipelineStage } from 'mongoose';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import { User as UserModel, Quiz, QuizAttempt, Follow } from '../models';
import { toPublicUser } from './auth';

const router = Router();

const USER_PROJECTION = 'username display_name avatar_url xp level streak personal_best is_guest created_at';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/users/me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.userId).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(toPublicUser(user));
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/users/search?q=
 *
 * Escapes regex metacharacters so a search for "100%" is treated literally.
 * Guest rows are throwaway demo sessions; there is nobody to follow.
 */
router.get('/search', authMiddleware, async (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (q.length < 2) {
      // An empty or 1-character query matching the whole table is not useful.
      return res.json([]);
    }

    const re = new RegExp(escapeRegex(q), 'i');
    const users = await UserModel.find({
      is_guest: false,
      $or: [{ username: re }, { display_name: re }],
    })
      .select(USER_PROJECTION)
      .sort({ xp: -1 })
      .limit(20)
      .lean();

    return res.json(users.map(toPublicUser));
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id - public profile, plus the viewer's follow state.
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id).select(USER_PROJECTION).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let isFollowing = false;
    if (req.userId) {
      isFollowing = Boolean(
        await Follow.exists({ follower_id: req.userId, followee_id: req.params.id })
      );
    }

    return res.json({
      ...toPublicUser(user),
      is_following: isFollowing,
      is_me: req.userId === req.params.id,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id/stats
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const [quizzesCompleted, attemptStats, followers, following] = await Promise.all([
      Quiz.countDocuments({ user_id: userId, status: 'completed' }),
      QuizAttempt.aggregate([
        { $lookup: { from: 'quizzes', localField: 'quiz_id', foreignField: '_id', as: 'quiz' } },
        { $unwind: '$quiz' },
        { $match: { 'quiz.user_id': userId, 'quiz.status': 'completed' } },
        {
          $group: {
            _id: null,
            answered: { $sum: 1 },
            correct: { $sum: { $cond: ['$is_correct', 1, 0] } },
          },
        },
      ]),
      Follow.countDocuments({ followee_id: userId }),
      Follow.countDocuments({ follower_id: userId }),
    ]);

    const answered = attemptStats[0]?.answered ?? 0;
    const correct = attemptStats[0]?.correct ?? 0;

    return res.json({
      quizzes_completed: quizzesCompleted,
      questions_answered: answered,
      questions_correct: correct,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      followers,
      following,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** Shared shape for follower/following lists. */
const relatedUsers = (localField: string, foreignField: string): PipelineStage[] => [
  { $lookup: { from: 'users', localField, foreignField, as: 'user' } },
  { $unwind: '$user' },
  { $sort: { 'user.xp': -1 } },
  {
    $project: {
      _id: 0,
      id: '$user._id',
      username: '$user.username',
      display_name: '$user.display_name',
      avatar_url: '$user.avatar_url',
      xp: '$user.xp',
      level: '$user.level',
      streak: '$user.streak',
      personal_best: '$user.personal_best',
      is_guest: '$user.is_guest',
      created_at: '$user.created_at',
    },
  },
];

const runRelatedUsers = async (matchField: string, matchValue: string) => {
  const lookup =
    matchField === 'followee_id'
      ? relatedUsers('follower_id', '_id')
      : relatedUsers('followee_id', '_id');
  return Follow.aggregate([{ $match: { [matchField]: matchValue } }, ...lookup]);
};

// GET /api/users/:id/followers
router.get('/:id/followers', async (req: Request, res: Response) => {
  try {
    const rows = await runRelatedUsers('followee_id', req.params.id);
    return res.json(rows.map(toPublicUser));
  } catch (error) {
    console.error('Get followers error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id/following
router.get('/:id/following', async (req: Request, res: Response) => {
  try {
    const rows = await runRelatedUsers('follower_id', req.params.id);
    return res.json(rows.map(toPublicUser));
  } catch (error) {
    console.error('Get following error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/users/:id/follow - idempotent.
 *
 * Following twice is a no-op rather than a silent unfollow, so a double-click
 * or a client retry cannot reverse the action the user asked for.
 */
router.post('/:id/follow', authMiddleware, async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const followerId = req.userId!;

    if (targetUserId === followerId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    const targetUser = await UserModel.findById(targetUserId).select('username').lean();
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    try {
      await Follow.create({ follower_id: followerId, followee_id: targetUserId });
    } catch (error: any) {
      // Already following: that is success for an idempotent endpoint.
      if (error?.code !== 11000) throw error;
    }

    return res.json({ following: true, message: `Following @${(targetUser as any).username}` });
  } catch (error) {
    console.error('Follow error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id/follow
router.delete('/:id/follow', authMiddleware, async (req: Request, res: Response) => {
  try {
    await Follow.deleteOne({ follower_id: req.userId, followee_id: req.params.id });
    return res.json({ following: false });
  } catch (error) {
    console.error('Unfollow error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
