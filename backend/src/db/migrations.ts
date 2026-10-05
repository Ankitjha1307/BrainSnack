/**
 * Additive, idempotent schema patches.
 *
 * `schema.sql` is destructive - it drops every table - so it can only be run
 * against a fresh database. These statements bring an *existing* database up to
 * date with the current schema without losing any data. They are written to be
 * safe to run on every boot: `IF NOT EXISTS` makes each one a no-op once applied.
 *
 * To use a new one: append it to the array. Never edit an existing entry - old
 * databases would no longer receive the original patch.
 */
import { query } from './index';
import { config } from '../config/index';

const MIGRATIONS: Array<{ name: string; sql: string }> = [
  {
    // Guests are real user rows (see POST /api/auth/guest) so every route works
    // without a separate anonymous code path. This column is how we tell them
    // apart from accounts people signed up for.
    name: 'users.is_guest',
    sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT FALSE',
  },
];

/**
 * Applies pending migrations. Failures are logged but never fatal: a migration
 * failure should degrade a feature, not stop the whole API from booting.
 */
export const runMigrations = async (): Promise<void> => {
  for (const migration of MIGRATIONS) {
    try {
      await query(migration.sql);
      if (config.nodeEnv === 'development') {
        console.log(`migration applied: ${migration.name}`);
      }
    } catch (error) {
      console.error(`migration failed: ${migration.name}`, error);
    }
  }
};