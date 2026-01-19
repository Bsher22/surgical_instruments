-- ============================================================================
-- Migration: Add Subscription Fields
-- Description: Adds Stripe subscription fields to users table and creates
--              subscription_events table for webhook event tracking.
-- ============================================================================

-- ============================================================================
-- Step 1: Add subscription columns to users table
-- ============================================================================

-- Stripe customer ID (for linking to Stripe customer)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Stripe subscription ID (for active subscription reference)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- Subscription tier (free/premium)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free' NOT NULL;

-- Subscription status (active/inactive/past_due/canceled/trialing)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive' NOT NULL;

-- When the subscription expires
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Create indexes for subscription fields
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id 
ON users(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id 
ON users(stripe_subscription_id) 
WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_subscription_tier 
ON users(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_users_subscription_status 
ON users(subscription_status);

-- ============================================================================
-- Step 2: Create subscription_events table
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    stripe_event_id VARCHAR(255) UNIQUE,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for subscription_events
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id 
ON subscription_events(user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_events_stripe_event_id 
ON subscription_events(stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type 
ON subscription_events(event_type);

CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at 
ON subscription_events(created_at DESC);

-- ============================================================================
-- Step 3: Add check constraints
-- ============================================================================

-- Ensure subscription_tier is valid
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS check_subscription_tier;

ALTER TABLE users 
ADD CONSTRAINT check_subscription_tier 
CHECK (subscription_tier IN ('free', 'premium'));

-- Ensure subscription_status is valid
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS check_subscription_status;

ALTER TABLE users 
ADD CONSTRAINT check_subscription_status 
CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing'));

-- ============================================================================
-- Step 4: Create helper function for checking premium status
-- ============================================================================

CREATE OR REPLACE FUNCTION is_user_premium(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_record RECORD;
BEGIN
    SELECT subscription_tier, subscription_status, subscription_expires_at
    INTO user_record
    FROM users
    WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check tier
    IF user_record.subscription_tier != 'premium' THEN
        RETURN FALSE;
    END IF;
    
    -- Check status
    IF user_record.subscription_status NOT IN ('active', 'trialing') THEN
        RETURN FALSE;
    END IF;
    
    -- Check expiration
    IF user_record.subscription_expires_at IS NOT NULL 
       AND user_record.subscription_expires_at < NOW() THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Step 5: Update RLS policies (if using Supabase)
-- ============================================================================

-- Users can only see their own subscription events
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription events" ON subscription_events;
CREATE POLICY "Users can view own subscription events" ON subscription_events
    FOR SELECT
    USING (auth.uid()::text = user_id::text);

-- Only service role can insert/update subscription events (from webhooks)
DROP POLICY IF EXISTS "Service role can manage subscription events" ON subscription_events;
CREATE POLICY "Service role can manage subscription events" ON subscription_events
    FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================================
-- Rollback Script (if needed)
-- ============================================================================
/*
-- To rollback this migration:

DROP TABLE IF EXISTS subscription_events;

ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE users DROP COLUMN IF EXISTS stripe_subscription_id;
ALTER TABLE users DROP COLUMN IF EXISTS subscription_tier;
ALTER TABLE users DROP COLUMN IF EXISTS subscription_status;
ALTER TABLE users DROP COLUMN IF EXISTS subscription_expires_at;

DROP FUNCTION IF EXISTS is_user_premium(UUID);
*/

-- ============================================================================
-- Verification
-- ============================================================================

-- Check that columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN (
    'stripe_customer_id',
    'stripe_subscription_id', 
    'subscription_tier',
    'subscription_status',
    'subscription_expires_at'
);

-- Check that subscription_events table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'subscription_events'
);
