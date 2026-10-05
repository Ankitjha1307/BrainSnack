import { Router, Request, Response } from 'express';
import { query } from '../db';
import { optionalAuth } from '../middleware/auth';
import { Topic, Concept } from '../types';

const router = Router();

/**
 * GET /api/topics
 *
 * Public catalogue with the signed-in learner's mastery attached, so the topics
 * grid can show real progress bars instead of hardcoded percentages.
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const result = await query<
      Topic & {
        questions_count: string;
        concepts_count: string;
        mastery: string | null;
        accuracy: string | null;
        questions_attempted: number | null;
        difficulty_level: string | null;
      }
    >(
      `SELECT t.*,
              (SELECT COUNT(*) FROM questions q WHERE q.topic_id = t.id) AS questions_count,
              (SELECT COUNT(*) FROM concepts c WHERE c.topic_id = t.id) AS concepts_count,
              ltp.mastery_percentage AS mastery,
              ltp.accuracy,
              ltp.questions_attempted,
              ltp.difficulty_level
       FROM topics t
       LEFT JOIN learner_topic_progress ltp
         ON ltp.topic_id = t.id AND ltp.user_id = $1
       ORDER BY t.name`,
      [req.userId ?? null]
    );

    return res.json(
      result.rows.map((row) => ({
        ...row,
        questions_count: parseInt(String(row.questions_count), 10),
        concepts_count: parseInt(String(row.concepts_count), 10),
        mastery: row.mastery === null ? null : Math.round(parseFloat(String(row.mastery))),
        accuracy: row.accuracy === null ? null : Math.round(parseFloat(String(row.accuracy))),
        questions_attempted: row.questions_attempted ?? 0,
      }))
    );
  } catch (error) {
    console.error('Get topics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** GET /api/topics/:id - accepts a UUID or a slug, plus its concepts. */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const topicResult = await query<Topic>(
      'SELECT * FROM topics WHERE id::text = $1 OR slug = $1',
      [req.params.id]
    );
    if (topicResult.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    const topic = topicResult.rows[0];

    const [conceptsResult, questionCountResult] = await Promise.all([
      query<Concept>('SELECT * FROM concepts WHERE topic_id = $1 ORDER BY name', [topic.id]),
      query<{ count: string }>('SELECT COUNT(*) AS count FROM questions WHERE topic_id = $1', [
        topic.id,
      ]),
    ]);

    return res.json({
      ...topic,
      concepts: conceptsResult.rows,
      question_count: parseInt(questionCountResult.rows[0].count, 10),
    });
  } catch (error) {
    console.error('Get topic error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
