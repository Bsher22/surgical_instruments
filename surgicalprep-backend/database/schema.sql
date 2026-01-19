-- SurgicalPrep Database Schema
-- PostgreSQL / Supabase
-- Run this in the Supabase SQL Editor

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM (
    'student',
    'surgical_tech',
    'nurse',
    'educator',
    'other'
);

CREATE TYPE subscription_tier AS ENUM (
    'free',
    'premium'
);

CREATE TYPE instrument_category AS ENUM (
    'cutting',
    'clamping',
    'grasping',
    'retracting',
    'suturing',
    'suctioning',
    'probing',
    'dilating',
    'specialty',
    'other'
);

CREATE TYPE card_item_category AS ENUM (
    'instruments',
    'supplies',
    'sutures',
    'implants',
    'medications',
    'other'
);

CREATE TYPE quiz_type AS ENUM (
    'flashcard',
    'multiple_choice',
    'mixed'
);

-- =====================================================
-- TABLE 1: USERS
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'student',
    institution VARCHAR(255),
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups (login)
CREATE INDEX idx_users_email ON users(email);

-- Index for Stripe customer lookups
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- =====================================================
-- TABLE 2: INSTRUMENTS
-- =====================================================

CREATE TABLE instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    aliases TEXT[], -- Array of alternative names
    category instrument_category NOT NULL,
    description TEXT,
    primary_uses TEXT[], -- Array of use cases
    common_procedures TEXT[], -- Array of procedure names
    handling_notes TEXT,
    image_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    is_premium BOOLEAN DEFAULT FALSE,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for category filtering
CREATE INDEX idx_instruments_category ON instruments(category);

-- Index for premium filtering
CREATE INDEX idx_instruments_premium ON instruments(is_premium);

-- Full-text search index
CREATE INDEX idx_instruments_search ON instruments USING GIN(search_vector);

-- Trigram index for fuzzy search on name
CREATE INDEX idx_instruments_name_trgm ON instruments USING GIN(name gin_trgm_ops);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_instrument_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.aliases, ' '), '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.primary_uses, ' '), '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.common_procedures, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector
CREATE TRIGGER trigger_update_instrument_search
    BEFORE INSERT OR UPDATE ON instruments
    FOR EACH ROW
    EXECUTE FUNCTION update_instrument_search_vector();

-- =====================================================
-- TABLE 3: PREFERENCE CARDS
-- =====================================================

CREATE TABLE preference_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    surgeon_name VARCHAR(255),
    procedure_name VARCHAR(255),
    specialty VARCHAR(100),
    general_notes TEXT,
    setup_notes TEXT,
    setup_photos TEXT[], -- Array of image URLs
    is_template BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user's cards lookup
CREATE INDEX idx_preference_cards_user ON preference_cards(user_id);

-- Index for template cards
CREATE INDEX idx_preference_cards_template ON preference_cards(is_template) WHERE is_template = TRUE;

-- Index for public cards
CREATE INDEX idx_preference_cards_public ON preference_cards(is_public) WHERE is_public = TRUE;

-- Composite index for user + updated_at (for sorting)
CREATE INDEX idx_preference_cards_user_updated ON preference_cards(user_id, updated_at DESC);

-- =====================================================
-- TABLE 4: PREFERENCE CARD ITEMS
-- =====================================================

CREATE TABLE preference_card_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES preference_cards(id) ON DELETE CASCADE,
    instrument_id UUID REFERENCES instruments(id) ON DELETE SET NULL, -- NULL if custom item
    custom_name VARCHAR(255), -- Used if instrument_id is NULL
    category card_item_category NOT NULL DEFAULT 'instruments',
    quantity INTEGER DEFAULT 1,
    size VARCHAR(100),
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for card items lookup
CREATE INDEX idx_card_items_card ON preference_card_items(card_id);

-- Composite index for card + sort order
CREATE INDEX idx_card_items_card_order ON preference_card_items(card_id, sort_order);

