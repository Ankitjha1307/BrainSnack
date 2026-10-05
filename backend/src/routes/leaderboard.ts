import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { xpService } from '../services/xpService';
import { streakService } from '../services/streakService';

const router = Router();

const TYPES = ['daily', 'weekly', 'alltime'] as const;
type BoardType = (typeof TYPES)[number];

/** GET /api/leaderboard?type=daily|weekly|alltime&topic_id=&limit= */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Public: the demo should show a populated board on the sign-in screen.
    const { type = 'alltime', topic_id, limit = '25' } = req.query;

    if (!TYPES.includes(type as BoardType)) {
      return res.status(400).json({ error: `type must be one of: ${TYPES.join(', ')}` });
    }

    const result = await xpService.getLeaderboard(
      type as BoardType,
      typeof topic_id === 'string' && topic_id ? topic_id : undefined,
      undefined,
      parseInt(String(limit), 10) || 25
    );

    return res.json(result);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** GET /api/leaderboard/me - the signed-in learner's rank on each board. */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [daily, weekly, alltime] = await Promise.all([
      xpService.getLeaderboard('daily', undefined, req.userId, 25),
      xpService.getLeaderboard('weekly', undefined, req.userId, 25),
      xpService.getLeaderboard('alltime', undefined, req.userId, 25),
    ]);

    return res.json({
      daily: daily.userRank ?? null,
      weekly: weekly.userRank ?? null,
      alltime: alltime.userRank ?? null,
    });
  } catch (error) {
    console.error('Get my rank error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** GET /api/leaderboard/streaks */
router.get('/streaks', async (_req: Request, res: Response) => {
  try {
    const topStreaks = await streakService.getTopStreaks(10);
    return res.json(topStreaks);
  } catch (error) {
    console.error('Get streak leaderboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
