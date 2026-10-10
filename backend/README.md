# BrainSnack Backend

A gamified learning platform backend built with Node.js, Express, and TypeScript.

## Features

- **User Authentication** - JWT-based auth with bcrypt password hashing
- **Quiz System** - AI-powered quiz generation with local fallback
- **XP & Leveling** - Gamified progression system
- **Streaks** - Daily activity tracking
- **Badges** - Achievement system with automatic badge checking
- **Adaptive Learning** - Difficulty adjustment based on performance
- **Social Features** - Follows, posts, likes, and challenges
- **Leaderboards** - Daily, weekly, and all-time rankings

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Language**: TypeScript 5
- **Database**: MongoDB + Mongoose ODM
- **Auth**: JWT + bcryptjs
- **AI**: In-process TypeScript provider (mock question bank / Google Gemini)

## Project Structure

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
├── src/
│   ├── index.ts              # Entry point
│   ├── config/
│   │   └── index.ts          # Configuration
│   ├── db/
│   │   ├── index.ts          # Mongoose connection
│   │   ├── seed.ts           # Seed / reset script
│   │   └── seedData.ts       # Plain seed tables
│   ├── models/
│   │   └── index.ts          # Mongoose models
│   ├── middleware/
│   │   └── auth.ts           # Auth middleware
│   ├── routes/
│   │   ├── auth.ts           # Auth routes
│   │   ├── users.ts          # User routes
│   │   ├── topics.ts         # Topic routes
│   │   ├── quizzes.ts        # Quiz routes
│   │   ├── leaderboard.ts    # Leaderboard routes
│   │   ├── progress.ts       # Progress routes
│   │   ├── posts.ts          # Post routes
│   │   ├── challenges.ts     # Challenge routes
│   │   └── ai.ts             # AI routes
│   ├── services/
│   │   ├── ai/               # In-process AI providers + question bank
│   │   ├── xpService.ts      # XP system
│   │   ├── streakService.ts  # Streak tracking
│   │   ├── badgeService.ts   # Badge system
│   │   └── adaptiveService.ts # Adaptive difficulty
│   └── types/
│       └── index.ts          # TypeScript types
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
```

### Database Setup

Set `MONGODB_URI` in `.env` to your MongoDB connection string (default mock:
`mongodb://127.0.0.1:27017/brainsnack`), then:

```bash
# Create collections + seed demo data (clears collections first, re-runnable)
npm run db:seed

# Drop the database and reseed from scratch
npm run db:reset
```

### Running

```bash# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout (client-side) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/search?q=` | Search users |
| POST | `/api/users/:id/follow` | Follow/unfollow user |
| GET | `/api/users/:id/followers` | Get followers |
| GET | `/api/users/:id/following` | Get following |

### Topics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/topics` | List all topics |
| GET | `/api/topics/:id` | Get topic with concepts |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quizzes/generate` | Generate quiz |
| GET | `/api/quizzes/:id` | Get quiz with questions |
| POST | `/api/quizzes/:id/attempt` | Submit quiz attempt |
| POST | `/api/quizzes/:id/complete` | Complete quiz |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Get leaderboard |
| GET | `/api/leaderboard/streaks` | Top streaks |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress` | Get user progress |
| GET | `/api/progress/topics` | Get topic mastery |

### Feed & Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feed` | Get community feed |
| POST | `/api/posts` | Create post |
| POST | `/api/posts/:id/like` | Like/unlike post |
| DELETE | `/api/posts/:id` | Delete post |

### Challenges
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/challenges` | Create challenge |
| GET | `/api/challenges` | Get user's challenges |
| POST | `/api/challenges/:id/accept` | Accept challenge |
| POST | `/api/challenges/:id/complete` | Complete challenge |
| POST | `/api/challenges/:id/decline` | Decline challenge |

## XP System

| Difficulty | XP per Correct Answer |
|------------|----------------------|
| Easy | 10 XP |
| Medium | 20 XP |
| Hard | 30 XP |

**Bonuses:**
- Perfect score (100%): +100 XP
- Daily streak: +50 XP
- Challenge win: +100 XP

## AI Integration

AI runs in-process — there is no separate service. Quiz generation, validation,
and adaptive recommendations are served by a TypeScript provider selected with
`AI_PROVIDER`:

- `mock` (default) — offline question bank, no API key needed
- `gemini` — calls the Gemini REST API using `GEMINI_API_KEY`

The product UI reaches AI through `POST /api/quizzes/generate` (authenticated,
persists its output). Developer/tooling endpoints live under `/api/ai`:

- `GET /api/ai/health` - active provider and status
- `POST /api/ai/generate-quiz` - generate quiz questions
- `POST /api/ai/validate-question` - validate question quality
- `POST /api/ai/adaptive-recommendation` - get difficulty recommendations

## Demo Users

After seeding, you can login with any of these accounts (password: `password123`):

| Username | Email | Level | XP |
|----------|-------|-------|-----|
| alex_codes | alex@brainsnack.com | 8 | 2,450 |
| sarah_learns | sarah@brainsnack.com | 6 | 1,820 |
| mike_quiz | mike@brainsnack.com | 10 | 3,100 |
| emma_brain | emma@brainsnack.com | 4 | 980 |
| david_tech | david@brainsnack.com | 12 | 4,200 |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `MONGODB_URI` | MongoDB connection string (mock/local by default) | `mongodb://127.0.0.1:27017/brainsnack` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | 7d |
| `AI_PROVIDER` | `mock` or `gemini` | `mock` |
| `GEMINI_API_KEY` | Gemini API key (when `AI_PROVIDER=gemini`) | - |
| `GEMINI_MODEL` | Gemini model id | `gemini-1.5-flash` |
| `CORS_ORIGIN` | Allowed CORS origin(s) | `http://localhost:3000` |

## License

MIT
