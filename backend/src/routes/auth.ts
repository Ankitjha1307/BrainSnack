import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { generateToken, authMiddleware } from '../middleware/auth';
import { User, UserPublic, RegisterRequest, LoginRequest, AuthResponse } from '../types';

const router = Router();

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_ROUNDS = 12;

export const toPublicUser = (user: User): UserPublic => ({
  id: user.id,
  username: user.username,
  display_name: user.display_name,
  avatar_url: user.avatar_url,
  xp: user.xp,
  level: user.level,
  streak: user.streak,
  personal_best: user.personal_best,
  is_guest: Boolean(user.is_guest),
  created_at: user.created_at,
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const body = (req.body ?? {}) as Partial<RegisterRequest>;
    const username = String(body.username ?? '').trim().toLowerCase();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    // display_name is optional: fall back to the username so the client cannot
    // fail registration over a field it never asked for.
    const displayName = String(body.display_name ?? '').trim() || username;

    const fieldErrors: Record<string, string> = {};
    if (!USERNAME_RE.test(username)) {
      fieldErrors.username =
        'Username must be 3-30 characters: lowercase letters, numbers or underscores';
    } else if (username.startsWith('guest_')) {
      // Reserved for POST /api/auth/guest so the two can never collide.
      fieldErrors.username = 'That username is reserved';
    }
    if (!EMAIL_RE.test(email)) {
      fieldErrors.email = 'Enter a valid email address';
    } else if (email.endsWith('@guest.brainsnack.local')) {
      fieldErrors.email = 'That email domain is reserved';
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      fieldErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    if (displayName.length > 100) {
      fieldErrors.display_name = 'Display name must be under 100 characters';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({ error: 'Please fix the highlighted fields', fields: fieldErrors });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let user: User;
    try {
      const result = await query<User>(
        `INSERT INTO users (username, email, password_hash, display_name, avatar_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [username, email, passwordHash, displayName, `https://api.dicebear.com/7.x/initials/svg?seed=${username}`]
      );
      user = result.rows[0];
    } catch (error: any) {
      // Rely on the unique indexes rather than a check-then-insert race.
      if (error?.code === '23505') {
        return res
          .status(409)
          .json({ error: 'That email or username is already taken', fields: { username: 'Already taken' } });
      }
      throw error;
    }

    await query(
      `INSERT INTO streaks (user_id, current_streak, longest_streak, last_activity_date)
       VALUES ($1, 0, 0, NULL)
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id]
    );

    const response: AuthResponse = { user: toPublicUser(user), token: generateToken(user) };
    return res.status(201).json(response);
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Could not create the account. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = (req.body ?? {}) as Partial<LoginRequest>;
    const normalizedEmail = String(email ?? '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query<User>(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [normalizedEmail]
    );

    // Guest rows have a random, unknown password. Reject them before the
    // bcrypt comparison so the error message is accurate.
    const account = result.rows[0];
    if (account?.is_guest) {
      return res.status(401).json({ error: 'Guest sessions cannot be signed into. Continue as guest instead.' });
    }

    // Always run a bcrypt comparison so a missing account and a wrong password
    // take the same time - otherwise response latency enumerates valid emails.
    const hash = result.rows[0]?.password_hash ?? DUMMY_HASH;
    const passwordMatches = await bcrypt.compare(String(password), hash);

    if (result.rows.length === 0 || !passwordMatches) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    const user = result.rows[0];

    await query(
      `UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1`,
      [user.id]
    );

    const response: AuthResponse = { user: toPublicUser(user), token: generateToken(user) };
    return res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Could not sign you in. Please try again.' });
  }
});

/**
 * POST /api/auth/guest
 *
 * Creates a throwaway account and returns a normal session token. Guests are
 * real `users` rows rather than a parallel anonymous code path, so every route
 * (progress, XP, quizzes, challenges, posts) works for them with no special
 * casing anywhere else in the API. `is_guest` is what lets us hide them from
 * leaderboards and searches later.
 */
router.post('/guest', async (_req: Request, res: Response) => {
  try {
    // A random suffix guarantees the unique username/email indexes are
    // satisfied without a retry loop.
    const suffix = uuidv4().replace(/-/g, '').slice(0, 12);
    const username = `guest_${suffix}`;
    const email = `guest_${suffix}@guest.brainsnack.local`;

    // Random password nobody knows: guests can never be logged into, only used
    // through the token issued below.
    const passwordHash = await bcrypt.hash(uuidv4(), BCRYPT_ROUNDS);

    let user: User;
    try {
      const result = await query<User>(
        `INSERT INTO users (username, email, password_hash, display_name, avatar_url, is_guest)
         VALUES ($1, $2, $3, $4, $5, TRUE)
         RETURNING *`,
        [
          username,
          email,
          passwordHash,
          'Guest',
          `https://api.dicebear.com/7.x/thumbs/svg?seed=${username}`,
        ]
      );
      user = result.rows[0];
    } catch (error: any) {
      // Astronomically unlikely, but a collision must not surface as a 500.
      if (error?.code === '23505') {
        return res.status(409).json({ error: 'Could not start a guest session, please try again' });
      }
      throw error;
    }

    await query(
      `INSERT INTO streaks (user_id, current_streak, longest_streak, last_activity_date)
       VALUES ($1, 0, 0, NULL)
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id]
    );

    const response: AuthResponse = { user: toPublicUser(user), token: generateToken(user) };
    return res.status(201).json(response);
  } catch (error) {
    console.error('Guest session error:', error);
    return res.status(500).json({ error: 'Could not start a guest session. Please try again.' });
  }
});

/** GET /api/auth/me - used on app boot to restore a session from a stored token. */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  return res.json({ user: toPublicUser(req.user!) });
});

/**
 * POST /api/auth/logout
 *
 * Tokens are stateless, so the server has nothing to revoke - it says so
 * honestly instead of pretending a session was destroyed.
 */
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({ message: 'Signed out. Please discard the stored token.' });
});

/** A valid bcrypt hash of a value nobody knows, used only to equalise timing. */
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEe.iawq2NXwRrC/1kEPTGmiBsuxBbXqT';

export default router;
