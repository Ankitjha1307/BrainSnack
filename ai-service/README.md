# AI Service

FastAPI service that generates quiz questions and makes adaptive-learning
recommendations. It is called **server-side only** by the Node backend
(`backend/src/services/aiService.ts`) - the browser never talks to it directly,
so no auth or CORS-for-credentials is needed here.

## Provider selection

`AI_PROVIDER` in `.env` picks the implementation:

| `AI_PROVIDER` | Behaviour |
|---|---|
| `mock` (default) | Serves questions from `app/services/question_bank.py`, ranked by the learner's weak concepts, recent mistakes, and target difficulty. Deterministic and offline. |
| `gemini` | Calls Google Gemini. **Falls back to the mock bank automatically when `GEMINI_API_KEY` is unset**, so the demo never hard-fails. |

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Reports the active provider and whether it is usable. |
| `POST` | `/generate-quiz` | `{ topic, question_count, difficulty, weak_concepts, recent_mistakes, user_performance }` -> `{ quiz: { topic, difficulty, questions[] } }` |
| `POST` | `/validate-question` | Scores a question's structure; returns `{ is_valid, score, feedback, issues[] }` |
| `POST` | `/adaptive-recommendation` | `{ user_id, recent_performance, topic_mastery, weak_concepts, current_difficulty }` -> `{ recommended_topic, recommended_difficulty, focus_concepts, reason }` |

A generated question is:

```json
{
  "question": "Which method adds an element to the end of an array?",
  "options": ["shift()", "push()", "unshift()", "pop()"],
  "correctAnswer": 1,
  "explanation": "push() appends to the end of an array.",
  "concept": "Arrays",
  "difficulty": "easy"
}
```

Note the camelCase field names - they are the wire format the backend maps into
its own snake_case rows. The backend also strips `correctAnswer` before sending
anything to the browser, so a learner cannot read the answer key out of the quiz
payload.

## Run

```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --port 8000 --reload
```

Check it is up:

```bash
curl http://localhost:8000/health
```

If this service is down the backend still serves quizzes from the Postgres
question bank - `POST /api/quizzes/generate` falls back automatically and tags
the response with `"source": "bank"`.
