-- SurgicalPrep Row Level Security (RLS) Policies
-- Run this AFTER schema.sql in Supabase SQL Editor

-- =====================================================
-- ENABLE RLS ON TABLES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE preference_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE preference_card_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_instrument_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can read their own data
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid()::text = id::text);

-- Note: INSERT is handled by auth signup, DELETE should be admin-only or via API

-- =====================================================
-- INSTRUMENTS TABLE POLICIES
-- =====================================================

-- Everyone can read instruments (public data)
CREATE POLICY "Instruments are viewable by everyone"
    ON instruments FOR SELECT
    USING (true);

-- Only service role can modify instruments
-- (No INSERT/UPDATE/DELETE policies for authenticated users)

-- =====================================================
-- PREFERENCE CARDS TABLE POLICIES
-- =====================================================

-- Users can view their own cards
CREATE POLICY "Users can view own cards"
    ON preference_cards FOR SELECT
    USING (auth.uid()::text = user_id::text);

-- Users can view public template cards
CREATE POLICY "Users can view public templates"
    ON preference_cards FOR SELECT
    USING (is_public = true AND is_template = true);

-- Users can create their own cards
CREATE POLICY "Users can create own cards"
    ON preference_cards FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own cards
CREATE POLICY "Users can update own cards"
    ON preference_cards FOR UPDATE
    USING (auth.uid()::text = user_id::text);

-- Users can delete their own cards
CREATE POLICY "Users can delete own cards"
    ON preference_cards FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- =====================================================
-- PREFERENCE CARD ITEMS TABLE POLICIES
-- =====================================================

-- Users can view items in their own cards
CREATE POLICY "Users can view own card items"
    ON preference_card_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM preference_cards 
            WHERE preference_cards.id = preference_card_items.card_id 
            AND auth.uid()::text = preference_cards.user_id::text
        )
    );

-- Users can view items in public template cards
CREATE POLICY "Users can view public template items"
    ON preference_card_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM preference_cards 
            WHERE preference_cards.id = preference_card_items.card_id 
            AND preference_cards.is_public = true 
            AND preference_cards.is_template = true
        )
    );

-- Users can create items in their own cards
CREATE POLICY "Users can create own card items"
    ON preference_card_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM preference_cards 
            WHERE preference_cards.id = preference_card_items.card_id 
            AND auth.uid()::text = preference_cards.user_id::text
        )
    );

-- Users can update items in their own cards
CREATE POLICY "Users can update own card items"
    ON preference_card_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM preference_cards 
            WHERE preference_cards.id = preference_card_items.card_id 
            AND auth.uid()::text = preference_cards.user_id::text
        )
    );

-- Users can delete items from their own cards
CREATE POLICY "Users can delete own card items"
    ON preference_card_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM preference_cards 
            WHERE preference_cards.id = preference_card_items.card_id 
            AND auth.uid()::text = preference_cards.user_id::text
        )
    );

-- =====================================================
-- USER INSTRUMENT PROGRESS TABLE POLICIES
-- =====================================================

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
    ON user_instrument_progress FOR SELECT
    USING (auth.uid()::text = user_id::text);

-- Users can create their own progress records
CREATE POLICY "Users can create own progress"
    ON user_instrument_progress FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
    ON user_instrument_progress FOR UPDATE
    USING (auth.uid()::text = user_id::text);

-- Users can delete their own progress
CREATE POLICY "Users can delete own progress"
    ON user_instrument_progress FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- =====================================================
-- QUIZ SESSIONS TABLE POLICIES
-- =====================================================

-- Users can view their own quiz sessions
CREATE POLICY "Users can view own quizzes"
    ON quiz_sessions FOR SELECT
    USING (auth.uid()::text = user_id::text);

-- Users can create their own quiz sessions
CREATE POLICY "Users can create own quizzes"
    ON quiz_sessions FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own quiz sessions
CREATE POLICY "Users can update own quizzes"
    ON quiz_sessions FOR UPDATE
    USING (auth.uid()::text = user_id::text);

-- Users can delete their own quiz sessions
CREATE POLICY "Users can delete own quizzes"
    ON quiz_sessions FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- =====================================================
-- STORAGE POLICIES (for instrument-images bucket)
-- =====================================================

-- Note: Run these in the Supabase Dashboard > Storage > Policies
-- or via the storage API. Here's the SQL equivalent:

-- Allow public read access to instrument images
-- INSERT INTO storage.policies (bucket_id, name, definition, check_expression)
-- VALUES (
--     'instrument-images',
--     'Public Read Access',
--     'bucket_id = ''instrument-images''',
--     null
-- );

-- Storage bucket creation (run via Supabase Dashboard or API):
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create bucket named: instrument-images
-- 3. Make it public (allow public access for read operations)
-- 4. For uploads, restrict to authenticated or service role only
