import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { xpService } from '../services/xpService';
import { Challenge, Topic, Quiz, User, newId } from '../models';

const router = Router();

const CHALLENGE_XP = 100;
const MIN_TARGET_SCORE = 50;

/** Lookups shared by every read, so a challenge always carries both users and its topic. */
const challengeLookups: any[] = [
  { $lookup: { from: 'users', localField: 'challenger_id', foreignField: '_id', as: 'challenger' } },
  { $unwind: '$challenger' },
  { $lookup: { from: 'users', localField: 'challengee_id', foreignField: '_id', as: 'challengee' } },
  { $unwind: '$challengee' },
  { $lookup: { from: 'topics', localField: 'topic_id', foreignField: '_id', as: 'topic' } },
  { $unwind: { path: '$topic', preserveNullAndEmptyArrays: true } },
];

const findChallenge = async (id: string, userId?: string) => {
  const match: Record<string, unknown> = { _id: id };
  if (userId) {
    match.$or = [{ challenger_id: userId }, { challengee_id: userId }];
  }
  const rows = await Challenge.aggregate([{ $match: match }, ...challengeLookups]);
  return rows[0] ?? null;
};

/** Flatten the looked-up documents into the nested shape the UI renders. */
const shapeChallenge = (row: any, viewerId?: string) => {
  const challengerScore = row.challenger_score ?? null;
  const challengeeScore = row.challengee_score ?? null;
  const scores: Record<string, number | null> = {
    [row.challenger_id]: challengerScore,
    [row.challengee_id]: challengeeScore,
  };

  let winnerId: string | null = null;
  if (row.status === 'completed' && challengerScore !== null && challengeeScore !== null) {
    if (challengerScore > challengeeScore) winnerId = row.challenger_id;
    else if (challengeeScore > challengerScore) winnerId = row.challengee_id;
  }

  const viewerScore = viewerId ? scores[viewerId] ?? null : null;

  return {
    id: String(row._id),
    topic_id: row.topic_id ?? null,
    topic_name: row.topic?.name ?? 'General Knowledge',
    topic_icon: row.topic?.icon ?? '🧠',
    topic_slug: row.topic?.slug ?? null,
    target_score: row.target_score,
    status: row.status,
    created_at: row.created_at,
    completed_at: row.completed_at,
    challenger: {
      id: row.challenger_id,
      username: row.challenger.username,
      display_name: row.challenger.display_name,
      avatar_url: row.challenger.avatar_url,
      xp: row.challenger.xp,
      level: row.challenger.level,
      streak: row.challenger.streak,
      score: challengerScore,
    },
    challengee: {
      id: row.challengee_id,
      username: row.challengee.username,
      display_name: row.challengee.display_name,
      avatar_url: row.challengee.avatar_url,
      xp: row.challengee.xp,
      level: row.challengee.level,
      streak: row.challengee.streak,
      score: challengeeScore,
    },
    // Which side the viewer is on - drives the CTA in the UI.
    viewer_role:
      viewerId === row.challenger_id
        ? 'challenger'
        : viewerId === row.challengee_id
        ? 'challengee'
        : null,
    viewer_score: viewerScore,
    viewer_has_submitted: viewerScore !== null,
    target_reached: viewerScore !== null ? viewerScore >= row.target_score : null,
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

    const challengee = await User.findById(challengee_id).select('_id').lean();
    if (!challengee) {
      return res.status(404).json({ error: 'That learner no longer exists' });
    }

    let resolvedTopicId: string | null = null;
    if (topic_id) {
      const topic = await Topic.findOne({
        $or: [{ _id: String(topic_id) }, { slug: String(topic_id) }],
      })
        .select('_id')
        .lean();
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      resolvedTopicId = String((topic as any)._id);
    }

    // One open challenge per pair per topic: otherwise the inbox fills with
    // identical requests and nobody can tell which one to accept.
    const duplicate = await Challenge.exists({
      challenger_id: challengerId,
      challengee_id,
      status: { $in: ['pending', 'accepted'] },
      topic_id: resolvedTopicId,
    });
    if (duplicate) {
      return res.status(409).json({ error: 'You already have an open challenge with them' });
    }

    const createId = newId();
    await Challenge.create({
      _id: createId,
      challenger_id: challengerId,
      challengee_id,
      topic_id: resolvedTopicId,
      target_score: target,
      status: 'pending',
    });

    const created = await findChallenge(createId);
    return res.status(201).json(shapeChallenge(created, challengerId));
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

    const match: Record<string, unknown> = {
      $or: [{ challenger_id: userId }, { challengee_id: userId }],
    };
    if (typeof status === 'string' && status) {
      match.status = status;
    }

    const rows = await Challenge.aggregate([
      { $match: match },
      ...challengeLookups,
      {
        // Accepted first, then pending, then everything else.
        $addFields: {
          status_order: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 'accepted'] }, then: 0 },
                { case: { $eq: ['$status', 'pending'] }, then: 1 },
              ],
              default: 2,
            },
          },
        },
      },
      { $sort: { status_order: 1, created_at: -1 } },
      { $limit: 50 },
    ]);

    return res.json(rows.map((row) => shapeChallenge(row, userId)));
  } catch (error) {
    console.error('Get challenges error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** GET /api/challenges/:id */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const row = await findChallenge(req.params.id, req.userId!);
    if (!row) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    return res.json(shapeChallenge(row, req.userId!));
  } catch (error) {
    console.error('Get challenge error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** POST /api/challenges/:id/accept - challengee only. */
router.post('/:id/accept', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const updated = await Challenge.findOneAndUpdate(
      { _id: req.params.id, challengee_id: userId, status: 'pending' },
      { $set: { status: 'accepted' } },
      { new: true }
    );
    if (!updated) {
      return res.status(409).json({ error: 'This challenge is not waiting on you' });
    }

    const row = await findChallenge(req.params.id);
    return res.json(shapeChallenge(row, userId));
  } catch (error) {
    console.error('Accept challenge error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** POST /api/challenges/:id/decline - challengee only. */
router.post('/:id/decline', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const updated = await Challenge.findOneAndUpdate(
      { _id: req.params.id, challengee_id: userId, status: 'pending' },
      { $set: { status: 'declined' } },
      { new: true }
    );
    if (!updated) {
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
 * the request body - a client must not be able to submit `{ score: 100 }`.
 */
router.post('/:id/submit', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { quiz_id } = (req.body ?? {}) as { quiz_id?: string };

    if (!quiz_id) {
      return res.status(400).json({ error: 'quiz_id is required' });
    }

    const challenge = await Challenge.findOne({
      _id: req.params.id,
      $or: [{ challenger_id: userId }, { challengee_id: userId }],
    }).lean();
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if ((challenge as any).status !== 'accepted') {
      return res.status(400).json({
        error:
          (challenge as any).status === 'pending'
            ? 'Accept the challenge first'
            : 'This challenge is closed',
      });
    }

    // The quiz must belong to the caller, be finished, and cover the challenge topic.
    const quiz = await Quiz.findOne({ _id: quiz_id, user_id: userId, status: 'completed' }).lean();
    if (!quiz) {
      return res.status(404).json({ error: 'Finish a quiz first, then submit its result' });
    }

    if (
      (challenge as any).topic_id &&
      (quiz as any).topic_id &&
      (challenge as any).topic_id !== (quiz as any).topic_id
    ) {
      return res
        .status(400)
        .json({ error: 'That quiz is for a different topic than the challenge' });
    }

    const isChallenger = (challenge as any).challenger_id === userId;
    const scoreField = isChallenger ? 'challenger_score' : 'challengee_score';
    await Challenge.updateOne({ _id: (challenge as any)._id }, { $set: { [scoreField]: (quiz as any).score } });

    const updated = await Challenge.findById((challenge as any)._id).lean();
    const challengerScore = (updated as any).challenger_score;
    const challengeeScore = (updated as any).challengee_score;

    if (challengerScore !== null && challengeeScore !== null) {
      const challengerWon = challengerScore > challengeeScore;
      const challengeeWon = challengeeScore > challengerScore;
      const winnerId = challengerWon
        ? (updated as any).challenger_id
        : challengeeWon
        ? (updated as any).challengee_id
        : null;

      await Challenge.updateOne(
        { _id: (challenge as any)._id },
        { $set: { status: 'completed', completed_at: new Date() } }
      );

      if (winnerId) {
        await xpService.awardXP(
          winnerId,
          CHALLENGE_XP,
          `Won a challenge (${challengerScore}% vs ${challengeeScore}%)`,
          'challenge',
          String((challenge as any)._id)
        );
      }

      const final = await findChallenge(String((challenge as any)._id));
      return res.json({
        challenge: shapeChallenge(final, userId),
        result: winnerId ? 'decided' : 'draw',
        winner_id: winnerId,
      });
    }

    const partial = await findChallenge(String((challenge as any)._id));
    return res.json({
      challenge: shapeChallenge(partial, userId),
      result: 'waiting_for_opponent',
      your_score: (quiz as any).score,
      target_score: (challenge as any).target_score,
      target_reached: (quiz as any).score >= (challenge as any).target_score,
    });
  } catch (error) {
    console.error('Submit challenge error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
