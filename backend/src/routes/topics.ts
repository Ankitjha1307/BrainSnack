import { Router, Request, Response } from 'express';
import { optionalAuth } from '../middleware/auth';
import { Topic, Concept, Question, LearnerTopicProgress } from '../models';

const router = Router();

/** Turn a lean document's `_id` into the `id` the frontend expects. */
const withId = (doc: any): Record<string, unknown> => {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
};

/**
 * GET /api/topics
 *
 * Public catalogue with the signed-in learner's mastery attached, so the topics
 * grid can show real progress bars instead of hardcoded percentages.
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const [topics, progress, questionCounts, conceptCounts] = await Promise.all([
      Topic.find().sort({ name: 1 }).lean(),
      userId ? LearnerTopicProgress.find({ user_id: userId }).lean() : Promise.resolve([]),
      Question.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$topic_id', count: { $sum: 1 } } },
      ]),
      Concept.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$topic_id', count: { $sum: 1 } } },
      ]),
    ]);

    const progressByTopic = new Map(progress.map((p: any) => [String(p.topic_id), p]));
    const questionsByTopic = new Map(questionCounts.map((r) => [String(r._id), r.count]));
    const conceptsByTopic = new Map(conceptCounts.map((r) => [String(r._id), r.count]));

    return res.json(
      topics.map((topic: any) => {
        const id = String(topic._id);
        const own = progressByTopic.get(id);
        return {
          ...withId(topic),
          questions_count: questionsByTopic.get(id) ?? 0,
          concepts_count: conceptsByTopic.get(id) ?? 0,
          mastery: own ? Math.round(own.mastery_percentage) : null,
          accuracy: own ? Math.round(own.accuracy) : null,
          questions_attempted: own?.questions_attempted ?? 0,
          difficulty_level: own?.difficulty_level ?? null,
        };
      })
    );
  } catch (error) {
    console.error('Get topics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/** GET /api/topics/:id - accepts a UUID or a slug, plus its concepts. */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
    }).lean();
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const topicId = String((topic as any)._id);

    const [concepts, questionCount] = await Promise.all([
      Concept.find({ topic_id: topicId }).sort({ name: 1 }).lean(),
      Question.countDocuments({ topic_id: topicId }),
    ]);

    return res.json({
      ...withId(topic),
      concepts: concepts.map(withId),
      question_count: questionCount,
    });
  } catch (error) {
    console.error('Get topic error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
