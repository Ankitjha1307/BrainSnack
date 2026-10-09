import { Badge, UserBadge, User, Quiz, Streak, LearnerTopicProgress, IBadge } from '../models';

/** A badge row flattened with the learner's earned metadata, as the API returns it. */
export interface UserBadgeRow {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: Date;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  criteria_type: IBadge['criteria_type'];
  criteria_value: number;
}

const toBadgeRow = (doc: any): UserBadgeRow => ({
  id: String(doc._id),
  name: doc.name,
  slug: doc.slug,
  description: doc.description ?? null,
  icon: doc.icon ?? '🏆',
  criteria_type: doc.criteria_type,
  criteria_value: doc.criteria_value,
  // Present so the shared wire shape is stable for callers that include it.
  user_id: doc.user_id ?? '',
  badge_id: String(doc._id),
  earned_at: doc.earned_at,
});

export const getAllBadges = async (): Promise<UserBadgeRow[]> => {
  const rows = await Badge.find().sort({ criteria_type: 1, criteria_value: 1 }).lean();
  return rows.map((row) => toBadgeRow(row));
};

export const getUserBadges = async (userId: string): Promise<UserBadgeRow[]> => {
  const rows = await UserBadge.aggregate([
    { $match: { user_id: userId } },
    { $sort: { earned_at: -1 } },
    { $lookup: { from: 'badges', localField: 'badge_id', foreignField: '_id', as: 'badge' } },
    { $unwind: '$badge' },
    {
      $project: {
        _id: 0,
        id: '$_id',
        user_id: 1,
        badge_id: 1,
        earned_at: 1,
        name: '$badge.name',
        slug: '$badge.slug',
        description: '$badge.description',
        icon: '$badge.icon',
        criteria_type: '$badge.criteria_type',
        criteria_value: '$badge.criteria_value',
      },
    },
  ]);
  return rows as UserBadgeRow[];
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
    .map((b) => {
      const current = currentValueFor(b.criteria_type, stats);
      return {
        ...b,
        current,
        progress: Math.min(100, Math.round((current / b.criteria_value) * 100)),
      };
    })
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
  const [user, streak, quizCount, perfectCount, topicMasteryCount] = await Promise.all([
    User.findById(userId).select('xp level').lean(),
    Streak.findOne({ user_id: userId }).select('current_streak').lean(),
    Quiz.countDocuments({ user_id: userId, status: 'completed' }),
    Quiz.countDocuments({ user_id: userId, status: 'completed', score: 100 }),
    LearnerTopicProgress.countDocuments({ user_id: userId, mastery_percentage: { $gte: 90 } }),
  ]);

  return {
    xp: (user as any)?.xp ?? 0,
    level: (user as any)?.level ?? 1,
    current_streak: (streak as any)?.current_streak ?? 0,
    quiz_count: quizCount,
    perfect_score: perfectCount,
    topic_mastery: topicMasteryCount,
  };
};

const currentValueFor = (criteriaType: IBadge['criteria_type'], stats: BadgeStats): number => {
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
 * "master 3 topics" means three topics rather than one. Inserts rely on the
 * UNIQUE(user_id, badge_id) index so concurrent completions cannot
 * double-award - a duplicate-key error is treated as "already had it".
 */
export const checkAndAwardBadges = async (userId: string): Promise<UserBadgeRow[]> => {
  const newBadges: UserBadgeRow[] = [];

  const [stats, badges, earned] = await Promise.all([
    getBadgeStats(userId),
    Badge.find().lean(),
    UserBadge.find({ user_id: userId }).select('badge_id').lean(),
  ]);

  const earnedBadgeIds = new Set(earned.map((r: any) => String(r.badge_id)));
  const eligible = badges.filter(
    (badge) =>
      !earnedBadgeIds.has(String(badge._id)) &&
      currentValueFor(badge.criteria_type, stats) >= badge.criteria_value
  );

  for (const badge of eligible) {
    try {
      const inserted = await UserBadge.create({ user_id: userId, badge_id: String(badge._id) });
      newBadges.push(
        toBadgeRow({
          ...(badge as any),
          _id: badge._id,
          user_id: userId,
          badge_id: badge._id,
          earned_at: inserted.earned_at,
        })
      );
    } catch (error: any) {
      // 11000 = duplicate key: someone (or a concurrent request) already
      // awarded it. That is success, not a failure.
      if (error?.code !== 11000) throw error;
    }
  }

  return newBadges;
};

export const badgeService = {
  getAllBadges,
  getUserBadges,
  getBadgeProgress,
  checkAndAwardBadges,
};
