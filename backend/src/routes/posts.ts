import { Router, Request, Response } from 'express';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import { Post, User } from '../models';

const router = Router();

const POST_TYPES = ['achievement', 'badge', 'streak', 'challenge', 'general'] as const;
type PostType = (typeof POST_TYPES)[number];

const MAX_CAPTION_LENGTH = 280;

/**
 * Shape a post (either a projected aggregate row or a hand-built object) into
 * the payload the client renders.
 */
const shapePost = (row: any) => ({
  id: String(row.id ?? row._id),
  type: row.type,
  content: row.content ?? {},
  caption: row.caption ?? null,
  created_at: row.created_at,
  likes_count: Number(row.likes_count ?? 0),
  liked_by_user: Boolean(row.liked_by_user),
  author: {
    id: row.user_id ?? row.author_id,
    username: row.username,
    display_name: row.display_name,
    avatar_url: row.avatar_url ?? null,
    xp: row.xp,
    level: row.level,
  },
});

/**
 * Aggregate pipeline for a feed. `likes` is embedded on the post, so counts and
 * the viewer's like state need no join.
 */
const feedPipeline = (match: Record<string, unknown>, viewerId: string | null): any[] => [
  { $match: match },
  { $sort: { created_at: -1 } },
  { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'author' } },
  { $unwind: '$author' },
  {
    $project: {
      _id: 0,
      id: '$_id',
      type: 1,
      content: 1,
      caption: 1,
      created_at: 1,
      user_id: 1,
      is_guest: '$author.is_guest',
      username: '$author.username',
      display_name: '$author.display_name',
      avatar_url: '$author.avatar_url',
      xp: '$author.xp',
      level: '$author.level',
      likes_count: { $size: { $ifNull: ['$likes', []] } },
      liked_by_user: viewerId ? { $in: [viewerId, { $ifNull: ['$likes', []] }] } : false,
    },
  },
];

/** GET /api/posts - the community feed. Public, with like state when signed in. */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 50);
    const offset = Math.max(parseInt(String(req.query.offset ?? '0'), 10) || 0, 0);

    const rows = await Post.aggregate([
      // Posts from throwaway guest sessions are not shown to the community.
      ...feedPipeline({}, req.userId ?? null),
      { $match: { is_guest: false } },
      { $skip: offset },
      { $limit: limit },
    ]);

    return res.json(rows.map(shapePost));
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
      return res.status(400).json({ error: `type must be one of: ${POST_TYPES.join(', ')}` });
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

    const post = await Post.create({
      user_id: userId,
      type,
      content,
      caption: caption || null,
      likes: [],
    });

    const author = await User.findById(userId)
      .select('username display_name avatar_url xp level')
      .lean();

    return res.status(201).json(
      shapePost({
        id: String((post as any)._id),
        type: (post as any).type,
        content: (post as any).content,
        caption: (post as any).caption,
        created_at: (post as any).created_at,
        likes_count: 0,
        liked_by_user: false,
        user_id: userId,
        username: (author as any)?.username,
        display_name: (author as any)?.display_name,
        avatar_url: (author as any)?.avatar_url,
        xp: (author as any)?.xp,
        level: (author as any)?.level,
      })
    );
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ error: 'Could not share that. Please try again.' });
  }
});

/** GET /api/posts/mine */
router.get('/mine', authMiddleware, async (req: Request, res: Response) => {
  try {
    const rows = await Post.aggregate([
      ...feedPipeline({ user_id: req.userId }, req.userId!),
      { $limit: 50 },
    ]);
    return res.json(rows.map(shapePost));
  } catch (error) {
    console.error('Get my posts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** POST /api/posts/:id/like - idempotent like. */
router.post('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: req.userId! } },
      { new: true }
    )
      .select('likes')
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.json({ liked: true, likes_count: (post as any).likes?.length ?? 0 });
  } catch (error) {
    console.error('Like post error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** DELETE /api/posts/:id/like - idempotent unlike. */
router.delete('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.userId! } },
      { new: true }
    )
      .select('likes')
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.json({ liked: false, likes_count: (post as any).likes?.length ?? 0 });
  } catch (error) {
    console.error('Unlike post error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** GET /api/posts/:id */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const rows = await Post.aggregate([
      ...feedPipeline({ _id: req.params.id }, req.userId ?? null),
      { $limit: 1 },
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.json(shapePost(rows[0]));
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** DELETE /api/posts/:id - author only. */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await Post.deleteOne({ _id: req.params.id, user_id: req.userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Post not found, or it is not yours to delete' });
    }

    return res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
