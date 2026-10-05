import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();

const POST_TYPES = ['achievement', 'badge', 'streak', 'challenge', 'general'] as const;
type PostType = (typeof POST_TYPES)[number];

const MAX_CAPTION_LENGTH = 280;

/**
 * Normalise a post into the shape the client renders.
 *
 * `p.*` used to be spread into the response, which leaked the author's user_id
 * alongside the joined display columns and made the payload ambiguous.
 */
const shapePost = (row: any) => ({
  id: row.id,
  type: row.type,
  content: typeof row.content === 'string' ? safeParse(row.content) : row.content,
  caption: row.caption,
  created_at: row.created_at,
  likes_count: parseInt(String(row.likes_count ?? 0), 10),
  liked_by_user: Boolean(row.liked_by_user),
  author: {
    id: row.user_id,
    username: row.username,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    xp: row.xp,
    level: row.level,
  },
});

const safeParse = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return { text: value };
  }
};

/** GET /api/posts - the community feed. Public, with like state when signed in. */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 50);
    const offset = Math.max(parseInt(String(req.query.offset ?? '0'), 10) || 0, 0);

    const result = await query(
      `SELECT p.*, u.username, u.display_name, u.avatar_url, u.xp, u.level,
              COUNT(pl.id) AS likes_count,
              BOOL_OR(pl.user_id = $1) AS liked_by_user
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN post_likes pl ON pl.post_id = p.id
       -- Posts from throwaway guest sessions are not shown to the community.
       WHERE u.is_guest = FALSE
       GROUP BY p.id, u.id
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.userId ?? null, limit, offset]
    );

    return res.json(result.rows.map(shapePost));
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** POST /api/posts */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const body = (req.body ?? {}) as { type?: string; content?: unknown; caption?: string };

    const type = (body.type ?? 'general') as PostType;
    if (!POST_TYPES.includes(type)) {
      return res
        .status(400)
        .json({ error: `type must be one of: ${POST_TYPES.join(', ')}` });
    }

    const caption = typeof body.caption === 'string' ? body.caption.trim() : '';
    if (caption.length > MAX_CAPTION_LENGTH) {
      return res
        .status(400)
        .json({ error: `Caption must be under ${MAX_CAPTION_LENGTH} characters` });
    }

    const rawContent = body.content;
    const content =
      typeof rawContent === 'string'
        ? { text: rawContent.slice(0, MAX_CAPTION_LENGTH) }
        : rawContent && typeof rawContent === 'object'
        ? rawContent
        : {};

    if (caption.length === 0 && Object.keys(content).length === 0) {
      return res.status(400).json({ error: 'Write something before posting' });
    }

    const postId = uuidv4();
    await query(
      `INSERT INTO posts (id, user_id, type, content, caption) VALUES ($1, $2, $3, $4, $5)`,
      [postId, userId, type, JSON.stringify(content), caption || null]
    );

    const created = await query(
      `SELECT p.*, u.username, u.display_name, u.avatar_url, u.xp, u.level,
              0 AS likes_count, FALSE AS liked_by_user
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [postId]
    );

    return res.status(201).json(shapePost(created.rows[0]));
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ error: 'Could not share that. Please try again.' });
  }
});

/** GET /api/posts/mine */
router.get('/mine', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT p.*, u.username, u.display_name, u.avatar_url, u.xp, u.level,
              COUNT(pl.id) AS likes_count,
              BOOL_OR(pl.user_id = $1) AS liked_by_user
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN post_likes pl ON pl.post_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id, u.id
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [req.userId]
    );
    return res.json(result.rows.map(shapePost));
  } catch (error) {
    console.error('Get my posts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** POST /api/posts/:id/like - idempotent like. */
router.post('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.userId!;

    const exists = await query('SELECT 1 FROM posts WHERE id = $1', [postId]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await query(
      `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)
       ON CONFLICT (post_id, user_id) DO NOTHING`,
      [postId, userId]
    );

    const count = await query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM post_likes WHERE post_id = $1',
      [postId]
    );
    return res.json({ liked: true, likes_count: parseInt(count.rows[0].count, 10) });
  } catch (error) {
    console.error('Like post error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** DELETE /api/posts/:id/like - idempotent unlike. */
router.delete('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    await query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [
      postId,
      req.userId,
    ]);

    const count = await query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM post_likes WHERE post_id = $1',
      [postId]
    );
    return res.json({ liked: false, likes_count: parseInt(count.rows[0].count, 10) });
  } catch (error) {
    console.error('Unlike post error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** GET /api/posts/:id */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT p.*, u.username, u.display_name, u.avatar_url, u.xp, u.level,
              COUNT(pl.id) AS likes_count,
              BOOL_OR(pl.user_id = $1) AS liked_by_user
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN post_likes pl ON pl.post_id = p.id
       WHERE p.id = $2
       GROUP BY p.id, u.id`,
      [req.userId ?? null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.json(shapePost(result.rows[0]));
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** DELETE /api/posts/:id - author only. */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found, or it is not yours to delete' });
    }

    return res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
