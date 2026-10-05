import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import { User } from '../types';
import { toPublicUser } from './auth';

const router = Router();

const USER_FIELDS = 'id, username, display_name, avatar_url, xp, level, streak, personal_best, created_at';

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

// GET /api/users/me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await query<User>('SELECT * FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(toPublicUser(result.rows[0]));
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/users/search?q=
 *
 * Escapes LIKE wildcards so a search for "100%" does not match every row.
 */
router.get('/search', authMiddleware, async (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (q.length < 2) {
      // An empty or 1-character query matching the whole table is not useful.
      return res.json([]);
    }

    const result = await query(
      `SELECT ${USER_FIELDS}
       FROM users
       -- Guest rows are throwaway demo sessions; there is nobody to follow.
       WHERE is_guest = FALSE
         AND (username ILIKE $1 ESCAPE '\\' OR display_name ILIKE $1 ESCAPE '\\')
       ORDER BY xp DESC
       LIMIT 20`,
      [`%${escapeLike(q)}%`]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id - public profile, plus the viewer's follow state.
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const result = await query<User>(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let isFollowing = false;
    if (req.userId) {
      const followResult = await query(
        'SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2',
        [req.userId, req.params.id]
      );
      isFollowing = followResult.rows.length > 0;
    }

    return res.json({
      ...toPublicUser(result.rows[0] as User),
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
    const result = await query(
      `SELECT
         (SELECT COUNT(*) FROM quizzes WHERE user_id = $1 AND status = 'completed') AS quizzes_completed,
         (SELECT COUNT(*) FROM quiz_attempts qa JOIN quizzes q ON q.id = qa.quiz_id
           WHERE q.user_id = $1 AND q.status = 'completed') AS questions_answered,
         (SELECT COUNT(*) FROM quiz_attempts qa JOIN quizzes q ON q.id = qa.quiz_id
           WHERE q.user_id = $1 AND q.status = 'completed' AND qa.is_correct) AS questions_correct,
         (SELECT COUNT(*) FROM follows WHERE followee_id = $1) AS followers,
         (SELECT COUNT(*) FROM follows WHERE follower_id = $1) AS following`,
      [req.params.id]
    );

    const row = result.rows[0];
    const answered = parseInt(String(row.questions_answered), 10);
    const correct = parseInt(String(row.questions_correct), 10);

    return res.json({
      quizzes_completed: parseInt(String(row.quizzes_completed), 10),
      questions_answered: answered,
      questions_correct: correct,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      followers: parseInt(String(row.followers), 10),
      following: parseInt(String(row.following), 10),
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id/followers
router.get('/:id/followers', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT ${USER_FIELDS.split(', ').map((f) => `u.${f}`).join(', ')}
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.followee_id = $1
       ORDER BY u.xp DESC`,
      [req.params.id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Get followers error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id/following
router.get('/:id/following', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT ${USER_FIELDS.split(', ').map((f) => `u.${f}`).join(', ')}
       FROM follows f
       JOIN users u ON f.followee_id = u.id
       WHERE f.follower_id = $1
       ORDER BY u.xp DESC`,
      [req.params.id]
    );
    return res.json(result.rows);
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

    const targetUser = await query<{ username: string }>(
      'SELECT username FROM users WHERE id = $1',
      [targetUserId]
    );
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await query(
      `INSERT INTO follows (follower_id, followee_id) VALUES ($1, $2)
       ON CONFLICT (follower_id, followee_id) DO NOTHING`,
      [followerId, targetUserId]
    );

    return res.json({ following: true, message: `Following @${targetUser.rows[0].username}` });
  } catch (error) {
    console.error('Follow error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id/follow
router.delete('/:id/follow', authMiddleware, async (req: Request, res: Response) => {
  try {
    await query('DELETE FROM follows WHERE follower_id = $1 AND followee_id = $2', [
      req.userId,
      req.params.id,
    ]);
    return res.json({ following: false });
  } catch (error) {
    console.error('Unfollow error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
