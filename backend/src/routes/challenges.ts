import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { authMiddleware } from '../middleware/auth';
import { Challenge } from '../types';
import { xpService } from '../services/xpService';

const router = Router();

const CHALLENGE_XP = 100;
const MIN_TARGET_SCORE = 50;

const CHALLENGE_SELECT = `
  SELECT c.*,
         cu.username AS challenger_username, cu.display_name AS challenger_display_name,
         cu.avatar_url AS challenger_avatar_url, cu.xp AS challenger_xp, cu.level AS challenger_level,
         cu.streak AS challenger_streak,
         eu.username AS challengee_username, eu.display_name AS challengee_display_name,
         eu.avatar_url AS challengee_avatar_url, eu.xp AS challengee_xp, eu.level AS challengee_level,
         eu.streak AS challengee_streak,
         t.name AS topic_name, t.icon AS topic_icon, t.slug AS topic_slug
  FROM challenges c
  JOIN users cu ON c.challenger_id = cu.id
  JOIN users eu ON c.challengee_id = eu.id
  LEFT JOIN topics t ON c.topic_id = t.id
`;

/** Flatten the aliased join columns into the nested shape the UI renders. */
const shapeChallenge = (row: any, viewerId?: string) => {
  const scores: Record<string, number | null> = {
    [row.challenger_id]: row.challenger_score,
    [row.challengee_id]: row.challengee_score,
  };

  let winnerId: string | null = null;
  if (row.status === 'completed') {
    if (row.challenger_score !== null && row.challengee_score !== null) {
      if (row.challenger_score > row.challengee_score) winnerId = row.challenger_id;
      else if (row.challengee_score > row.challenger_score) winnerId = row.challengee_id;
    }
  }

  return {
    id: row.id,
    topic_id: row.topic_id,
    topic_name: row.topic_name ?? 'General Knowledge',
    topic_icon: row.topic_icon ?? '🧠',
    topic_slug: row.topic_slug,
    target_score: row.target_score,
    status: row.status,
    created_at: row.created_at,
    completed_at: row.completed_at,
    challenger: {
      id: row.challenger_id,
      username: row.challenger_username,
      display_name: row.challenger_display_name,
      avatar_url: row.challenger_avatar_url,
      xp: row.challenger_xp,
      level: row.challenger_level,
      streak: row.challenger_streak,
      score: row.challenger_score,
    },
    challengee: {
      id: row.challengee_id,
      username: row.challengee_username,
      display_name: row.challengee_display_name,
      avatar_url: row.challengee_avatar_url,
      xp: row.challengee_xp,
      level: row.challengee_level,
      streak: row.challengee_streak,
      score: row.challengee_score,
    },
    // Which side the viewer is on - drives the CTA in the UI.
    viewer_role: viewerId === row.challenger_id ? 'challenger' : viewerId === row.challengee_id ? 'challengee' : null,
    viewer_score: viewerId ? scores[viewerId] ?? null : null,
    viewer_has_submitted: viewerId ? scores[viewerId] !== null && scores[viewerId] !== undefined : false,
    target_reached:
      viewerId !== undefined && scores[viewerId] !== null && scores[viewerId] !== undefined
        ? scores[viewerId] >= row.target_score
        : null,
    winner_id: winnerId,
  };
};

/** POST /api/challenges */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const challengerId = req.userId!;
    const { challengee_id, topic_id, target_score = 80 } = (req.body ?? {}) as {
      challengee_id?: string;
      topic_id?: string;
      target_score?: number;
    };

    if (!challengee_id) {
      return res.status(400).json({ error: 'Choose someone to challenge' });
    }
    if (challengee_id === challengerId) {
      return res.status(400).json({ error: 'You cannot challenge yourself' });
    }

    const target = Number(target_score);
    if (!Number.isFinite(target) || target < MIN_TARGET_SCORE || target > 100) {
      return res
        .status(400)
        .json({ error: `Target score must be between ${MIN_TARGET_SCORE} and 100` });
    }

    const challengeeResult = await query('SELECT id FROM users WHERE id = $1', [challengee_id]);
    if (challengeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'That learner no longer exists' });
    }

    let resolvedTopicId: string | null = null;
    if (topic_id) {
      const topicResult = await query<{ id: string }>(
        'SELECT id FROM topics WHERE id::text = $1 OR slug = $1',
        [String(topic_id)]
      );
      if (topicResult.rows.length === 0) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      resolvedTopicId = topicResult.rows[0].id;
    }

    // One open challenge per pair per topic: otherwise the inbox fills with
    // identical requests and nobody can tell which one to accept.
    const duplicate = await query(
      `SELECT 1 FROM challenges
       WHERE challenger_id = $1 AND challengee_id = $2
         AND status IN ('pending', 'accepted')
         AND topic_id IS NOT DISTINCT FROM $3`,
      [challengerId, challengee_id, resolvedTopicId]
    );
    if (duplicate.rows.length > 0) {
      return res.status(409).json({ error: 'You already have an open challenge with them' });
    }

    const challengeId = uuidv4();
    await query(
      `INSERT INTO challenges (id, challenger_id, challengee_id, topic_id, target_score, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')`,
      [challengeId, challengerId, challengee_id, resolvedTopicId, target]
    );

    const created = await query(`${CHALLENGE_SELECT} WHERE c.id = $1`, [challengeId]);
    return res.status(201).json(shapeChallenge(created.rows[0], challengerId));
  } catch (error) {
    console.error('Create challenge error:', error);
    return res.status(500).json({ error: 'Could not create that challenge' });
  }
});

