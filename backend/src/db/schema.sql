-- BrainSnack Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS xp_transactions CASCADE;
DROP TABLE IF EXISTS learner_concept_progress CASCADE;
DROP TABLE IF EXISTS learner_topic_progress CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS concepts CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS streaks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE,
    personal_best INTEGER DEFAULT 0,
    -- Throwaway accounts created by POST /api/auth/guest. They get a real row so
    -- every existing route works unchanged, but they cannot be logged into and
    -- are hidden from public lists.
    is_guest BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Topics table
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50) DEFAULT '📚',
    color VARCHAR(7) DEFAULT '#6366f1',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Concepts table (sub-topics)
CREATE TABLE concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(topic_id, slug)
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    concept_id UUID REFERENCES concepts(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question_count INTEGER DEFAULT 5,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    xp_earned INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Quiz attempts table
-- One row per (quiz, question). The unique constraint is what stops a client
-- from resubmitting the same answer to inflate accuracy/mastery/XP.
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer INTEGER,
    is_correct BOOLEAN DEFAULT FALSE,
    time_taken INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quiz_id, question_id)
);

-- Which questions belong to which quiz, in which order.
-- Without this the "quiz" was reconstructed as "the N newest questions for the
-- topic", so a quiz's content changed whenever anyone else generated a quiz.
CREATE TABLE quiz_questions (
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    PRIMARY KEY (quiz_id, question_id)
);

-- Learner topic progress
CREATE TABLE learner_topic_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    accuracy DECIMAL(5,2) DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    mastery_percentage DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, topic_id)
);

-- Learner concept progress
CREATE TABLE learner_concept_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    accuracy DECIMAL(5,2) DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    mastery_percentage DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, concept_id)
);

-- XP transactions
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Streaks table
CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Badges table
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT '🏆',
    criteria_type VARCHAR(50) NOT NULL CHECK (criteria_type IN ('xp', 'streak', 'quiz_count', 'perfect_score', 'topic_mastery', 'level')),
    criteria_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User badges (earned)
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- Follows table
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, followee_id),
    CHECK (follower_id != followee_id)
);

-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('achievement', 'badge', 'streak', 'challenge', 'general')),
    content JSONB NOT NULL DEFAULT '{}',
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Post likes
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Challenges table
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challengee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    target_score INTEGER NOT NULL DEFAULT 80,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'declined')),
    challenger_score INTEGER,
    challengee_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CHECK (challenger_id != challengee_id)
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_xp ON users(xp DESC);
CREATE INDEX idx_users_level ON users(level DESC);

CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_concept ON questions(concept_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

CREATE INDEX idx_quizzes_user ON quizzes(user_id);
CREATE INDEX idx_quizzes_topic ON quizzes(topic_id);
CREATE INDEX idx_quizzes_status ON quizzes(status);

CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_question ON quiz_attempts(question_id);

CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id, position);
CREATE INDEX idx_quiz_questions_question ON quiz_questions(question_id);

CREATE INDEX idx_learner_topic_progress_user ON learner_topic_progress(user_id);
CREATE INDEX idx_learner_topic_progress_topic ON learner_topic_progress(topic_id);

CREATE INDEX idx_learner_concept_progress_user ON learner_concept_progress(user_id);
CREATE INDEX idx_learner_concept_progress_concept ON learner_concept_progress(concept_id);

CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created ON xp_transactions(created_at DESC);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_followee ON follows(followee_id);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);

CREATE INDEX idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX idx_challenges_challengee ON challenges(challengee_id);
CREATE INDEX idx_challenges_status ON challenges(status);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learner_topic_progress_updated_at BEFORE UPDATE ON learner_topic_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learner_concept_progress_updated_at BEFORE UPDATE ON learner_concept_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