-- =====================================================
-- TABLE 5: USER INSTRUMENT PROGRESS
-- =====================================================

CREATE TABLE user_instrument_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    times_studied INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    times_incorrect INTEGER DEFAULT 0,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    last_studied_at TIMESTAMPTZ,
    next_review_at TIMESTAMPTZ, -- For spaced repetition
    ease_factor FLOAT DEFAULT 2.5, -- SM-2 algorithm parameter
    interval_days INTEGER DEFAULT 1, -- SM-2 algorithm parameter
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Each user can only have one progress record per instrument
    UNIQUE(user_id, instrument_id)
);

-- Index for user's progress lookup
CREATE INDEX idx_progress_user ON user_instrument_progress(user_id);

-- Index for bookmarked instruments
CREATE INDEX idx_progress_bookmarked ON user_instrument_progress(user_id, is_bookmarked) 
    WHERE is_bookmarked = TRUE;

-- Index for due for review
CREATE INDEX idx_progress_review ON user_instrument_progress(user_id, next_review_at)
    WHERE next_review_at IS NOT NULL;

-- =====================================================
-- TABLE 6: QUIZ SESSIONS
-- =====================================================

CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_type quiz_type NOT NULL,
    category_filter instrument_category[], -- NULL means all categories
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    session_data JSONB -- Stores questions, answers, and detailed results
);

-- Index for user's quiz history
CREATE INDEX idx_quiz_user ON quiz_sessions(user_id);

-- Index for user's completed quizzes
CREATE INDEX idx_quiz_user_completed ON quiz_sessions(user_id, completed_at DESC)
    WHERE completed = TRUE;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_instruments_updated_at
    BEFORE UPDATE ON instruments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_preference_cards_updated_at
    BEFORE UPDATE ON preference_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_progress_updated_at
    BEFORE UPDATE ON user_instrument_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- FULL-TEXT SEARCH FUNCTION
-- =====================================================

-- Function to search instruments
CREATE OR REPLACE FUNCTION search_instruments(
    search_query TEXT,
    category_filter instrument_category DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    aliases TEXT[],
    category instrument_category,
    description TEXT,
    image_url VARCHAR,
    thumbnail_url VARCHAR,
    is_premium BOOLEAN,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.name,
        i.aliases,
        i.category,
        i.description,
        i.image_url,
        i.thumbnail_url,
        i.is_premium,
        ts_rank(i.search_vector, plainto_tsquery('english', search_query)) AS rank
    FROM instruments i
    WHERE 
        (category_filter IS NULL OR i.category = category_filter)
        AND (
            i.search_vector @@ plainto_tsquery('english', search_query)
            OR i.name ILIKE '%' || search_query || '%'
            OR search_query = ANY(i.aliases)
        )
    ORDER BY rank DESC, i.name ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUBSCRIPTION LIMIT HELPERS
-- =====================================================

-- Function to count user's preference cards
CREATE OR REPLACE FUNCTION count_user_cards(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM preference_cards WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Function to count user's daily quiz sessions
CREATE OR REPLACE FUNCTION count_daily_quizzes(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM quiz_sessions 
        WHERE user_id = p_user_id 
        AND started_at >= CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is premium
CREATE OR REPLACE FUNCTION is_user_premium(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier subscription_tier;
    expires_at TIMESTAMPTZ;
BEGIN
    SELECT subscription_tier, subscription_expires_at 
    INTO user_tier, expires_at
    FROM users 
    WHERE id = p_user_id;
    
    RETURN user_tier = 'premium' AND (expires_at IS NULL OR expires_at > NOW());
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'User accounts with subscription info';
COMMENT ON TABLE instruments IS 'Surgical instruments database with full-text search';
COMMENT ON TABLE preference_cards IS 'User-created preference cards for procedures';
COMMENT ON TABLE preference_card_items IS 'Items within preference cards';
COMMENT ON TABLE user_instrument_progress IS 'User study progress with spaced repetition data';
COMMENT ON TABLE quiz_sessions IS 'Quiz session history and results';
