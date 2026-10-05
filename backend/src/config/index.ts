import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// Commas separate multiple allowed origins: CORS_ORIGIN=http://localhost:3000,https://app.example.com
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const jwtSecret = process.env.JWT_SECRET || 'brainsnack-dev-secret-key-change-in-production';

// Never let the shipped dev secret reach production - it is in git history and
// anyone can mint a token for any account with it.
if (isProduction && jwtSecret === 'brainsnack-dev-secret-key-change-in-production') {
  throw new Error('JWT_SECRET must be set to a unique value when NODE_ENV=production');
}

if (isProduction && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set when NODE_ENV=production');
}

export const config = {
  // 3001 so it never collides with the Next.js dev server on 3000.
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv,

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/brainsnack',
    // Max pooled connections. Lower it to 1 when the app talks to a
    // single-connection Postgres (embedded PGlite, some proxies) so that
    // concurrent transactions cannot interleave on one session.
    poolMax: parseInt(process.env.DATABASE_POOL_MAX || '20', 10),
  },

  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT_MS || '10000', 10), // 10 seconds
  },

  cors: {
    origins: corsOrigins,
    // Convenience for single-origin setups; `cors` accepts arrays too.
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
  },
};
