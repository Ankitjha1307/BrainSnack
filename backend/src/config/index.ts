import dotenv from 'dotenv';

import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// Commas separate multiple allowed origins: CORS_ORIGIN=http://localhost:3000,https://app.example.com
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const jwtSecret = process.env.JWT_SECRET || 'brainsnack-dev-secret-key-change-in-production';

/**
 * MOCK MONGODB CONNECTION STRING.
 *
 * This is the fallback used when `MONGODB_URI` is not set in the environment.
 * It points at a local MongoDB instance. Change `MONGODB_URI` in `backend/.env`
 * (or this constant) to your own MongoDB / Atlas connection string.
 */
const MOCK_MONGODB_URI = 'mongodb://127.0.0.1:27017/brainsnack';

// Never let the shipped dev secret reach production - it is in git history and
// anyone can mint a token for any account with it.
if (isProduction && jwtSecret === 'brainsnack-dev-secret-key-change-in-production') {
  throw new Error('JWT_SECRET must be set to a unique value when NODE_ENV=production');
}

if (isProduction && !process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI must be set when NODE_ENV=production');
}

const aiProvider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

export const config = {
  // 3001 so it never collides with the Next.js dev server on 3000.
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv,

  database: {
    // See MOCK_MONGODB_URI above. Overridden by `MONGODB_URI` in the environment.
    uri: process.env.MONGODB_URI || MOCK_MONGODB_URI,
    // Give a slow local/Atlas connection room to come up before failing fast.
    connectTimeoutMs: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS || '10000', 10),
  },

  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  ai: {
    // AI is now served in-process by this REST API - there is no separate
    // FastAPI service to call.
    provider: aiProvider === 'gemini' ? ('gemini' as const) : ('mock' as const),
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    geminiModels: (process.env.GEMINI_MODELS ||
      process.env.GEMINI_MODEL ||
      'gemini-2.5-flash,gemini-2.5-pro,gemini-1.5-flash')
      .split(',')
      .map((model) => model.trim())
      .filter(Boolean),
    timeout: parseInt(process.env.AI_TIMEOUT_MS || '10000', 10),
  },

  cors: {
    origins: corsOrigins,
    // Convenience for single-origin setups; `cors` accepts arrays too.
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
  },
};

export { MOCK_MONGODB_URI };
