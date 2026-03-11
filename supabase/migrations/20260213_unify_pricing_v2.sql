-- Migration: Unify pricing tiers to FREE, STARTER, GROWTH, ENTERPRISE

-- 1. Updates to ENUM (Add new values)
-- PostgreSQL doesn't support "IF NOT EXISTS" for ADD VALUE inside a transaction block in some versions, 
-- but Supabase usually handles it. If it fails, run these lines separately in SQL Editor.
ALTER TYPE plan_tier_enum ADD VALUE IF NOT EXISTS 'FREE';
ALTER TYPE plan_tier_enum ADD VALUE IF NOT EXISTS 'GROWTH';
ALTER TYPE plan_tier_enum ADD VALUE IF NOT EXISTS 'ENTERPRISE';

-- 2. Update Old Plan Names to New Standard (In Users Table)
UPDATE users SET plan_tier = 'GROWTH' WHERE plan_tier = 'PROFESSIONAL';
UPDATE users SET plan_tier = 'ENTERPRISE' WHERE plan_tier = 'ELITE';
-- Note: STARTER users remain STARTER (but price changes)

-- 3. Update Plans Table (Reflecting Name & Price Changes)
-- Rename PROFESSIONAL -> GROWTH
UPDATE plans 
SET name = 'GROWTH', 
    price_monthly = 49, 
    price_yearly = 490,
    features = '["Unlimited AI Analysis", "Advanced Market Structure AI", "Psychology Coaching", "Unlimited Vision Requests", "Priority Support"]'::jsonb
WHERE name = 'PROFESSIONAL';

-- Rename ELITE -> ENTERPRISE
UPDATE plans 
SET name = 'ENTERPRISE', 
    price_monthly = 99, 
    price_yearly = 990 
WHERE name = 'ELITE';

-- Update STARTER to $29 (Was $0 or undefined)
UPDATE plans 
SET price_monthly = 29, 
    price_yearly = 290,
    features = '["Manual Journaling", "Basic Analytics", "Unlimited Trades", "No AI Analysis"]'::jsonb,
    limits = '{"trade_limit": 999999, "ai_daily_limit": 0, "backtest_years": 99, "backtest_sessions": 99, "api_access": false}'::jsonb
WHERE name = 'STARTER';

-- 4. Insert FREE Plan (New)
INSERT INTO plans (name, price_monthly, price_yearly, features, limits)
VALUES (
    'FREE', 
    0, 
    0, 
    '["30 Trades/mo", "1 Daily AI Analysis", "1 Year Backtest", "2 Backtest Sessions", "Manual Journaling"]'::jsonb,
    '{"trade_limit": 30, "ai_daily_limit": 1, "backtest_years": 1, "backtest_sessions": 2, "api_access": false}'::jsonb
) ON CONFLICT (name) DO NOTHING;
