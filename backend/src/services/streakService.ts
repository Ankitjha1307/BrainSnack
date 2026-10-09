import { Streak as StreakModel, User } from '../models';
import { Streak } from '../types';

/**
 * Streaks are earned by completing a quiz, not by signing in.
 *
 * All the date maths is done in UTC and the counter is advanced with a single
 * aggregation-pipeline update, so two quizzes completed at the same moment
 * cannot clobber each other (MongoDB has no transactions on a standalone
 * server, so every write here stays a single atomic document update).
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight UTC for the given date; every stored activity date is normalised to this. */
const startOfUTCDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const toLegacyStreak = (doc: { toObject: () => Record<string, unknown> }): Streak =>
  doc.toObject() as unknown as Streak;

export const updateStreak = async (userId: string): Promise<Streak> => {
  const today = startOfUTCDay(new Date());
  const yesterday = new Date(today.getTime() - DAY_MS);

  // Stage 1 advances the counter, stage 2 derives the longest streak from the
  // freshly computed current_streak (a single $set cannot see its own writes).
  const pipeline: any[] = [
    {
      $set: {
        current_streak: {
          $switch: {
            branches: [
              // Already counted today: leave the chain untouched.
              { case: { $eq: ['$last_activity_date', today] }, then: { $ifNull: ['$current_streak', 0] } },
              // Active yesterday: extend the chain.
              {
                case: { $eq: ['$last_activity_date', yesterday] },
                then: { $add: [{ $ifNull: ['$current_streak', 0] }, 1] },
              },
            ],
            // Missing/stale: start a new chain.
            default: 1,
          },
        },
      },
    },
    {
      $set: {
        longest_streak: { $max: [{ $ifNull: ['$longest_streak', 0] }, '$current_streak'] },
        last_activity_date: today,
        updated_at: '$$NOW',
      },
    },
  ];

  const doc = await StreakModel.findOneAndUpdate({ user_id: userId }, pipeline, {
    upsert: true,
    new: true,
  });
  const streak = toLegacyStreak(doc as unknown as { toObject: () => Record<string, unknown> });

  await User.updateOne(
    { _id: userId },
    { $set: { streak: streak.current_streak, last_active: new Date(), updated_at: new Date() } }
  );

  return streak;
};

export const getStreak = async (userId: string): Promise<Streak | null> => {
  const doc = await StreakModel.findOne({ user_id: userId }).lean();
  if (!doc) return null;
  return { ...(doc as any), id: String((doc as any)._id) } as Streak;
};

export const getTopStreaks = async (limit: number = 10) => {
  const rows = await StreakModel.aggregate([
    { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $sort: { current_streak: -1, longest_streak: -1, 'user.xp': -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        id: '$user._id',
        username: '$user.username',
        display_name: '$user.display_name',
        avatar_url: '$user.avatar_url',
        xp: '$user.xp',
        level: '$user.level',
        current_streak: 1,
        longest_streak: 1,
      },
    },
  ]);

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
};

/** Whether the learner still has an unbroken chain as of today. */
export const isStreakAlive = async (userId: string): Promise<boolean> => {
  const streak = await getStreak(userId);
  if (!streak || !streak.last_activity_date) return false;
  const last = startOfUTCDay(new Date(streak.last_activity_date));
  const yesterday = new Date(startOfUTCDay(new Date()).getTime() - DAY_MS);
  return last.getTime() >= yesterday.getTime();
};

export const streakService = {
  updateStreak,
  getStreak,
  getTopStreaks,
  isStreakAlive,
};
