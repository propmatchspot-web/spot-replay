-- ═══════════════════════════════════════════════════════════════════════════
-- SPOT REPLAY — 2 Plans Only: SPOT_BASIC (Free) & SPOT_EXCLUSIVE ($39/mo)
-- Run this in Supabase SQL Editor to clean up old Tradal plans
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Step 1: Ensure plan_tier column is TEXT (not enum) ──────────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'plan_tier'
        AND data_type != 'text'
    ) THEN
        ALTER TABLE users ALTER COLUMN plan_tier DROP DEFAULT;
        ALTER TABLE users ALTER COLUMN plan_tier TYPE text USING plan_tier::text;
    END IF;
END $$;

-- Ensure the column exists (fresh install)
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'SPOT_BASIC';

-- ─── Step 2: Migrate old plan tiers to new names ────────────────────────
-- Map all old Tradal tiers → SPOT_BASIC (free users)
UPDATE users SET plan_tier = 'SPOT_BASIC' WHERE plan_tier IN ('FREE', 'STARTER');
-- Map all old paid Tradal tiers → SPOT_EXCLUSIVE
UPDATE users SET plan_tier = 'SPOT_EXCLUSIVE' WHERE plan_tier IN ('GROWTH', 'ENTERPRISE', 'PROFESSIONAL', 'ELITE');
-- Catch any NULLs
UPDATE users SET plan_tier = 'SPOT_BASIC' WHERE plan_tier IS NULL;

-- ─── Step 3: Update CHECK constraint to only allow 2 plans ─────────────
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_plan_tier;
ALTER TABLE users ADD CONSTRAINT valid_plan_tier 
    CHECK (plan_tier IN ('SPOT_BASIC', 'SPOT_EXCLUSIVE'));

-- Set new default
ALTER TABLE users ALTER COLUMN plan_tier SET DEFAULT 'SPOT_BASIC';

-- ─── Step 4: Ensure required user columns exist ─────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemon_squeezy_variant_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS renews_at timestamp with time zone;

-- ─── Step 5: Clean up the plans table (if it exists) ────────────────────
-- Delete ALL old Tradal plans
DELETE FROM plans WHERE name IN ('FREE', 'STARTER', 'GROWTH', 'ENTERPRISE', 'PROFESSIONAL', 'ELITE');

-- Insert only 2 Spot Replay plans
INSERT INTO plans (name, price_monthly, price_yearly, features, limits)
VALUES (
    'SPOT_BASIC',
    0,
    0,
    '[
        "Up to 1 year of backtest data",
        "1 live session at a time",
        "TradingView charts",
        "Order management (SL/TP)",
        "Speed controls (1x-10x)",
        "Basic analytics"
    ]'::jsonb,
    '{
        "backtest_years": 1,
        "backtest_sessions": 2,
        "max_speed": 10,
        "api_access": false
    }'::jsonb
) ON CONFLICT (name) DO UPDATE SET
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits;

INSERT INTO plans (name, price_monthly, price_yearly, features, limits)
VALUES (
    'SPOT_EXCLUSIVE',
    39,
    0,
    '[
        "Unlimited historical data (all years)",
        "Unlimited live sessions",
        "TradingView charts",
        "Order management (SL/TP)",
        "Speed controls (1x-50x)",
        "Advanced analytics & P&L curves",
        "Prop Firm simulation mode",
        "Priority data loading",
        "Early access to new features"
    ]'::jsonb,
    '{
        "backtest_years": 99,
        "backtest_sessions": 999,
        "max_speed": 50,
        "api_access": true
    }'::jsonb
) ON CONFLICT (name) DO UPDATE SET
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits;

-- ─── Step 6: Update backtest session limits for free users ──────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS backtest_count_limit integer DEFAULT 2;

-- Set limits based on current plan
UPDATE users SET backtest_count_limit = 2  WHERE plan_tier = 'SPOT_BASIC';
UPDATE users SET backtest_count_limit = 999 WHERE plan_tier = 'SPOT_EXCLUSIVE';

-- ─── Step 7: Indexes for performance ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_plan_tier ON users(plan_tier);
CREATE INDEX IF NOT EXISTS idx_users_ls_subscription_id ON users(lemon_squeezy_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_ls_customer_id ON users(lemon_squeezy_customer_id);

-- ─── Step 8: RLS Policies ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users 
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users 
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own data" ON users;
CREATE POLICY "Users can insert their own data" ON users 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant access
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE! Your Supabase now only has:
--   • SPOT_BASIC  → Free forever ($0/month)
--   • SPOT_EXCLUSIVE → $39/month (LemonSqueezy Product 881505, Variant 1387788)
-- ═══════════════════════════════════════════════════════════════════════════