/** GET /api/challenges - every challenge the signed-in learner is involved in. */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { status } = req.query;

    const params: unknown[] = [userId];
    let statusFilter = '';
    if (typeof status === 'string' && status) {
      params.push(status);
      statusFilter = ` AND c.status = $${params.length}`;
    }

    const result = await query(
      `${CHALLENGE_SELECT}
       WHERE (c.challenger_id = $1 OR c.challengee_id = $1)${statusFilter}
       ORDER BY
         CASE c.status WHEN 'accepted' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END,
         c.created_at DESC
       LIMIT 50`,
      params
    );

    return res.json(result.rows.map((row) => shapeChallenge(row, userId)));
  } catch (error) {
    console.error('Get challenges error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** GET /api/challenges/:id */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const result = await query(
      `${CHALLENGE_SELECT}
       WHERE c.id = $1 AND (c.challenger_id = $2 OR c.challengee_id = $2)`,
      [req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    return res.json(shapeChallenge(result.rows[0], userId));
  } catch (error) {
    console.error('Get challenge error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** POST /api/challenges/:id/accept - challengee only. */
router.post('/:id/accept', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const result = await query(
      `UPDATE challenges SET status = 'accepted'
       WHERE id = $1 AND challengee_id = $2 AND status = 'pending'
       RETURNING id`,
      [req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'This challenge is not waiting on you' });
    }

    const full = await query(`${CHALLENGE_SELECT} WHERE c.id = $1`, [req.params.id]);
    return res.json(shapeChallenge(full.rows[0], userId));
  } catch (error) {
    console.error('Accept challenge error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** POST /api/challenges/:id/decline - challengee only. */
router.post('/:id/decline', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const result = await query(
      `UPDATE challenges SET status = 'declined'
       WHERE id = $1 AND challengee_id = $2 AND status = 'pending'
       RETURNING id`,
      [req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'This challenge is not waiting on you' });
    }
    return res.json({ id: req.params.id, status: 'declined' });
  } catch (error) {
    console.error('Decline challenge error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/challenges/:id/submit  { quiz_id }
 *
 * The score is read from a completed quiz the caller actually took, never from
 * the request body - the previous `POST /complete` accepted `{ score: 100 }`
 * directly, which made challenges free XP.
 */
router.post('/:id/submit', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { quiz_id } = (req.body ?? {}) as { quiz_id?: string };

    if (!quiz_id) {
      return res.status(400).json({ error: 'quiz_id is required' });
    }

    const challengeResult = await query<Challenge>(
      'SELECT * FROM challenges WHERE id = $1 AND (challenger_id = $2 OR challengee_id = $2)',
      [req.params.id, userId]
    );
    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    const challenge = challengeResult.rows[0];

    if (challenge.status !== 'accepted') {
      return res
        .status(400)
        .json({ error: challenge.status === 'pending' ? 'Accept the challenge first' : 'This challenge is closed' });
    }

    // The quiz must belong to the caller, be finished, and cover the challenge topic.
    const quizResult = await query<{ id: string; score: number; topic_id: string | null }>(
      `SELECT id, score, topic_id FROM quizzes
       WHERE id = $1 AND user_id = $2 AND status = 'completed'`,
      [quiz_id, userId]
    );
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Finish a quiz first, then submit its result' });
    }
    const quiz = quizResult.rows[0];

    if (challenge.topic_id && quiz.topic_id && challenge.topic_id !== quiz.topic_id) {
      return res.status(400).json({ error: 'That quiz is for a different topic than the challenge' });
    }

    const isChallenger = challenge.challenger_id === userId;
    await query(
      isChallenger
        ? 'UPDATE challenges SET challenger_score = $1 WHERE id = $2'
        : 'UPDATE challenges SET challengee_score = $1 WHERE id = $2',
      [quiz.score, challenge.id]
    );

    const refreshed = await query<Challenge>('SELECT * FROM challenges WHERE id = $1', [
      challenge.id,
    ]);
    const updated = refreshed.rows[0];

    if (updated.challenger_score !== null && updated.challengee_score !== null) {
      const challengerWon = updated.challenger_score > updated.challengee_score;
      const challengeeWon = updated.challengee_score > updated.challenger_score;
      const winnerId = challengerWon
        ? updated.challenger_id
        : challengeeWon
        ? updated.challengee_id
        : null;

      await query(
        `UPDATE challenges SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [challenge.id]
      );

      if (winnerId) {
        await xpService.awardXP(
          winnerId,
          CHALLENGE_XP,
          `Won a challenge (${updated.challenger_score}% vs ${updated.challengee_score}%)`,
          'challenge',
          challenge.id
        );
      }

      const final = await query(`${CHALLENGE_SELECT} WHERE c.id = $1`, [challenge.id]);
      return res.json({
        challenge: shapeChallenge(final.rows[0], userId),
        result: winnerId ? 'decided' : 'draw',
        winner_id: winnerId,
      });
    }

    const partial = await query(`${CHALLENGE_SELECT} WHERE c.id = $1`, [challenge.id]);
    return res.json({
      challenge: shapeChallenge(partial.rows[0], userId),
      result: 'waiting_for_opponent',
      your_score: quiz.score,
      target_score: challenge.target_score,
      target_reached: quiz.score >= challenge.target_score,
    });
  } catch (error) {
    console.error('Submit challenge error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
