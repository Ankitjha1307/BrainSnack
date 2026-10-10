import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, authMiddleware } from '../middleware/auth';
import { User as UserModel, Streak as StreakModel } from '../models';
import { UserPublic, RegisterRequest, LoginRequest, AuthResponse } from '../types';

const router = Router();

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_ROUNDS = 12;

/** Works with both a hydrated document and a plain `toObject()` result. */
export const toPublicUser = (user: any): UserPublic => ({
  id: user.id ?? String(user._id),
  username: user.username,
  display_name: user.display_name,
  avatar_url: user.avatar_url,
  xp: user.xp,
  level: user.level,
  streak: user.streak,
  personal_best: user.personal_best,
  created_at: user.created_at,
});

const isDuplicateKey = (error: any): boolean => error?.code === 11000;

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
    }
    if (!EMAIL_RE.test(email)) {
      fieldErrors.email = 'Enter a valid email address';
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

    let created;
    try {
      // Rely on the unique indexes rather than a check-then-insert race.
      created = await UserModel.create({
        username,
        email,
        password_hash: passwordHash,
        display_name: displayName,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
      });
    } catch (error: any) {
      if (isDuplicateKey(error)) {
        return res
          .status(409)
          .json({ error: 'That email or username is already taken', fields: { username: 'Already taken' } });
      }
      throw error;
    }

    const user = created.toObject() as any;

    await StreakModel.updateOne(
      { user_id: user.id },
      { $setOnInsert: { user_id: user.id, current_streak: 0, longest_streak: 0, last_activity_date: null } },
      { upsert: true }
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

    const account = await UserModel.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedEmail }],
    });

    // Always run a bcrypt comparison so a missing account and a wrong password
    // take the same time - otherwise response latency enumerates valid emails.
    const hash = account?.password_hash ?? DUMMY_HASH;
    const passwordMatches = await bcrypt.compare(String(password), hash);

    if (!account || !passwordMatches) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    await UserModel.updateOne({ _id: account._id }, { $set: { last_active: new Date() } });

    const user = account.toObject() as any;
    const response: AuthResponse = { user: toPublicUser(user), token: generateToken(user) };
    return res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Could not sign you in. Please try again.' });
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
