import { XP_VALUES, LEVEL_THRESHOLDS } from '../types';
import { User, XpTransaction } from '../models';

export const calculateLevel = (xp: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
};

/** XP still needed to reach the next level, or null at max level. */
export const xpToNextLevel = (xp: number): number | null => {
  const level = calculateLevel(xp);
  const next = LEVEL_THRESHOLDS[level];
  return next === undefined ? null : next - xp;
};

export const getXpForDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  return XP_VALUES[difficulty];
};

/**
 * Award XP: record the transaction, then roll the user's total and level
 * forward. The `$inc` is a single atomic document update, so two concurrent
 * completions cannot overwrite each other's totals.
 */
export const awardXP = async (
  userId: string,
  amount: number,
  reason: string,
  referenceType?: string,
  referenceId?: string
): Promise<void> => {
  if (amount === 0) return;

  await XpTransaction.create({
    user_id: userId,
    amount,
    reason,
    reference_type: referenceType ?? null,
    reference_id: referenceId ?? null,
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { xp: amount } },
    { new: true }
  );
  if (!user) return;

  // XP can never go below zero; recompute the level from the new total.
  const xp = Math.max(0, user.xp);
  await User.updateOne(
    { _id: userId },
    { $set: { xp, level: calculateLevel(xp), updated_at: new Date() } }
  );
};

export const getXPTransactions = async (userId: string, limit: number = 20) => {
  const rows = await XpTransaction.find({ user_id: userId })
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();
  return rows.map((row: any) => ({ ...row, id: String(row._id), reference_id: row.reference_id ?? null }));
};

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

type LeaderboardType = 'daily' | 'weekly' | 'alltime' | 'topic';

const startOfUTCDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

/** Monday 00:00 UTC, matching Postgres `date_trunc('week')`. */
const startOfUTCWeek = (date: Date): Date => {
  const start = startOfUTCDay(date);
  const day = start.getUTCDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // days since Monday
  start.setUTCDate(start.getUTCDate() - diff);
  return start;
};

/**
 * Ranked board.
 *
 * The XP that drives the ranking is always summed from `xp_transactions` for the
 * requested window, so a daily board is genuinely "today's XP" and a topic board
 * is genuinely "XP earned in that topic".
 */
export const getLeaderboard = async (
  type: 'daily' | 'weekly' | 'alltime' = 'alltime',
  topicId?: string,
  userId?: string,
  limit: number = 50
) => {
  const resolvedType: LeaderboardType = topicId ? 'topic' : type;
  const cappedLimit = Math.min(Math.max(limit || 50, 1), 100);

  // Board XP per user id, defaulting to 0. All-time reads straight from `users`.
  const boardXp = new Map<string, number>();

  if (resolvedType === 'daily' || resolvedType === 'weekly') {
    const start =
      resolvedType === 'daily' ? startOfUTCDay(new Date()) : startOfUTCWeek(new Date());
    const rows = await XpTransaction.aggregate<{ _id: string; total: number }>([
      { $match: { created_at: { $gte: start } } },
      { $group: { _id: '$user_id', total: { $sum: '$amount' } } },
    ]);
    rows.forEach((row) => boardXp.set(row._id, row.total));
  } else if (resolvedType === 'topic') {
    const rows = await XpTransaction.aggregate<{ _id: string; total: number }>([
      { $match: { reference_type: 'quiz' } },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'reference_id',
          foreignField: '_id',
          as: 'quiz',
        },
      },
      { $unwind: '$quiz' },
      { $match: { 'quiz.topic_id': topicId } },
      { $group: { _id: '$user_id', total: { $sum: '$amount' } } },
    ]);
    rows.forEach((row) => boardXp.set(row._id, row.total));
  }

  // Public board.
  const users = await User.find({})
    .select('username display_name avatar_url xp level streak personal_best')
    .lean();

  const scored = users
    .map((u: any) => ({
      id: String(u._id),
      username: u.username,
      display_name: u.display_name,
      avatar_url: u.avatar_url ?? null,
      total_xp: u.xp ?? 0,
      level: u.level ?? 1,
      streak: u.streak ?? 0,
      personal_best: u.personal_best ?? 0,
      board_xp: resolvedType === 'alltime' ? u.xp ?? 0 : boardXp.get(String(u._id)) ?? 0,
    }))
    .sort(
      (a, b) =>
        b.board_xp - a.board_xp ||
        b.total_xp - a.total_xp ||
        a.username.localeCompare(b.username)
    );

  // Competition ranking: equal board_xp shares a rank (matches SQL RANK()).
  let lastXp: number | null = null;
  let lastRank = 0;
  const ranked = scored.map((entry, index) => {
    const rank = entry.board_xp === lastXp ? lastRank : index + 1;
    lastXp = entry.board_xp;
    lastRank = rank;
    return { ...entry, rank };
  });

  const toEntry = (entry: (typeof ranked)[number]) => ({
    rank: entry.rank,
    user: {
      id: entry.id,
      username: entry.username,
      display_name: entry.display_name,
      avatar_url: entry.avatar_url,
      xp: entry.total_xp,
      level: entry.level,
      streak: entry.streak,
      personal_best: entry.personal_best,
    },
    xp: entry.board_xp,
    level: entry.level,
    streak: entry.streak,
    board_xp: entry.board_xp,
  });

  const leaderboard = ranked.slice(0, cappedLimit).map(toEntry);

  let userRank: ReturnType<typeof toEntry> | undefined;
  if (userId) {
    const mine = ranked.find((entry) => entry.id === userId);
    if (mine) userRank = toEntry(mine);
  }

  return { leaderboard, userRank, type: resolvedType };
};

export const xpService = {
  calculateLevel,
  xpToNextLevel,
  getXpForDifficulty,
  awardXP,
  getXPTransactions,
  getLeaderboard,
};
