import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/index';
import { User } from '../types';
import { User as UserModel, IUser } from '../models';

interface JwtPayload {
  userId: string;
  email: string;
}

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

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};

const bearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
};

const toLegacyUser = (doc: IUser): User => doc.toObject() as unknown as User;

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
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const user = await resolveJwtUser(token);
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
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = bearerToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    const user = await resolveJwtUser(token);
    if (user) {
      req.user = user;
      req.userId = user.id;
    }
  } catch {
    // An unusable credential is treated as anonymous rather than an error.
  }
  next();
};
