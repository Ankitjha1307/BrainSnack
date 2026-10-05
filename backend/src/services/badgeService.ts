import { query, transaction } from '../db';
import { Badge, UserBadge } from '../types';

export const getAllBadges = async (): Promise<Badge[]> => {
  const result = await query<Badge>(
    'SELECT * FROM badges ORDER BY criteria_type, criteria_value'
  );
  return result.rows;
};

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  const result = await query<UserBadge>(
    `SELECT ub.id, ub.user_id, ub.badge_id, ub.earned_at,
            b.name, b.slug, b.description, b.icon, b.criteria_type, b.criteria_value
     FROM user_badges ub
     JOIN badges b ON ub.badge_id = b.id
     WHERE ub.user_id = $1
     ORDER BY ub.earned_at DESC`,
    [userId]
  );
  return result.rows;
};

/** Earned badges plus how far the learner is toward the ones still locked. */
export const getBadgeProgress = async (userId: string) => {
  const [earned, all, stats] = await Promise.all([
    getUserBadges(userId),
    getAllBadges(),
    getBadgeStats(userId),
  ]);

  const earnedIds = new Set(earned.map((b) => b.badge_id));
  const locked = all
    .filter((b) => !earnedIds.has(b.id))
    .map((b) => ({
      ...b,
      current: currentValueFor(b.criteria_type, stats),
      progress: Math.min(
        100,
        Math.round((currentValueFor(b.criteria_type, stats) / b.criteria_value) * 100)
      ),
    }))
    .sort((a, b) => b.progress - a.progress);

  return { earned, locked };
};

type BadgeStats = {
  xp: number;
  level: number;
  current_streak: number;
  quiz_count: number;
  perfect_score: number;
  topic_mastery: number;
};

const getBadgeStats = async (userId: string): Promise<BadgeStats> => {
  const result = await query<BadgeStats>(
    `SELECT
       u.xp,
       u.level,
       COALESCE(s.current_streak, 0) AS current_streak,
       (SELECT COUNT(*) FROM quizzes q WHERE q.user_id = u.id AND q.status = 'completed') AS quiz_count,
       (SELECT COUNT(*) FROM quizzes q WHERE q.user_id = u.id AND q.status = 'completed' AND q.score = 100) AS perfect_score,
       (SELECT COUNT(*) FROM learner_topic_progress ltp
         WHERE ltp.user_id = u.id AND ltp.mastery_percentage >= 90) AS topic_mastery
     FROM users u
     LEFT JOIN streaks s ON s.user_id = u.id
     WHERE u.id = $1`,
    [userId]
  );

  const row = result.rows[0];
  return {
    xp: row?.xp ?? 0,
    level: row?.level ?? 1,
    current_streak: row?.current_streak ?? 0,
    quiz_count: parseInt(String(row?.quiz_count ?? 0), 10),
    perfect_score: parseInt(String(row?.perfect_score ?? 0), 10),
    topic_mastery: parseInt(String(row?.topic_mastery ?? 0), 10),
  };
};

const currentValueFor = (criteriaType: Badge['criteria_type'], stats: BadgeStats): number => {
  switch (criteriaType) {
    case 'xp':
      return stats.xp;
    case 'streak':
      return stats.current_streak;
    case 'quiz_count':
      return stats.quiz_count;
    case 'perfect_score':
      return stats.perfect_score;
    case 'topic_mastery':
      return stats.topic_mastery;
    case 'level':
      return stats.level;
    default:
      return 0;
  }
};

/**
 * Award any badge whose criteria are now met.
 *
 * Each criterion is compared against the badge's own `criteria_value`, so
 * "master 3 topics" means three topics rather than one. Inserts rely on
 * UNIQUE(user_id, badge_id) so concurrent completions cannot double-award.
 */
export const checkAndAwardBadges = async (userId: string): Promise<Badge[]> => {
  const newBadges: Badge[] = [];

  const [stats, badgesResult, earnedResult] = await Promise.all([
    getBadgeStats(userId),
    query<Badge>('SELECT * FROM badges'),
    query<{ badge_id: string }>('SELECT badge_id FROM user_badges WHERE user_id = $1', [userId]),
  ]);

  const earnedBadgeIds = new Set(earnedResult.rows.map((r) => r.badge_id));
  const eligible = badgesResult.rows.filter(
    (badge) =>
      !earnedBadgeIds.has(badge.id) &&
      currentValueFor(badge.criteria_type, stats) >= badge.criteria_value
  );

  if (eligible.length === 0) return newBadges;

  await transaction(async (client) => {
    for (const badge of eligible) {
      const inserted = await client.query(
        `INSERT INTO user_badges (user_id, badge_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, badge_id) DO NOTHING
         RETURNING badge_id`,
        [userId, badge.id]
      );
      if (inserted.rowCount && inserted.rowCount > 0) {
        newBadges.push(badge);
      }
    }
  });

  return newBadges;
};

export const badgeService = {
  getAllBadges,
  getUserBadges,
  getBadgeProgress,
  checkAndAwardBadges,
};
