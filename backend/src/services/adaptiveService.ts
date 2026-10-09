import { LearnerTopicProgress, LearnerConceptProgress } from '../models';

/**
 * Adaptive mastery model.
 *
 * mastery = accuracy * (0.7 + 0.3 * volumeFactor)
 *   i.e. a learner cannot claim mastery from one lucky answer; they need volume.
 *
 * Writes are single-document aggregation-pipeline UPSERTs rather than
 * read-modify-write pairs, so two answers submitted at once cannot clobber each
 * other's counters (there are no multi-document transactions on a standalone
 * MongoDB).
 */

const MASTERY_VOLUME_TARGET = 50; // questions needed for a full volume factor

/**
 * Derive accuracy / mastery / difficulty from the counters after this answer.
 * Shared by both progress models; the only difference is the volume target.
 */
const progressPipeline = (isCorrect: boolean, volumeTarget: number): any[] => {
  const correctIncrement = isCorrect ? 1 : 0;

  return [
    {
      $set: {
        questions_attempted: { $add: [{ $ifNull: ['$questions_attempted', 0] }, 1] },
        questions_correct: { $add: [{ $ifNull: ['$questions_correct', 0] }, correctIncrement] },
      },
    },
    {
      $set: {
        accuracy: {
          $multiply: [{ $divide: ['$questions_correct', '$questions_attempted'] }, 100],
        },
        mastery_percentage: {
          $multiply: [
            { $divide: ['$questions_correct', '$questions_attempted'] },
            100,
            {
              $add: [
                0.7,
                {
                  $multiply: [
                    0.3,
                    {
                      $min: [{ $divide: ['$questions_attempted', volumeTarget] }, 1],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $set: {
        updated_at: '$$NOW',
      },
    },
  ];
};

export const updateTopicProgress = async (
  userId: string,
  topicId: string,
  isCorrect: boolean
): Promise<void> => {
  const pipeline = progressPipeline(isCorrect, MASTERY_VOLUME_TARGET);
  // The difficulty band is topic-specific, so append it after mastery is known.
  pipeline.push({
    $set: {
      difficulty_level: {
        $switch: {
          branches: [
            {
              case: {
                $and: [
                  { $gte: ['$mastery_percentage', 80] },
                  { $gte: ['$questions_attempted', 20] },
                ],
              },
              then: 'advanced',
            },
            {
              case: {
                $and: [
                  { $gte: ['$mastery_percentage', 50] },
                  { $gte: ['$questions_attempted', 10] },
                ],
              },
              then: 'intermediate',
            },
          ],
          default: 'beginner',
        },
      },
    },
  });

  await LearnerTopicProgress.findOneAndUpdate(
    { user_id: userId, topic_id: topicId },
    pipeline,
    { upsert: true, new: true }
  );
};

export const updateConceptProgress = async (
  userId: string,
  conceptId: string,
  isCorrect: boolean
): Promise<void> => {
  const volumeTarget = 30;
  await LearnerConceptProgress.findOneAndUpdate(
    { user_id: userId, concept_id: conceptId },
    progressPipeline(isCorrect, volumeTarget),
    { upsert: true, new: true }
  );
};

/**
 * Pick the difficulty that keeps a learner in their flow: stretch them a little
 * above their current accuracy, but only once there is enough evidence.
 */
export const getRecommendedDifficulty = async (
  userId: string,
  topicId?: string
): Promise<'easy' | 'medium' | 'hard'> => {
  const filter: Record<string, unknown> = { user_id: userId };
  if (topicId) filter.topic_id = topicId;

  const rows = await LearnerTopicProgress.find(filter).select('accuracy questions_attempted').lean();

  if (rows.length === 0) {
    // No evidence yet: start easy so the first quiz is a confidence builder.
    return 'easy';
  }

  const avgAccuracy =
    rows.reduce((sum, row: any) => sum + (row.accuracy ?? 0), 0) / rows.length;
  const totalAttempted = rows.reduce((sum, row: any) => sum + (row.questions_attempted ?? 0), 0);

  if (avgAccuracy >= 80 && totalAttempted >= 20) return 'hard';
  if (avgAccuracy >= 50 && totalAttempted >= 10) return 'medium';
  return 'easy';
};

/** Topics ordered by what the learner most needs work on - drives the dashboard. */
export const getWeakestTopics = async (userId: string, limit = 3) => {
  const rows = await LearnerTopicProgress.aggregate([
    { $match: { user_id: userId, questions_attempted: { $gt: 0 } } },
    { $sort: { accuracy: 1 } },
    { $limit: limit },
    { $lookup: { from: 'topics', localField: 'topic_id', foreignField: '_id', as: 'topic' } },
    { $unwind: '$topic' },
    {
      $project: {
        _id: 0,
        id: '$_id',
        user_id: 1,
        topic_id: 1,
        accuracy: 1,
        questions_attempted: 1,
        questions_correct: 1,
        difficulty_level: 1,
        mastery_percentage: 1,
        name: '$topic.name',
        slug: '$topic.slug',
        icon: '$topic.icon',
      },
    },
  ]);

  return rows;
};

export const adaptiveService = {
  updateTopicProgress,
  updateConceptProgress,
  getRecommendedDifficulty,
  getWeakestTopics,
};
