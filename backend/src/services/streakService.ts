import { query, transaction } from '../db';
import { Streak } from '../types';

/**
 * Streaks are earned by completing a quiz, not by signing in.
 *
 * All the date maths is done in SQL against the database's own `CURRENT_DATE`.
 * Doing it in JavaScript meant comparing a pg-parsed DATE against a
 * `toISOString()` string, which never matched - so every call reset the streak
 * to 1.
 */
export const updateStreak = async (userId: string): Promise<Streak> => {
  return transaction(async (client) => {
    const existing = await client.query<Streak>(
      'SELECT * FROM streaks WHERE user_id = $1',
      [userId]
    );

    if (existing.rows.length === 0) {
      const created = await client.query<Streak>(
        `INSERT INTO streaks (user_id, current_streak, longest_streak, last_activity_date)
         VALUES ($1, 1, 1, CURRENT_DATE)
         ON CONFLICT (user_id) DO UPDATE
           SET current_streak = streaks.current_streak,
               updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId]
      );
      const streak = created.rows[0];
      await client.query(
        `UPDATE users
         SET streak = $1, last_active = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [streak.current_streak, userId]
      );
      return streak;
    }

    const updated = await client.query<Streak>(
      `UPDATE streaks
       SET current_streak = CASE
             WHEN last_activity_date = CURRENT_DATE
               THEN current_streak                       -- already counted today
             WHEN last_activity_date = CURRENT_DATE - 1
               THEN current_streak + 1                   -- kept the chain alive
             ELSE 1                                      -- broken, start over
           END,
           longest_streak = GREATEST(
             longest_streak,
             CASE
               WHEN last_activity_date = CURRENT_DATE - 1
                 THEN current_streak + 1
               ELSE 1
             END
           ),
           last_activity_date = CURRENT_DATE,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING *`,
      [userId]
    );

    const streak = updated.rows[0];

    await client.query(
      `UPDATE users
       SET streak = $1, last_active = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [streak.current_streak, userId]
    );

    return streak;
  });
};

export const getStreak = async (userId: string): Promise<Streak | null> => {
  const result = await query<Streak>('SELECT * FROM streaks WHERE user_id = $1', [userId]);
  return result.rows[0] ?? null;
};

export const getTopStreaks = async (limit: number = 10) => {
  const result = await query(
    `SELECT u.id, u.username, u.display_name, u.avatar_url, u.xp, u.level,
            s.current_streak, s.longest_streak
     FROM streaks s
     JOIN users u ON s.user_id = u.id
     ORDER BY s.current_streak DESC, s.longest_streak DESC, u.xp DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows.map((row: any, index: number) => ({ ...row, rank: index + 1 }));
};

/** Whether the learner still has an unbroken chain as of today. */
export const isStreakAlive = async (userId: string): Promise<boolean> => {
  const result = await query<{ alive: boolean }>(
    `SELECT (last_activity_date >= CURRENT_DATE - 1) AS alive
     FROM streaks WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0]?.alive ?? false;
};

export const streakService = {
  updateStreak,
  getStreak,
  getTopStreaks,
  isStreakAlive,
};
