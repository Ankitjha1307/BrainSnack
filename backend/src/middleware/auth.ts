import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/index';
import { User } from '../types';
import { User as UserModel, IUser } from '../models';

interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Guest sessions bypass the JWT system entirely.
 *
 * A guest token is the literal string `guest_<user id>`. The middleware below
 * recognises that prefix and loads the guest row directly - no signature check,
 * no expiry - so "Continue as guest" works even if JWT auth is broken or the
 * user never had a real account.
 */
const GUEST_TOKEN_PREFIX = 'guest_';

export const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
  };
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.jwt.secret, options);
};

/** Token for a throwaway guest. Not a JWT - resolved without verification. */
export const generateGuestToken = (user: { id: string }): string =>
  `${GUEST_TOKEN_PREFIX}${user.id}`;

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};

const bearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
};

/**
 * The credential presented with a request, if any.
 *
 * Accepts a bearer token (`Authorization: Bearer ...`) or a bare guest id via
 * the `X-Guest-Id` header, so a client can start a guest session without a
 * token at all.
 */
const presentedCredential = (req: Request): string | null => {
  const bearer = bearerToken(req);
  if (bearer) return bearer;

  const header = req.headers['x-guest-id'];
  if (typeof header === 'string' && header.trim()) {
    return `${GUEST_TOKEN_PREFIX}${header.trim()}`;
  }
  return null;
};

const isGuestCredential = (credential: string): boolean => credential.startsWith(GUEST_TOKEN_PREFIX);

const toLegacyUser = (doc: IUser): User => doc.toObject() as unknown as User;

/** Resolve a guest credential to its flagged user row, or null. */
const resolveGuestUser = async (credential: string): Promise<User | null> => {
  const guestId = credential.slice(GUEST_TOKEN_PREFIX.length).trim();
  if (!guestId) return null;

  const user = await UserModel.findOne({ _id: guestId, is_guest: true });
  return user ? toLegacyUser(user) : null;
};

/** Resolve a JWT to a live user row, or throw on an invalid token. */
const resolveJwtUser = async (token: string): Promise<User | null> => {
  const decoded = verifyToken(token);
  const user = await UserModel.findById(decoded.userId);
  return user ? toLegacyUser(user) : null;
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const credential = presentedCredential(req);
  if (!credential) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    // Guests never touch JWT verification - this is the bypass.
    if (isGuestCredential(credential)) {
      const guest = await resolveGuestUser(credential);
      if (!guest) {
        res.status(401).json({ error: 'Guest session is no longer valid' });
        return;
      }
      req.user = guest;
      req.userId = guest.id;
      next();
      return;
    }

    const user = await resolveJwtUser(credential);
    if (!user) {
      // Token is well-formed but the account is gone: tell the client to drop it.
      res.status(401).json({ error: 'Account no longer exists' });
      return;
    }
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Session expired, please sign in again' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

/** Attaches the user when a valid credential is present; never rejects. */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const credential = presentedCredential(req);
  if (!credential) {
    next();
    return;
  }
  try {
    const user = isGuestCredential(credential)
      ? await resolveGuestUser(credential)
      : await resolveJwtUser(credential);

    if (user) {
      req.user = user;
      req.userId = user.id;
    }
  } catch {
    // An unusable credential is treated as anonymous rather than an error.
  }
  next();
};
