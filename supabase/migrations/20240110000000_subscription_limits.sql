-- Phase 25: Subscription & Limits
-- Adding support for 'STARTER', 'PROFESSIONAL', 'ELITE' tiers

-- 1. Create Enum for Plan Tiers
CREATE TYPE plan_tier_enum AS ENUM ('STARTER', 'PROFESSIONAL', 'ELITE');

-- 2. Add columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plan_tier plan_tier_enum DEFAULT 'STARTER',
ADD COLUMN IF NOT EXISTS ai_daily_limit INTEGER DEFAULT 1, -- Default for STARTER
ADD COLUMN IF NOT EXISTS ai_usage_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_usage_date DATE DEFAULT CURRENT_DATE;

-- 3. Create Function to auto-reset usage on new day
CREATE OR REPLACE FUNCTION check_and_reset_ai_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- If the last usage date is not today, reset usage to 0 and update date
  IF OLD.last_usage_date != CURRENT_DATE THEN
    NEW.ai_usage_today := 0;
    NEW.last_usage_date := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger to run before any update on users table (to catch stale dates)
-- Actually, a better way is to do this check in the application logic OR via a scheduled cron (pg_cron).
-- But for simplicity, we'll rely on the Application Logic (checkAILimit) to perform the reset check before incrementing.
-- However, we can add a simple trigger that ensures defaults are respected.

-- Let's just create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_plan_tier ON users(plan_tier);

-- 5. Helper Function to set limits based on plan (can be used by Admin Dashboard later)
CREATE OR REPLACE FUNCTION update_user_plan(target_email TEXT, new_plan plan_tier_enum)
RETURNS VOID AS $$
DECLARE
  new_limit INTEGER;
BEGIN
  -- Determine limit based on plan
  IF new_plan = 'STARTER' THEN
    new_limit := 1;
  ELSIF new_plan = 'PROFESSIONAL' THEN
    new_limit := 20;
  ELSIF new_plan = 'ELITE' THEN
    new_limit := 50;
  END IF;

  -- Update user
  UPDATE users 
  SET plan_tier = new_plan, 
      ai_daily_limit = new_limit 
  WHERE email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
