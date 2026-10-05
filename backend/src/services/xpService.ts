import { query, transaction } from '../db';
import { XP_VALUES, LEVEL_THRESHOLDS, User } from '../types';

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
 * Award XP and roll the level forward in one transaction.
 *
 * `SELECT xp ... FOR UPDATE` serialises concurrent awards, so two simultaneous
 * completions cannot both read the same starting XP and overwrite each other.
 */
export const awardXP = async (
  userId: string,
  amount: number,
  reason: string,
  referenceType?: string,
  referenceId?: string
): Promise<void> => {
  if (amount === 0) return;

  await transaction(async (client) => {
    await client.query(
      `INSERT INTO xp_transactions (user_id, amount, reason, reference_type, reference_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, amount, reason, referenceType ?? null, referenceId ?? null]
    );

    const userResult = await client.query<User>(
      'SELECT xp FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );
    if (userResult.rows.length === 0) return;

    const newXp = Math.max(0, (userResult.rows[0].xp ?? 0) + amount);
    await client.query(
      'UPDATE users SET xp = $1, level = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [newXp, calculateLevel(newXp), userId]
    );
  });
};

export const getXPTransactions = async (userId: string, limit: number = 20) => {
  const result = await query(
    `SELECT * FROM xp_transactions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

type LeaderboardType = 'daily' | 'weekly' | 'alltime' | 'topic';

const PERIOD_FILTER: Record<'daily' | 'weekly', string> = {
  daily: `xp.created_at >= date_trunc('day', NOW())`,
  weekly: `xp.created_at >= date_trunc('week', NOW())`,
};

/**
 * Ranked board.
 *
 * The XP that drives the ranking is always summed from `xp_transactions` for the
 * requested window, so a daily board is genuinely "today's XP" and a topic board
 * is genuinely "XP earned in that topic" - rather than everyone being re-sorted
 * by their all-time total.
 */
export const getLeaderboard = async (
  type: 'daily' | 'weekly' | 'alltime' = 'alltime',
  topicId?: string,
  userId?: string,
  limit: number = 50
) => {
  const resolvedType: LeaderboardType = topicId ? 'topic' : type;
  const cappedLimit = Math.min(Math.max(limit || 50, 1), 100);

  // `ranked` is the CTE that produces one row per user with the score the board
  // is sorted on. `$1` is the signed-in user so we can mark them in one pass.
  const scoreExpr =
    resolvedType === 'alltime'
      ? 'u.xp'
      : resolvedType === 'daily'
      ? `COALESCE(period_xp.daily_xp, 0)`
      : resolvedType === 'weekly'
      ? `COALESCE(period_xp.weekly_xp, 0)`
      : `COALESCE(topic_xp.topic_xp, 0)`;

  const params: unknown[] = [];
  let i = 1;

  const periodJoin =
    resolvedType === 'daily' || resolvedType === 'weekly'
      ? `LEFT JOIN (
           SELECT user_id,
                  COALESCE(SUM(amount) FILTER (WHERE ${PERIOD_FILTER[resolvedType]}), 0) AS daily_xp,
                  COALESCE(SUM(amount) FILTER (WHERE ${PERIOD_FILTER.weekly}), 0) AS weekly_xp
           FROM xp_transactions
           GROUP BY user_id
         ) period_xp ON period_xp.user_id = u.id`
      : `LEFT JOIN (SELECT id AS user_id, 0::bigint AS daily_xp, 0::bigint AS weekly_xp FROM users) period_xp ON period_xp.user_id = u.id`;

  const topicJoin =
    resolvedType === 'topic'
      ? `LEFT JOIN (
           SELECT q.user_id, SUM(x.amount) AS topic_xp
           FROM xp_transactions x
           JOIN quizzes q ON q.id = x.reference_id
           WHERE x.reference_type = 'quiz' AND q.topic_id = $${i++}
           GROUP BY q.user_id
         ) topic_xp ON topic_xp.user_id = u.id`
      : `LEFT JOIN (SELECT id AS user_id, 0::bigint AS topic_xp FROM users) topic_xp ON topic_xp.user_id = u.id`;

  if (topicId) params.push(topicId);

  const sql = `
    WITH ranked AS (
      SELECT
        u.id, u.username, u.display_name, u.avatar_url, u.xp AS total_xp,
        u.level, u.streak, u.personal_best,
        ${scoreExpr} AS board_xp,
        RANK() OVER (ORDER BY ${scoreExpr} DESC) AS rank
      FROM users u
      ${periodJoin}
      ${topicJoin}
      -- Guest accounts are throwaway demo sessions; showing them on a public
      -- leaderboard would drown out real learners.
      WHERE u.is_guest = FALSE
    )
    SELECT * FROM ranked
    ORDER BY board_xp DESC, total_xp DESC, username ASC
    LIMIT $${i++}
  `;
  params.push(cappedLimit);

  const result = await query<Record<string, any>>(sql, params);
  const leaderboard = result.rows.map((row) => ({
    rank: parseInt(row.rank, 10),
    user: {
      id: row.id,
      username: row.username,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
      xp: parseInt(row.total_xp, 10),
      level: row.level,
      streak: row.streak,
      personal_best: row.personal_best,
    },
    xp: parseInt(row.board_xp, 10) || 0,
    level: row.level,
    streak: row.streak,
    board_xp: parseInt(row.board_xp, 10) || 0,
  }));

  let userRank: (typeof leaderboard)[number] | undefined;
  if (userId) {
    userRank = leaderboard.find((entry) => entry.user.id === userId);

    if (!userRank) {
      // Outside the visible page: compute their true rank with the same window.
      const rankParams: unknown[] = [];
      let r = 1;
      const rankScoreExpr =
        resolvedType === 'alltime'
          ? 'u.xp'
          : resolvedType === 'daily'
          ? `COALESCE((SELECT SUM(amount) FROM xp_transactions WHERE user_id = u.id AND ${PERIOD_FILTER.daily}), 0)`
          : resolvedType === 'weekly'
          ? `COALESCE((SELECT SUM(amount) FROM xp_transactions WHERE user_id = u.id AND ${PERIOD_FILTER.weekly}), 0)`
          : `COALESCE((SELECT SUM(x.amount) FROM xp_transactions x JOIN quizzes q ON q.id = x.reference_id
                        WHERE x.user_id = u.id AND x.reference_type = 'quiz' AND q.topic_id = $${r++}), 0)`;
      if (topicId) rankParams.push(topicId);

      const rankResult = await query<{ rank: string; board_xp: string }>(
        `SELECT
           RANK() OVER (ORDER BY ${rankScoreExpr} DESC) AS rank,
           ${rankScoreExpr} AS board_xp
         FROM users u WHERE u.id = $${r} AND u.is_guest = FALSE`,
        [...rankParams, userId]
      );

      const me = await query(
        'SELECT id, username, display_name, avatar_url, xp, level, streak, personal_best FROM users WHERE id = $1',
        [userId]
      );

      if (me.rows[0] && rankResult.rows[0]) {
        userRank = {
          rank: parseInt(rankResult.rows[0].rank, 10),
          user: me.rows[0],
          xp: me.rows[0].xp,
          level: me.rows[0].level,
          streak: me.rows[0].streak,
          board_xp: parseInt(rankResult.rows[0].board_xp, 10) || 0,
        };
      }
      // A guest is excluded from the board by design, so there is no rank to
      // report for them. Leaving `userRank` undefined is the honest answer.
    }
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
