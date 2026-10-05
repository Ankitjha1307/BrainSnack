# BrainSnack

> **Turn your 2-minute scroll into 2-minute learning.**

BrainSnack is a social, AI-powered micro-learning platform designed for 2–5 minute sessions. It uses an adaptive learner knowledge profile to continuously determine what you should learn next — not just random quizzes.

## Features

- **Adaptive Learning Engine** — Tracks topic/concept mastery and adjusts difficulty in real-time
- **AI-Powered Quiz Generation** — Gemini API integration with mock provider for development
- **Gamified Experience** — XP, streaks, levels, badges, and leaderboards
- **Social Learning** — Achievement posts, likes, follows, and friend challenges
- **Polished UI** — Modern, responsive, dark mode support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js App Router + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| AI Service | Python FastAPI + Google Gemini API |
| Database | PostgreSQL |
| Auth | JWT |

## Project Structure

```
BrainSnack/
├── frontend/          # Next.js application
├── backend/           # Node.js + Express API
├── ai-service/        # Python FastAPI + Gemini service
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### 1. Database Setup

```bash
# Create database
createdb brainsnack

# Run schema and seed data
psql -d brainsnack -f backend/src/db/schema.sql
psql -d brainsnack -f backend/src/db/seed.sql
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Runs on http://localhost:3001

### 3. AI Service Setup

```bash
cd ai-service
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs on http://localhost:8000

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Runs on http://localhost:3000

## AI Provider Configuration

The application works without any API keys using the mock provider.

```env
# ai-service/.env
AI_PROVIDER=mock
```

To switch to Gemini:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_api_key_here
```

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

### AI Service
- `POST /generate-quiz` — Generate quiz
- `POST /validate-question` — Validate question
- `POST /adaptive-recommendation` — Get recommendation

## MVP Phases

- [x] **Phase 1** — Database, Auth, Frontend Shell, Dashboard, Topics, Mock AI Quiz, Quiz UI
- [x] **Phase 2** — XP, Streak, Learner Profile, Adaptive Difficulty, Topic Mastery, Leaderboard
- [x] **Phase 3** — Achievement Posts, Likes, Follows, Friend Challenges
- [x] **Phase 4** — Badges, Animations, Responsive Polish, Demo Preparation

---

**Don't scroll for two minutes. Learn for two minutes.**
