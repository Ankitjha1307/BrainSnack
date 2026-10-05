import { query } from '../db';
import { LearnerTopicProgress } from '../types';

/**
 * Adaptive mastery model.
 *
 * mastery = accuracy * (0.7 + 0.3 * volumeFactor)
 *   i.e. a learner cannot claim mastery from one lucky answer; they need volume.
 *
 * Writes are single-statement UPSERTs rather than read-modify-write pairs so
 * two answers submitted at once cannot clobber each other's counters.
 */

const MASTERY_VOLUME_TARGET = 50; // questions needed for a full volume factor

export const updateTopicProgress = async (
  userId: string,
  topicId: string,
  isCorrect: boolean
): Promise<void> => {
  await query(
    `INSERT INTO learner_topic_progress
       (user_id, topic_id, accuracy, questions_attempted, questions_correct,
        difficulty_level, mastery_percentage)
     VALUES ($1, $2, $3, 1, $4, 'beginner', $3 * 0.3)
     ON CONFLICT (user_id, topic_id) DO UPDATE SET
       questions_attempted = learner_topic_progress.questions_attempted + 1,
       questions_correct   = learner_topic_progress.questions_correct + $4,
       accuracy = (
         (learner_topic_progress.questions_correct + $4)::numeric * 100
         / (learner_topic_progress.questions_attempted + 1)
       ),
       mastery_percentage = (
         (learner_topic_progress.questions_correct + $4)::numeric * 100
         / (learner_topic_progress.questions_attempted + 1)
         * (0.7 + 0.3 * LEAST((learner_topic_progress.questions_attempted + 1)::numeric / ${MASTERY_VOLUME_TARGET}, 1))
       ),
       difficulty_level = CASE
         WHEN ((learner_topic_progress.questions_correct + $4)::numeric * 100
               / (learner_topic_progress.questions_attempted + 1))
              * (0.7 + 0.3 * LEAST((learner_topic_progress.questions_attempted + 1)::numeric / ${MASTERY_VOLUME_TARGET}, 1)) >= 80
              AND (learner_topic_progress.questions_attempted + 1) >= 20
           THEN 'advanced'
         WHEN ((learner_topic_progress.questions_correct + $4)::numeric * 100
               / (learner_topic_progress.questions_attempted + 1))
              * (0.7 + 0.3 * LEAST((learner_topic_progress.questions_attempted + 1)::numeric / ${MASTERY_VOLUME_TARGET}, 1)) >= 50
              AND (learner_topic_progress.questions_attempted + 1) >= 10
           THEN 'intermediate'
         ELSE 'beginner'
       END,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, topicId, isCorrect ? 100 : 0, isCorrect ? 1 : 0]
  );
};

export const updateConceptProgress = async (
  userId: string,
  conceptId: string,
  isCorrect: boolean
): Promise<void> => {
  const volumeTarget = 30;
  await query(
    `INSERT INTO learner_concept_progress
       (user_id, concept_id, accuracy, questions_attempted, questions_correct, mastery_percentage)
     VALUES ($1, $2, $3, 1, $4, $3 * 0.3)
     ON CONFLICT (user_id, concept_id) DO UPDATE SET
       questions_attempted = learner_concept_progress.questions_attempted + 1,
       questions_correct   = learner_concept_progress.questions_correct + $4,
       accuracy = (
         (learner_concept_progress.questions_correct + $4)::numeric * 100
         / (learner_concept_progress.questions_attempted + 1)
       ),
       mastery_percentage = (
         (learner_concept_progress.questions_correct + $4)::numeric * 100
         / (learner_concept_progress.questions_attempted + 1)
         * (0.7 + 0.3 * LEAST((learner_concept_progress.questions_attempted + 1)::numeric / ${volumeTarget}, 1))
       ),
       updated_at = CURRENT_TIMESTAMP`,
    [userId, conceptId, isCorrect ? 100 : 0, isCorrect ? 1 : 0]
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
  let sql = `
    SELECT accuracy, questions_attempted, mastery_percentage
    FROM learner_topic_progress
    WHERE user_id = $1
  `;
  const params: unknown[] = [userId];

  if (topicId) {
    sql += ' AND topic_id = $2';
    params.push(topicId);
  }

  const result = await query<{ accuracy: string; questions_attempted: number }>(sql, params);

  if (result.rows.length === 0) {
    // No evidence yet: start easy so the first quiz is a confidence builder.
    return 'easy';
  }

  const avgAccuracy =
    result.rows.reduce((sum, row) => sum + parseFloat(row.accuracy), 0) / result.rows.length;
  const totalAttempted = result.rows.reduce((sum, row) => sum + row.questions_attempted, 0);

  if (avgAccuracy >= 80 && totalAttempted >= 20) return 'hard';
  if (avgAccuracy >= 50 && totalAttempted >= 10) return 'medium';
  return 'easy';
};

/** Topics ordered by what the learner most needs work on - drives the dashboard. */
export const getWeakestTopics = async (userId: string, limit = 3) => {
  const result = await query<LearnerTopicProgress & { name: string; slug: string; icon: string }>(
    `SELECT ltp.*, t.name, t.slug, t.icon
     FROM learner_topic_progress ltp
     JOIN topics t ON t.id = ltp.topic_id
     WHERE ltp.user_id = $1 AND ltp.questions_attempted > 0
     ORDER BY ltp.accuracy ASC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

export const adaptiveService = {
  updateTopicProgress,
  updateConceptProgress,
  getRecommendedDifficulty,
  getWeakestTopics,
};
