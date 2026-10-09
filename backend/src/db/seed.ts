/**
 * MongoDB seed script (`npm run db:seed`, `npm run db:reset`).
 *
 * The demo dataset originally lived in `seed.sql` for Postgres. `seedData.ts`
 * is that same data as plain table dumps; this script maps the rows onto the
 * Mongo models:
 *
 *   - the fixed UUIDs become the string `_id`s,
 *   - the `post_likes` join table is folded into `posts.likes`,
 *   - the `quiz_questions` join table is folded into the ordered
 *     `quizzes.question_ids` array,
 *   - ISO strings become real `Date` objects.
 *
 * Inserts go straight through the driver (`Model.collection`) so the historical
 * `created_at` values are preserved instead of being overwritten by Mongoose's
 * automatic timestamps.
 */
import mongoose from 'mongoose';
import { connectDatabase } from './index';
import { newId } from '../models';
import {
  User,
  Topic,
  Concept,
  Question,
  Quiz,
  QuizAttempt,
  LearnerTopicProgress,
  LearnerConceptProgress,
  XpTransaction,
  Streak,
  Badge,
  UserBadge,
  Follow,
  Post,
  Challenge,
} from '../models';
import {
  topics,
  concepts,
  questions,
  users,
  streaks,
  badges,
  userBadges,
  follows,
  posts,
  postLikes,
  challenges,
  learnerTopicProgress,
  xpTransactions,
  quizzes,
  quizQuestions,
  quizAttempts,
} from './seedData';

const reset = process.argv.includes('--reset');
const now = new Date();

const asDate = (value: string | null | undefined): Date | null =>
  value ? new Date(value) : null;

/** Move the SQL `id` column to Mongo's `_id`, leaving every other field. */
const withId = <T extends { id: string }>(row: T): Record<string, unknown> => {
  const { id, ...rest } = row;
  return { _id: id, ...rest };
};

/** Give rows without an id a fresh UUID and normalise timestamps to Dates. */
const finalize = (docs: Record<string, unknown>[]): Record<string, unknown>[] =>
  docs.map((doc) => {
    const created = doc.created_at ? new Date(doc.created_at as string) : now;
    return {
      _id: (doc._id as string) ?? newId(),
      ...doc,
      created_at: created,
      updated_at: doc.updated_at ? new Date(doc.updated_at as string) : created,
    };
  });

// ---------------------------------------------------------------------------
// Table transforms
// ---------------------------------------------------------------------------

const topicDocs = finalize((topics as any[]).map(withId));

const conceptDocs = finalize((concepts as any[]).map(withId));

const questionDocs = finalize(
  (questions as any[]).map((q) => ({ ...withId(q), options: q.options }))
);

const userDocs = finalize(
  (users as any[]).map((u) => ({ ...withId(u), last_active: asDate(u.last_active) }))
);

const streakDocs = finalize(
  (streaks as any[]).map((s) => ({
    ...s,
    last_activity_date: asDate(s.last_activity_date),
  }))
);

const badgeDocs = finalize((badges as any[]).map(withId));

const userBadgeDocs = finalize(
  (userBadges as any[]).map((b) => ({ ...b, earned_at: asDate(b.earned_at) }))
);

const followDocs = finalize(follows as any[]);

// Embed the likes join table directly on each post.
const likesByPost = new Map<string, string[]>();
for (const like of postLikes as any[]) {
  const list = likesByPost.get(like.post_id) ?? [];
  list.push(like.user_id);
  likesByPost.set(like.post_id, list);
}
const postDocs = finalize(
  (posts as any[]).map((p) => ({ ...withId(p), likes: likesByPost.get(p.id) ?? [] }))
);

const challengeDocs = finalize(
  (challenges as any[]).map((c) => ({
    ...withId(c),
    completed_at: asDate(c.completed_at),
  }))
);

const learnerTopicProgressDocs = finalize(learnerTopicProgress as any[]);

const xpTransactionDocs = finalize(xpTransactions as any[]);

// Embed the ordered question membership on each quiz.
const questionIdsByQuiz = new Map<string, string[]>();
for (const link of (quizQuestions as any[])
  .slice()
  .sort((a, b) => a.position - b.position)) {
  const list = questionIdsByQuiz.get(link.quiz_id) ?? [];
  list.push(link.question_id);
  questionIdsByQuiz.set(link.quiz_id, list);
}
const quizDocs = finalize(
  (quizzes as any[]).map((q) => ({
    ...withId(q),
    completed_at: asDate(q.completed_at),
    question_ids: questionIdsByQuiz.get(q.id) ?? [],
  }))
);

const quizAttemptDocs = finalize(quizAttempts as any[]);

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

/** Every model, in the order it is seeded (referenced collections first). */
const MODELS = [
  User,
  Topic,
  Concept,
  Question,
  Quiz,
  QuizAttempt,
  LearnerTopicProgress,
  LearnerConceptProgress,
  XpTransaction,
  Streak,
  Badge,
  UserBadge,
  Follow,
  Post,
  Challenge,
] as const;

const seed = async (): Promise<void> => {
  console.log(`\nSeeding BrainSnack MongoDB${reset ? ' (reset)' : ''}...\n`);

  await connectDatabase();

  if (reset) {
    await mongoose.connection.dropDatabase();
  }

  // Build indexes before inserting so unique constraints (usernames, etc.) are
  // enforced from the very first document.
  await Promise.all(MODELS.map((model) => model.createIndexes()));

  // Start from a clean slate either way. Deleting is idempotent and makes a
  // plain `db:seed` safe to re-run against an existing database.
  await Promise.all(MODELS.map((model) => model.collection.deleteMany({})));

  const insert = async (model: (typeof MODELS)[number], docs: unknown[]): Promise<void> => {
    if (docs.length === 0) return;
    await model.collection.insertMany(docs as never[]);
    console.log(`  ${model.collection.name.padEnd(28)} ${docs.length}`);
  };

  await insert(User, userDocs);
  await insert(Topic, topicDocs);
  await insert(Concept, conceptDocs);
  await insert(Question, questionDocs);
  await insert(Quiz, quizDocs);
  await insert(QuizAttempt, quizAttemptDocs);
  await insert(LearnerTopicProgress, learnerTopicProgressDocs);
  await insert(XpTransaction, xpTransactionDocs);
  await insert(Streak, streakDocs);
  await insert(Badge, badgeDocs);
  await insert(UserBadge, userBadgeDocs);
  await insert(Follow, followDocs);
  await insert(Post, postDocs);
  await insert(Challenge, challengeDocs);

  console.log('\nDone. Demo accounts use the password "password123":');
  console.log('  alex_codes, sarah_learns, mike_quiz, emma_brain, david_tech\n');

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error('\nSeed failed:', error instanceof Error ? error.message : error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
