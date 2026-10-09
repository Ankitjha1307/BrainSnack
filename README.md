# BrainSnack

> **Turn your 2-minute scroll into 2-minute learning.**

BrainSnack is a social, AI-powered micro-learning platform designed for 2–5 minute sessions. It uses an adaptive learner knowledge profile to continuously determine what you should learn next — not just random quizzes.

## Features

- **Adaptive Learning Engine** — Tracks topic/concept mastery and adjusts difficulty in real-time
- **AI-Powered Quiz Generation** — In-process TypeScript provider (mock for offline dev, Gemini for production)
- **Gamified Experience** — XP, streaks, levels, badges, and leaderboards
- **Social Learning** — Achievement posts, likes, follows, and friend challenges
- **Polished UI** — Modern, responsive, dark mode support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js App Router + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| AI | In-process TypeScript provider (mock / Google Gemini) |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT + guest sessions |

## Project Structure

```
BrainSnack/
├── frontend/          # Next.js application
├── backend/           # Node.js + Express API (REST + in-process AI)
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+ running locally, or a MongoDB Atlas connection string

### 1. Database Setup

The backend ships a seed script that creates the collections and loads demo data.
Point `MONGODB_URI` in `backend/.env` at your MongoDB instance first (see
[Configuration](#configuration)), then run:

```bash
cd backend
npm install

# Create collections + demo data (safe to re-run; clears collections first)
npm run db:seed

# Or drop the whole database and reseed from scratch
npm run db:reset
```

> The default connection string is a **mock/local** value:
> `mongodb://127.0.0.1:27017/brainsnack`. It lives in two files — `backend/.env`
> and `backend/.env.example` — and as the `MOCK_MONGODB_URI` fallback constant in
> `backend/src/config/index.ts`. Replace it with your own MongoDB URI.

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Runs on http://localhost:3001

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Runs on http://localhost:3000

## Configuration

All configuration lives in `backend/.env` (copy from `.env.example`):

```env
# Replace this MOCK CONNECTION STRING with your own MongoDB URI.
# Local:  mongodb://127.0.0.1:27017/brainsnack
# Atlas:  mongodb+srv://<user>:<password>@<cluster>.mongodb.net/brainsnack?retryWrites=true&w=majority
MONGODB_URI=mongodb://127.0.0.1:27017/brainsnack

# AI provider (served in-process by this REST API)
# mock (default, offline) | gemini
AI_PROVIDER=mock
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

The application works without any API keys using the mock provider. To switch to
Gemini, set `AI_PROVIDER=gemini` and provide `GEMINI_API_KEY`.

## Demo Accounts

Or skip auth entirely — the login page has a **Continue as Guest** button that
creates a throwaway account. Guests can take quizzes and earn XP, but are
excluded from the leaderboard, user search, and the public community feed.

After seeding the database, five demo accounts exist. All use the password
`password123`:

| Username | Email |
|----------|-------|
| alex_codes | alex@brainsnack.com |
| sarah_learns | sarah@brainsnack.com |
| mike_quiz | mike@brainsnack.com |
| emma_brain | emma@brainsnack.com |
| david_tech | david@brainsnack.com |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/guest` — Create a throwaway guest account and log in
- `GET /api/auth/me` — Current user
- `POST /api/auth/logout` — Log out

### Topics
- `GET /api/topics` — List topics
- `GET /api/topics/:id` — Topic detail

### Quizzes
- `POST /api/quizzes/generate` — Generate an adaptive quiz
- `GET /api/quizzes` — List quizzes
- `GET /api/quizzes/:id` — Get a quiz
- `POST /api/quizzes/:id/answer` — Submit a single answer
- `POST /api/quizzes/:id/complete` — Finish, bank XP, return results

### Progress
- `GET /api/progress` — Overall learner progress
- `GET /api/progress/topics` — Per-topic progress

### Social
- `GET /api/posts` — Community feed
- `POST /api/posts` — Create post
- `GET /api/posts/mine` — Your posts
- `GET /api/posts/:id` — Post detail
- `DELETE /api/posts/:id` — Delete post
- `POST /api/posts/:id/like` — Like post
- `DELETE /api/posts/:id/like` — Unlike post
- `POST /api/challenges` — Create challenge
- `GET /api/challenges` — List challenges
- `GET /api/challenges/:id` — Challenge detail
- `POST /api/challenges/:id/accept` — Accept a challenge
- `POST /api/challenges/:id/decline` — Decline a challenge
- `POST /api/challenges/:id/submit` — Submit a score for a challenge

### Leaderboard
- `GET /api/leaderboard` — Rankings (`?period=today|week|all`)
- `GET /api/leaderboard/me` — Your standing
- `GET /api/leaderboard/streaks` — Streak board

### Users
- `GET /api/users/me` — Current user
- `GET /api/users/search` — Search users
- `GET /api/users/:id` — Public profile
- `GET /api/users/:id/stats` — Public stats
- `GET /api/users/:id/followers` — Followers
- `GET /api/users/:id/following` — Following
- `POST /api/users/:id/follow` — Follow
- `DELETE /api/users/:id/follow` — Unfollow

### AI (in-process)
- `GET /api/ai/health` — Active provider and status
- `POST /api/ai/generate-quiz` — Generate quiz questions
- `POST /api/ai/validate-question` — Validate a question
- `POST /api/ai/adaptive-recommendation` — Get a recommendation

## MVP Phases

- [x] **Phase 1** — Database, Auth, Frontend Shell, Dashboard, Topics, Mock AI Quiz, Quiz UI
- [x] **Phase 2** — XP, Streak, Learner Profile, Adaptive Difficulty, Topic Mastery, Leaderboard
- [x] **Phase 3** — Achievement Posts, Likes, Follows, Friend Challenges
- [x] **Phase 4** — Badges, Animations, Responsive Polish, Demo Preparation

---

**Don't scroll for two minutes. Learn for two minutes.**
