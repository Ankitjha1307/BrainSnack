import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index';
import { query } from './db';
import { runMigrations } from './db/migrations';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import topicRoutes from './routes/topics';
import quizRoutes from './routes/quizzes';
import leaderboardRoutes from './routes/leaderboard';
import progressRoutes from './routes/progress';
import postRoutes from './routes/posts';
import challengeRoutes from './routes/challenges';

const app = express();

app.disable('x-powered-by');

// Baseline hardening. The API serves JSON only, so a restrictive CSP costs
// nothing and blocks the obvious injection payloads.
app.use(helmet());

// Middleware
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Credential-stuffing guard. Generous enough to not trip a human demoing
// rapid-fire, tight enough to make online guessing impractical.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes.' },
});

// Request logging (development only)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Dependency status. Public so the app can show "AI: gemini" vs "AI: local bank"
// instead of silently pretending everything is live.
const dependencyStatus = async () => {
  const [db, ai] = await Promise.all([
    query('SELECT 1')
      .then(() => ({ ok: true as const }))
      .catch((error) => ({ ok: false as const, error: (error as Error).message })),
    import('./services/aiService').then((m) => m.aiService.getAIStatus()),
  ]);

  return {
    status: db.ok ? ('ok' as const) : ('degraded' as const),
    database: db,
    ai_service: ai,
    timestamp: new Date().toISOString(),
  };
};

app.get('/health', async (_req, res) => {
  const status = await dependencyStatus();
  res.status(status.status === 'ok' ? 200 : 503).json(status);
});

app.get('/api/status', async (_req, res) => {
  const status = await dependencyStatus();
  res.status(status.status === 'ok' ? 200 : 503).json(status);
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/challenges', challengeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  // Postgres unique-violation surfaces as a 500 otherwise; make it a 409.
  if (err?.code === '23505') {
    return res.status(409).json({ error: 'That record already exists' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = config.port;

// `schema.sql` drops every table, so it cannot be re-run against a live
// database. These additive patches bring an existing one up to date instead.
runMigrations().catch((error) => console.error('Migration runner failed:', error));

app.listen(PORT, () => {
  const line = (label: string, value: string) =>
    `║  ${label.padEnd(17)}${value.padEnd(48 - label.length)}║`;

  console.log(
    [
      '',
      '  🧠  BrainSnack API',
      `      http://localhost:${PORT}`,
      '',
      `      env      ${config.nodeEnv}`,
      `      cors     ${config.cors.origins.join(', ')}`,
      `      ai       ${config.aiService.url}`,
      '',
      '      POST   /api/auth/register | /api/auth/login | /api/auth/guest',
      '      GET    /health   (db + ai status)',
      '      GET    /api/topics',
      '      POST   /api/quizzes/generate',
      '      POST   /api/quizzes/:id/answer | /complete',
      '      GET    /api/progress | /api/leaderboard',
      '      GET    /api/posts   POST /api/posts/:id/like',
      '      GET    /api/challenges',
      '      POST   /api/users/:id/follow',
      '',
    ].join('\n')
  );
});

export default app;
