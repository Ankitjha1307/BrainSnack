/**
 * Mongoose models for BrainSnack.
 *
 * The API speaks snake_case (the frontend was built against the old Postgres
 * schema), so every model keeps snake_case field names. `_id` is a String UUID
 * rather than an ObjectId so ids stay stable across reseeds and the frontend
 * keeps treating them as opaque strings.
 */
import { Schema, model, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export const newId = (): string => uuidv4();

const baseOptions = {
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
} as const;

/** Serialise `_id` as `id` so documents match the shapes the frontend expects. */
function idTransform(schema: Schema): void {
  const transform = (_doc: unknown, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  };
  schema.set('toJSON', { virtuals: true, versionKey: false, transform });
  schema.set('toObject', { virtuals: true, versionKey: false, transform });
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface IUser extends Document<string> {
  _id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak: number;
  last_active: Date | null;
  personal_best: number;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>(
  {
    _id: { type: String, default: newId },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    display_name: { type: String, required: true },
    avatar_url: { type: String, default: null },
    xp: { type: Number, default: 0, index: true },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    last_active: { type: Date, default: null },
    personal_best: { type: Number, default: 0 },
  },
  baseOptions
);
idTransform(userSchema);
export const User = model<IUser>('User', userSchema);

// ---------------------------------------------------------------------------
// Topics & concepts
// ---------------------------------------------------------------------------

export interface ITopic extends Document<string> {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

const topicSchema = new Schema<ITopic>(
  {
    _id: { type: String, default: newId },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, default: '📚' },
    color: { type: String, default: '#6366f1' },
    description: { type: String, default: null },
  },
  baseOptions
);
idTransform(topicSchema);
export const Topic = model<ITopic>('Topic', topicSchema);

export interface IConcept extends Document<string> {
  _id: string;
  topic_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

const conceptSchema = new Schema<IConcept>(
  {
    _id: { type: String, default: newId },
    topic_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: null },
  },
  baseOptions
);
conceptSchema.index({ topic_id: 1, slug: 1 }, { unique: true });
idTransform(conceptSchema);
export const Concept = model<IConcept>('Concept', conceptSchema);

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface IQuestion extends Document<string> {
  _id: string;
  topic_id: string;
  concept_id: string | null;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  difficulty: Difficulty;
  created_at: Date;
  updated_at: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    _id: { type: String, default: newId },
    topic_id: { type: String, required: true, index: true },
    concept_id: { type: String, default: null, index: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correct_answer: { type: Number, required: true },
    explanation: { type: String, default: null },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      index: true,
    },
  },
  baseOptions
);
idTransform(questionSchema);
export const Question = model<IQuestion>('Question', questionSchema);

// ---------------------------------------------------------------------------
// Quizzes
// ---------------------------------------------------------------------------

export type QuizStatus = 'in_progress' | 'completed' | 'abandoned';

export interface IQuiz extends Document<string> {
  _id: string;
  user_id: string;
  topic_id: string | null;
  difficulty: Difficulty;
  question_count: number;
  status: QuizStatus;
  xp_earned: number;
  score: number;
  // Ordered membership replaces the old `quiz_questions` join table. Everything
  // needed to render and grade a quiz lives on the quiz document.
  question_ids: string[];
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

const quizSchema = new Schema<IQuiz>(
  {
    _id: { type: String, default: newId },
    user_id: { type: String, required: true, index: true },
    topic_id: { type: String, default: null, index: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    question_count: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
      index: true,
    },
    xp_earned: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    question_ids: { type: [String], default: [] },
    completed_at: { type: Date, default: null },
  },
  baseOptions
);
idTransform(quizSchema);
export const Quiz = model<IQuiz>('Quiz', quizSchema);

export interface IQuizAttempt extends Document<string> {
  _id: string;
  quiz_id: string;
  question_id: string;
  selected_answer: number | null;
  is_correct: boolean;
  time_taken: number;
  created_at: Date;
  updated_at: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    _id: { type: String, default: newId },
    quiz_id: { type: String, required: true, index: true },
    question_id: { type: String, required: true, index: true },
    selected_answer: { type: Number, default: null },
    is_correct: { type: Boolean, default: false },
    time_taken: { type: Number, default: 0 },
  },
  baseOptions
);
// The unique constraint is what stops a client from resubmitting the same
// answer to inflate accuracy/mastery/XP.
quizAttemptSchema.index({ quiz_id: 1, question_id: 1 }, { unique: true });
idTransform(quizAttemptSchema);
export const QuizAttempt = model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);

// ---------------------------------------------------------------------------
// Learner progress
// ---------------------------------------------------------------------------

export interface ILearnerTopicProgress extends Document<string> {
  _id: string;
  user_id: string;
  topic_id: string;
  accuracy: number;
  questions_attempted: number;
  questions_correct: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  mastery_percentage: number;
  created_at: Date;
  updated_at: Date;
}

const learnerTopicProgressSchema = new Schema<ILearnerTopicProgress>(
  {
    _id: { type: String, default: newId },
    user_id: { type: String, required: true, index: true },
    topic_id: { type: String, required: true, index: true },
    accuracy: { type: Number, default: 0 },
    questions_attempted: { type: Number, default: 0 },
    questions_correct: { type: Number, default: 0 },
    difficulty_level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    mastery_percentage: { type: Number, default: 0 },
  },
  baseOptions
);
learnerTopicProgressSchema.index({ user_id: 1, topic_id: 1 }, { unique: true });
idTransform(learnerTopicProgressSchema);
export const LearnerTopicProgress = model<ILearnerTopicProgress>(
  'LearnerTopicProgress',
  learnerTopicProgressSchema
);

export interface ILearnerConceptProgress extends Document<string> {
  _id: string;
  user_id: string;
  concept_id: string;
  accuracy: number;
  questions_attempted: number;
  questions_correct: number;
  mastery_percentage: number;
  created_at: Date;
  updated_at: Date;
}

const learnerConceptProgressSchema = new Schema<ILearnerConceptProgress>(
  {
    _id: { type: String, default: newId },
    user_id: { type: String, required: true, index: true },
    concept_id: { type: String, required: true, index: true },
    accuracy: { type: Number, default: 0 },
    questions_attempted: { type: Number, default: 0 },
    questions_correct: { type: Number, default: 0 },
    mastery_percentage: { type: Number, default: 0 },
  },
  baseOptions
);
learnerConceptProgressSchema.index({ user_id: 1, concept_id: 1 }, { unique: true });
idTransform(learnerConceptProgressSchema);
export const LearnerConceptProgress = model<ILearnerConceptProgress>(
  'LearnerConceptProgress',
  learnerConceptProgressSchema
);

// ---------------------------------------------------------------------------
// XP & streaks
// ---------------------------------------------------------------------------

export interface IXpTransaction extends Document<string> {
  _id: string;
  user_id: string;
  amount: number;
  reason: string;
  reference_type: string | null;
  reference_id: string | null;
  created_at: Date;
  updated_at: Date;
}

const xpTransactionSchema = new Schema<IXpTransaction>(
  {
    _id: { type: String, default: newId },
    user_id: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    reference_type: { type: String, default: null },
    reference_id: { type: String, default: null },
  },
  baseOptions
);
xpTransactionSchema.index({ created_at: -1 });
idTransform(xpTransactionSchema);
export const XpTransaction = model<IXpTransaction>('XpTransaction', xpTransactionSchema);

export interface IStreak extends Document<string> {
  _id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

const streakSchema = new Schema<IStreak>(
  {
    _id: { type: String, default: newId },
    user_id: { type: String, required: true, unique: true },
    current_streak: { type: Number, default: 0 },
    longest_streak: { type: Number, default: 0 },
    last_activity_date: { type: Date, default: null },
  },
  baseOptions
);
idTransform(streakSchema);
export const Streak = model<IStreak>('Streak', streakSchema);

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

export type BadgeCriteria = 'xp' | 'streak' | 'quiz_count' | 'perfect_score' | 'topic_mastery' | 'level';

export interface IBadge extends Document<string> {
  _id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  criteria_type: BadgeCriteria;
  criteria_value: number;
  created_at: Date;
  updated_at: Date;
}

const badgeSchema = new Schema<IBadge>(
  {
    _id: { type: String, default: newId },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    icon: { type: String, default: '🏆' },
    criteria_type: {
      type: String,
      required: true,
      enum: ['xp', 'streak', 'quiz_count', 'perfect_score', 'topic_mastery', 'level'],
    },
    criteria_value: { type: Number, required: true },
  },
  baseOptions
);
idTransform(badgeSchema);
export const Badge = model<IBadge>('Badge', badgeSchema);

export interface IUserBadge extends Document<string> {
  _id: string;
  user_id: string;
  badge_id: string;
  earned_at: Date;
  created_at: Date;
  updated_at: Date;
}

const userBadgeSchema = new Schema<IUserBadge>(
  {
    _id: { type: String, default: newId },
    user_id: { type: String, required: true, index: true },
    badge_id: { type: String, required: true, index: true },
    earned_at: { type: Date, default: Date.now },
  },
  baseOptions
);
userBadgeSchema.index({ user_id: 1, badge_id: 1 }, { unique: true });
idTransform(userBadgeSchema);
export const UserBadge = model<IUserBadge>('UserBadge', userBadgeSchema);

// ---------------------------------------------------------------------------
// Social: follows
// ---------------------------------------------------------------------------

export interface IFollow extends Document<string> {
  _id: string;
  follower_id: string;
  followee_id: string;
  created_at: Date;
  updated_at: Date;
}

const followSchema = new Schema<IFollow>(
  {
    _id: { type: String, default: newId },
    follower_id: { type: String, required: true, index: true },
    followee_id: { type: String, required: true, index: true },
  },
  baseOptions
);
followSchema.index({ follower_id: 1, followee_id: 1 }, { unique: true });
idTransform(followSchema);
export const Follow = model<IFollow>('Follow', followSchema);

// ---------------------------------------------------------------------------
// Social: posts (likes embedded as an array of user ids)
// ---------------------------------------------------------------------------

export type PostType = 'achievement' | 'badge' | 'streak' | 'challenge' | 'general';

export interface IPost extends Document<string> {
  _id: string;
  user_id: string;
  type: PostType;
  content: Record<string, unknown>;
  caption: string | null;
  likes: string[];
  created_at: Date;
  updated_at: Date;
}

const postSchema = new Schema<IPost>(
  {
    _id: { type: String, default: newId },
    user_id: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['achievement', 'badge', 'streak', 'challenge', 'general'],
      default: 'general',
      index: true,
    },
    content: { type: Schema.Types.Mixed, default: {} },
    caption: { type: String, default: null },
    // Embedding likes avoids a join and makes the like/unlike operations a
    // single atomic $addToSet / $pull.
    likes: { type: [String], default: [] },
  },
  baseOptions
);
postSchema.index({ created_at: -1 });
idTransform(postSchema);
export const Post = model<IPost>('Post', postSchema);

// ---------------------------------------------------------------------------
// Social: challenges
// ---------------------------------------------------------------------------

export type ChallengeStatus = 'pending' | 'accepted' | 'completed' | 'declined';

export interface IChallenge extends Document<string> {
  _id: string;
  challenger_id: string;
  challengee_id: string;
  topic_id: string | null;
  target_score: number;
  status: ChallengeStatus;
  challenger_score: number | null;
  challengee_score: number | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

const challengeSchema = new Schema<IChallenge>(
  {
    _id: { type: String, default: newId },
    challenger_id: { type: String, required: true, index: true },
    challengee_id: { type: String, required: true, index: true },
    topic_id: { type: String, default: null, index: true },
    target_score: { type: Number, default: 80 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'declined'],
      default: 'pending',
      index: true,
    },
    challenger_score: { type: Number, default: null },
    challengee_score: { type: Number, default: null },
    completed_at: { type: Date, default: null },
  },
  baseOptions
);
idTransform(challengeSchema);
export const Challenge = model<IChallenge>('Challenge', challengeSchema);

export type UserModel = Model<IUser>;
