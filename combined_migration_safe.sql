-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS (Extends Supabase Auth)
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  username text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  settings jsonb default '{"theme": "dark", "currency": "USD", "timezone": "UTC", "risk_per_trade": 1}'::jsonb,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'enterprise'))
);
alter table public.users enable row level security;
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

-- 2. ACCOUNTS (Portfolios)
create table if not exists public.accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  initial_balance numeric not null default 0,
  current_balance numeric not null default 0,
  currency text default 'USD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.accounts enable row level security;
create policy "Users can view their own accounts" on public.accounts for select using (auth.uid() = user_id);
create policy "Users can insert their own accounts" on public.accounts for insert with check (auth.uid() = user_id);
create policy "Users can update their own accounts" on public.accounts for update using (auth.uid() = user_id);
create policy "Users can delete their own accounts" on public.accounts for delete using (auth.uid() = user_id);

-- 3. TRADES
create table if not exists public.trades (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.accounts(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null, -- Denormalized for easier RLS
  pair text not null,
  direction text check (direction in ('LONG', 'SHORT')),
  entry_price numeric,
  exit_price numeric,
  size numeric,
  pnl numeric,
  pnl_percentage numeric,
  open_time timestamp with time zone,
  close_time timestamp with time zone,
  setup_type text,
  notes text,
  screenshot_entry_url text,
  screenshot_exit_url text,
  mae numeric,
  mfe numeric,
  status text default 'OPEN' check (status in ('OPEN', 'CLOSED', 'BE')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.trades enable row level security;
create policy "Users can view their own trades" on public.trades for select using (auth.uid() = user_id);
create policy "Users can insert their own trades" on public.trades for insert with check (auth.uid() = user_id);
create policy "Users can update their own trades" on public.trades for update using (auth.uid() = user_id);
create policy "Users can delete their own trades" on public.trades for delete using (auth.uid() = user_id);

-- 4. TAGS
create table if not exists public.tags (
  id uuid default uuid_generate_v4() primary key,
  trade_id uuid references public.trades(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  type text default 'manual' check (type in ('manual', 'ai_generated')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.tags enable row level security;
create policy "Users can view their own tags" on public.tags for select using (auth.uid() = user_id);
create policy "Users can insert their own tags" on public.tags for insert with check (auth.uid() = user_id);
create policy "Users can delete their own tags" on public.tags for delete using (auth.uid() = user_id);

-- 5. SESSIONS (Analytics Cache)
create table if not exists public.sessions (
  id uuid default uuid_generate_v4() primary key,
  trade_id uuid references public.trades(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  session_name text check (session_name in ('ASIA', 'LONDON', 'NY')),
  day_of_week text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.sessions enable row level security;
create policy "Users can view their own sessions" on public.sessions for select using (auth.uid() = user_id);

-- 6. AI REPORTS
create table if not exists public.ai_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type text check (type in ('trade_review', 'daily_summary', 'pattern_alert')),
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.ai_reports enable row level security;
create policy "Users can view their own ai reports" on public.ai_reports for select using (auth.uid() = user_id);
create policy "Users can insert their own ai reports" on public.ai_reports for insert with check (auth.uid() = user_id);

-- 7. DAILY JOURNAL
create table if not exists public.daily_journal (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  mood text,
  notes text,
  rating integer check (rating >= 1 and rating <= 10),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.daily_journal enable row level security;
create policy "Users can view their own journals" on public.daily_journal for select using (auth.uid() = user_id);
create policy "Users can insert their own journals" on public.daily_journal for insert with check (auth.uid() = user_id);
create policy "Users can update their own journals" on public.daily_journal for update using (auth.uid() = user_id);

-- 8. ACHIEVEMENTS
create table if not exists public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  badge_code text not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.achievements enable row level security;
create policy "Users can view their own achievements" on public.achievements for select using (auth.uid() = user_id);

-- Trigger to create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, username)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- Add new columns to accounts table for Advanced Account Setup

-- Create enums for better data integrity
CREATE TYPE account_type_enum AS ENUM ('LIVE', 'FUNDED');
CREATE TYPE challenge_type_enum AS ENUM ('PHASE_1', 'PHASE_2', 'PHASE_3', 'INSTANT');

ALTER TABLE accounts
ADD COLUMN type account_type_enum NOT NULL DEFAULT 'LIVE',
ADD COLUMN prop_firm text,
ADD COLUMN challenge_type challenge_type_enum,
ADD COLUMN daily_drawdown_limit numeric, -- Stored as amount (e.g., 500 for $500 limit)
ADD COLUMN max_drawdown_limit numeric,   -- Stored as amount
ADD COLUMN profit_target numeric,        -- Stored as amount
ADD COLUMN consistency_rule boolean DEFAULT false,
ADD COLUMN consistency_score numeric;

-- Add check constraint to ensure prop firm details are present if type is FUNDED
ALTER TABLE accounts
ADD CONSTRAINT funded_account_details_check
CHECK (
  (type = 'LIVE') OR
  (type = 'FUNDED' AND prop_firm IS NOT NULL AND challenge_type IS NOT NULL)
);

-- Comment on columns
COMMENT ON COLUMN accounts.type IS 'Type of account: LIVE or FUNDED';
COMMENT ON COLUMN accounts.daily_drawdown_limit IS 'Daily drawdown limit amount';
COMMENT ON COLUMN accounts.max_drawdown_limit IS 'Max drawdown limit amount';
-- Create enum for program structure
CREATE TYPE program_type_enum AS ENUM ('ONE_STEP', 'TWO_STEP', 'THREE_STEP', 'INSTANT');

-- Add program_type to accounts table
ALTER TABLE accounts
ADD COLUMN program_type program_type_enum;

-- Update check constraint to include program_type for FUNDED accounts
ALTER TABLE accounts
DROP CONSTRAINT funded_account_details_check;

ALTER TABLE accounts
ADD CONSTRAINT funded_account_details_check
CHECK (
  (type = 'LIVE') OR
  (type = 'FUNDED' AND prop_firm IS NOT NULL AND challenge_type IS NOT NULL AND program_type IS NOT NULL)
);

COMMENT ON COLUMN accounts.program_type IS 'Structure of the funded program (e.g., ONE_STEP, TWO_STEP)';
-- Add program_details column to store multi-phase rules (JSON)
ALTER TABLE accounts
ADD COLUMN program_details JSONB;

COMMENT ON COLUMN accounts.program_details IS 'Stores configuration for all phases (e.g., { phase1: { dd: 5, pt: 10 }, phase2: { ... } })';
-- Create a table for public profiles
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name text,
  phone_number text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone_number');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
create table if not exists public.journal_entries (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content text,
  mood text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id),
  unique (user_id, date)
);

alter table public.journal_entries enable row level security;

create policy "Users can view their own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own journal entries"
  on public.journal_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trading_preferences JSONB DEFAULT '{"default_risk": 1, "default_pair": "EURUSD", "theme": "dark"}'::jsonb;
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS location text;
-- Add new columns for detailed trade logging
alter table public.trades
add column if not exists stop_loss numeric,
add column if not exists take_profit numeric,
add column if not exists rr numeric,
add column if not exists closing_reason text check (closing_reason in ('TP', 'SL', 'BE', 'MANUAL'));

-- Update RLS policies if needed (existing ones should cover new columns automatically as they apply to the row)
-- Fix Journal Schema to match Application Code

-- 1. Rename table if it exists as daily_journal
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_journal') THEN
    ALTER TABLE public.daily_journal RENAME TO journal_entries;
  END IF;
END $$;

-- 2. Create table if it doesn't exist (in case daily_journal didn't exist)
create table if not exists public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  mood text,
  content text, -- Renamed from notes
  rating integer check (rating >= 1 and rating <= 10),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Handle column renaming if we renamed the table
DO $$
BEGIN
  -- If 'notes' column exists, rename it to 'content'
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'notes') THEN
    ALTER TABLE public.journal_entries RENAME COLUMN notes TO content;
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'updated_at') THEN
    ALTER TABLE public.journal_entries ADD COLUMN updated_at timestamp with time zone default timezone('utc'::text, now());
  END IF;
END $$;

-- 4. Enable RLS
alter table public.journal_entries enable row level security;

-- 5. Recreate Policies (Drop old ones first to avoid conflicts if names match)
DROP POLICY IF EXISTS "Users can view their own journals" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journals" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update their own journals" ON public.journal_entries;

DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;

CREATE POLICY "Users can view their own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);

-- 6. Add unique constraint to prevent duplicate entries for same day
ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_user_id_date_key;
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_user_id_date_key UNIQUE (user_id, date);
-- Add missing columns to accounts table for Account Wizard

ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS type text DEFAULT 'LIVE' CHECK (type IN ('LIVE', 'FUNDED')),
ADD COLUMN IF NOT EXISTS prop_firm text,
ADD COLUMN IF NOT EXISTS challenge_type text,
ADD COLUMN IF NOT EXISTS program_type text,
ADD COLUMN IF NOT EXISTS daily_drawdown_limit numeric,
ADD COLUMN IF NOT EXISTS max_drawdown_limit numeric,
ADD COLUMN IF NOT EXISTS profit_target numeric,
ADD COLUMN IF NOT EXISTS consistency_rule boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS consistency_score numeric;

-- Add comment to document the columns
COMMENT ON COLUMN public.accounts.type IS 'Type of account: LIVE or FUNDED';
COMMENT ON COLUMN public.accounts.prop_firm IS 'Name of the prop firm (e.g., FTMO)';
COMMENT ON COLUMN public.accounts.challenge_type IS 'Phase of the challenge (PHASE_1, PHASE_2, etc.)';
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

-- 1. Create PLANS table (Dynamic Pricing)
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- 'STARTER', 'PROFESSIONAL', 'ELITE'
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb, -- Store list of features dynamically
    limits JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "ai_daily_limit": 20 }
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Initial Plans
INSERT INTO plans (name, price_monthly, price_yearly, features, limits) VALUES
('STARTER', 0, 0, '["Basic Journaling", "3 AI Analysis / Day", "Standard Analytics", "Community Access"]', '{"ai_daily_limit": 3, "vision_limit": 1}'),
('PROFESSIONAL', 49, 490, '["Unlimited AI Analysis", "Advanced Market Structure AI", "Psychology Coaching", "Unlimited Vision Requests", "Priority Support"]', '{"ai_daily_limit": 1000, "vision_limit": 1000}'),
('ELITE', 99, 990, '["Everything in Pro", "Mentor Dashboard", "Team Management", "API Access", "White Label Reports"]', '{"ai_daily_limit": 10000, "vision_limit": 10000}')
ON CONFLICT (name) DO NOTHING;


-- 2. Create COUPONS table (Discounts)
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    discount_value DECIMAL(10, 2) NOT NULL,
    max_uses INTEGER DEFAULT NULL, -- NULL = Unlimited
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create ADMIN LOGS (Audit Trail)
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- 'GRANT_PLAN', 'BAN_USER', 'UPDATE_PLAN'
    target_id UUID, -- Affected User ID or Plan ID
    details JSONB, -- Context (Old Value -> New Value)
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies

-- Plans: Public can view active plans, Admin can edit
CREATE POLICY "Public Read Active Plans" ON plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin All Plans" ON plans
    FOR ALL USING (auth.email() = 'admin@email.com'); -- REPLACE WITH YOUR ACTUAL ADMIN EMAIL CHECK IN CODE OR DB

-- Coupons: Public can view active coupons (to validate), Admin can edit
CREATE POLICY "Public Read Coupons" ON coupons
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin All Coupons" ON coupons
    FOR ALL USING (auth.email() = 'admin@email.com');

-- Admin Logs: Admin Only
CREATE POLICY "Admin View Logs" ON admin_logs
    FOR SELECT USING (auth.email() = 'admin@email.com');

CREATE POLICY "Admin Insert Logs" ON admin_logs
    FOR INSERT WITH CHECK (auth.email() = 'admin@email.com');

-- Users: Update RLS to allow Admin full access to users table
-- NOTE: Existing RLS might block listing all users. We need an Admin Policy on 'users'
CREATE POLICY "Admin Full Access Users" ON users
    FOR ALL USING (auth.email() = 'admin@email.com');

-- Fix Missing Users in public.users table
-- This script backfills any users that exist in auth.users but are missing from public.users

INSERT INTO public.users (id, email, username)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- Ensure the trigger is definitely properly set up for future users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger to be safe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- Add missing columns to trades table
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS stop_loss numeric,
ADD COLUMN IF NOT EXISTS take_profit numeric,
ADD COLUMN IF NOT EXISTS rr numeric,
ADD COLUMN IF NOT EXISTS closing_reason text;

COMMENT ON COLUMN public.trades.rr IS 'Risk:Reward ratio';
-- Create achievements table if it doesn't exist
create table if not exists public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_code TEXT NOT NULL,
    title TEXT,
    description TEXT,
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
alter table public.achievements enable row level security;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.achievements;

-- Create policies
CREATE POLICY "Users can view their own achievements"
    ON public.achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
    ON public.achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_badge_code ON public.achievements(badge_code);
-- Add drawdown type columns to accounts table
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS daily_drawdown_type TEXT DEFAULT 'STATIC' CHECK (daily_drawdown_type IN ('STATIC', 'TRAILING')),
ADD COLUMN IF NOT EXISTS max_drawdown_type TEXT DEFAULT 'STATIC' CHECK (max_drawdown_type IN ('STATIC', 'TRAILING')),
ADD COLUMN IF NOT EXISTS high_water_mark NUMERIC DEFAULT 0;

-- Update high_water_mark to be at least initial_balance for existing accounts
UPDATE public.accounts 
SET high_water_mark = initial_balance 
WHERE high_water_mark < initial_balance OR high_water_mark IS NULL;
-- Drop the existing table if it exists to ensure clean state (or alter it, but drop/create is cleaner for dev)
drop table if exists public.ai_reports;

create table if not exists public.ai_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  trade_id uuid references public.trades(id) on delete cascade, -- Optional, as some reports might be general
  report_content text not null,
  rating integer,
  type text default 'trade_review',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.ai_reports enable row level security;

create policy "Users can view their own ai reports"
  on public.ai_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own ai reports"
  on public.ai_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own ai reports"
  on public.ai_reports for delete
  using (auth.uid() = user_id);
-- Create strategies table
create table if not exists public.strategies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  rules jsonb default '[]'::jsonb,
  timeframes text[] default '{}',
  pairs text[] default '{}',
  sessions text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for strategies
alter table public.strategies enable row level security;

create policy "Users can view their own strategies"
  on public.strategies for select
  using (auth.uid() = user_id);

create policy "Users can insert their own strategies"
  on public.strategies for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own strategies"
  on public.strategies for update
  using (auth.uid() = user_id);

create policy "Users can delete their own strategies"
  on public.strategies for delete
  using (auth.uid() = user_id);

-- Add strategy_id to trades table
alter table public.trades 
add column if not exists strategy_id uuid references public.strategies(id) on delete set null;
-- Create enum for trade mode
CREATE TYPE trade_mode AS ENUM ('Live', 'Backtest', 'Paper');

-- Add trade_mode column to trades table
ALTER TABLE trades 
ADD COLUMN mode trade_mode NOT NULL DEFAULT 'Live';

-- Update RLS policies if needed (usually not needed for new columns unless specific logic applies)
-- Existing policies should cover the new column as it's part of the row.
-- Create backtest_sessions table
CREATE TABLE IF NOT EXISTS backtest_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    pair TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    initial_balance DECIMAL NOT NULL,
    current_balance DECIMAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add backtest_session_id to trades table
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS backtest_session_id UUID REFERENCES backtest_sessions(id) ON DELETE CASCADE;

-- Enable RLS on backtest_sessions
ALTER TABLE backtest_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for backtest_sessions
CREATE POLICY "Users can view their own backtest sessions"
    ON backtest_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backtest sessions"
    ON backtest_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backtest sessions"
    ON backtest_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backtest sessions"
    ON backtest_sessions FOR DELETE
    USING (auth.uid() = user_id);
-- Create backtest_sessions table
CREATE TABLE IF NOT EXISTS backtest_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('BACKTEST', 'PROP_FIRM')),
    initial_balance DECIMAL(15, 2) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL,
    pair TEXT NOT NULL, -- The asset (e.g., EURUSD)
    chart_layout TEXT, -- Optional layout preference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE backtest_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own sessions"
    ON backtest_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON backtest_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
    ON backtest_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
    ON backtest_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_backtest_sessions_user_id ON backtest_sessions(user_id);
-- Recreate backtest_sessions to ensure correct schema
DROP TABLE IF EXISTS backtest_sessions CASCADE;

CREATE TABLE backtest_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('BACKTEST', 'PROP_FIRM')),
    initial_balance DECIMAL(15, 2) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL,
    pair TEXT NOT NULL,
    chart_layout TEXT DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE backtest_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for backtest_sessions
CREATE POLICY "Users can view their own sessions" ON backtest_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sessions" ON backtest_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON backtest_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON backtest_sessions FOR DELETE USING (auth.uid() = user_id);

-- Create backtest_trades table
CREATE TABLE IF NOT EXISTS backtest_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backtest_session_id UUID REFERENCES backtest_sessions(id) ON DELETE CASCADE NOT NULL,
    pair TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('LONG', 'SHORT')),
    entry_price DECIMAL(15, 5) NOT NULL,
    exit_price DECIMAL(15, 5) NOT NULL,
    size DECIMAL(15, 2) NOT NULL,
    pnl DECIMAL(15, 2) NOT NULL,
    entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on backtest_trades
ALTER TABLE backtest_trades ENABLE ROW LEVEL SECURITY;

-- Policies for backtest_trades
CREATE POLICY "Users can view their own backtest trades" ON backtest_trades FOR SELECT USING (
    EXISTS (SELECT 1 FROM backtest_sessions WHERE id = backtest_trades.backtest_session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert their own backtest trades" ON backtest_trades FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM backtest_sessions WHERE id = backtest_trades.backtest_session_id AND user_id = auth.uid())
);
-- Create strategy_examples table
create table if not exists public.strategy_examples (
  id uuid default gen_random_uuid() primary key,
  strategy_id uuid references public.strategies(id) on delete cascade not null,
  image_url text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for strategy_examples
alter table public.strategy_examples enable row level security;

create policy "Users can view their own strategy examples"
  on public.strategy_examples for select
  using (
    exists (
      select 1 from public.strategies
      where strategies.id = strategy_examples.strategy_id
      and strategies.user_id = auth.uid()
    )
  );

create policy "Users can insert their own strategy examples"
  on public.strategy_examples for insert
  with check (
    exists (
      select 1 from public.strategies
      where strategies.id = strategy_examples.strategy_id
      and strategies.user_id = auth.uid()
    )
  );

create policy "Users can update their own strategy examples"
  on public.strategy_examples for update
  using (
    exists (
      select 1 from public.strategies
      where strategies.id = strategy_examples.strategy_id
      and strategies.user_id = auth.uid()
    )
  );

create policy "Users can delete their own strategy examples"
  on public.strategy_examples for delete
  using (
    exists (
      select 1 from public.strategies
      where strategies.id = strategy_examples.strategy_id
      and strategies.user_id = auth.uid()
    )
  );
-- Add emotions column to journal_entries
alter table public.journal_entries 
add column if not exists emotions text[] default '{}';
-- Add strategy_id to backtest_sessions
ALTER TABLE public.backtest_sessions
ADD COLUMN IF NOT EXISTS strategy_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL;
-- Add start_date and end_date to backtest_sessions
ALTER TABLE backtest_sessions 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
-- Add timezone to backtest_sessions
ALTER TABLE backtest_sessions 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Etc/UTC';
ALTER TABLE backtest_sessions 
ADD COLUMN IF NOT EXISTS last_replay_time BIGINT;
-- Add candle_data column to backtest_sessions
ALTER TABLE backtest_sessions ADD COLUMN IF NOT EXISTS candle_data JSONB;
-- Add columns for Prop Firm Simulator
ALTER TABLE backtest_sessions 
ADD COLUMN IF NOT EXISTS challenge_rules JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS challenge_status JSONB DEFAULT NULL;

-- Comment on columns
COMMENT ON COLUMN backtest_sessions.challenge_rules IS 'Stores rules like max_drawdown, profit_target, etc.';
COMMENT ON COLUMN backtest_sessions.challenge_status IS 'Stores current state: ACTIVE, PASSED, FAILED, and failure reason.';
-- Add 'mode' column to trades table
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS mode text DEFAULT 'Live' CHECK (mode IN ('Live', 'Paper', 'Backtest'));

-- Update existing rows to have a default mode of 'Live' if they are null (though default above handles new ones, this is for safety on existing data if default wasn't applied retrospectively by the engine, which standard SQL ADD COLUMN DEFAULT does, but good to be sure)
UPDATE public.trades SET mode = 'Live' WHERE mode IS NULL;
-- Comprehensive Schema Fix for Trades Table
-- Adds all identified missing columns from code usage

-- 1. OUTCOME (WIN, LOSS, BE)
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS outcome text CHECK (outcome IN ('WIN', 'LOSS', 'BE'));

-- 2. RISK TO REWARD (rr)
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS rr numeric;

-- 3. SESSION (London, New York, etc.)
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS session text;

-- 4. STOP LOSS & TAKE PROFIT
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS stop_loss numeric,
ADD COLUMN IF NOT EXISTS take_profit numeric;

-- 5. CLOSING REASON
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS closing_reason text;

-- 6. STRATEGY ID (Foreign Key)
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS strategy_id uuid REFERENCES public.strategies(id) ON DELETE SET NULL;

-- 7. COMMISSIONS & FEES (Proactive add, commonly used though not explicitly seen in snippets but good for future proofing)
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS commission numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS fees numeric DEFAULT 0;

-- Backfill 'outcome' based on PnL for existing closed trades
UPDATE public.trades 
SET outcome = CASE 
    WHEN pnl > 0 THEN 'WIN'
    WHEN pnl < 0 THEN 'LOSS'
    ELSE 'BE'
END
WHERE outcome IS NULL AND status = 'CLOSED';
-- Add webhook_key to users table for API authentication
alter table public.users add column if not exists webhook_key text default md5(random()::text);

-- Add unique constraint
alter table public.users add constraint users_webhook_key_key unique (webhook_key);

-- Force refresh existing users to have a key
update public.users set webhook_key = md5(random()::text) where webhook_key is null;
-- Add onboarding_completed column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to have it TRUE so they aren't locked out
UPDATE users SET onboarding_completed = TRUE;
-- Add guardian_settings column to users table
-- Structure: { "daily_loss_limit": 500, "max_daily_trades": 3, "trading_hours_start": "09:00", "trading_hours_end": "17:00", "is_enabled": true }
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_settings JSONB DEFAULT '{}'::jsonb;
-- Double check column exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_settings JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS allows update
-- We add a specific policy just in case.
DROP POLICY IF EXISTS "Users can update own guardian settings" ON users;

CREATE POLICY "Users can update own guardian settings" ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Grant access just in case
GRANT UPDATE (guardian_settings) ON users TO authenticated;
-- Add strategy_id to trades table
alter table public.trades 
add column if not exists strategy_id uuid references public.strategies(id) on delete set null;

-- Index for performance
create index if not exists trades_strategy_id_idx on public.trades(strategy_id);
-- Add strategy_id to backtest_trades table
alter table public.backtest_trades 
add column if not exists strategy_id uuid references public.strategies(id) on delete set null;

-- Index for performance
create index if not exists backtest_trades_strategy_id_idx on public.backtest_trades(strategy_id);
create table if not exists public.daily_plans (
    user_id uuid references auth.users(id) on delete cascade not null,
    date date default current_date not null,
    bias text check (bias in ('LONG', 'SHORT', 'NEUTRAL')),
    notes text,
    checklist jsonb default '{"checked": []}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    primary key (user_id, date)
);

-- Enable RLS
alter table public.daily_plans enable row level security;

-- Policies
create policy "Users can view their own daily plans"
    on public.daily_plans for select
    using (auth.uid() = user_id);

create policy "Users can upsert their own daily plans"
    on public.daily_plans for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own daily plans"
    on public.daily_plans for update
    using (auth.uid() = user_id);

-- Realtime
alter publication supabase_realtime add table public.daily_plans;
-- Create a separate table for storing large candle data blobs
-- This prevents the main sessions table from becoming too heavy
CREATE TABLE IF NOT EXISTS backtest_session_data (
    session_id UUID PRIMARY KEY REFERENCES backtest_sessions(id) ON DELETE CASCADE,
    candle_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS Policies
ALTER TABLE backtest_session_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own session data"
    ON backtest_session_data FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM backtest_sessions WHERE id = session_id
    ));

CREATE POLICY "Users can insert their own session data"
    ON backtest_session_data FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT user_id FROM backtest_sessions WHERE id = session_id
    ));

CREATE POLICY "Users can update their own session data"
    ON backtest_session_data FOR UPDATE
    USING (auth.uid() IN (
        SELECT user_id FROM backtest_sessions WHERE id = session_id
    ));
-- Fix missing DELETE/UPDATE policies for backtest related tables
-- This is required for cascading deletes to work with RLS enabled

-- 1. backtest_trades policies (add missing update/delete)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'backtest_trades' AND policyname = 'Users can update their own backtest trades'
    ) THEN
        CREATE POLICY "Users can update their own backtest trades"
            ON backtest_trades FOR UPDATE
            USING (
                EXISTS (SELECT 1 FROM backtest_sessions WHERE id = backtest_trades.backtest_session_id AND user_id = auth.uid())
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'backtest_trades' AND policyname = 'Users can delete their own backtest trades'
    ) THEN
        CREATE POLICY "Users can delete their own backtest trades"
            ON backtest_trades FOR DELETE
            USING (
                EXISTS (SELECT 1 FROM backtest_sessions WHERE id = backtest_trades.backtest_session_id AND user_id = auth.uid())
            );
    END IF;
END $$;

-- 2. backtest_session_data policies (add missing delete)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'backtest_session_data' AND policyname = 'Users can delete their own session data'
    ) THEN
        CREATE POLICY "Users can delete their own session data"
            ON backtest_session_data FOR DELETE
            USING (auth.uid() IN (
                SELECT user_id FROM backtest_sessions WHERE id = session_id
            ));
    END IF;
END $$;
-- 1. Create Affiliates Table
create table if not exists affiliates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  code text unique not null,
  commission_rate numeric default 20.0 not null,
  status text default 'pending' check (status in ('pending', 'active', 'rejected')),
  total_earnings numeric default 0 not null,
  created_at timestamptz default now() not null
);

-- 2. Create Referrals Table
create table if not exists referrals (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete set null,
  referred_user_id uuid references auth.users(id) on delete cascade unique,
  status text default 'pending' check (status in ('pending', 'converted', 'paid')),
  earnings numeric default 0 not null,
  created_at timestamptz default now() not null,
  converted_at timestamptz 
);

-- 3. Create Payouts Table
create table if not exists payouts (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete cascade not null,
  amount numeric not null,
  status text default 'pending' check (status in ('pending', 'processing', 'paid', 'failed')),
  created_at timestamptz default now() not null,
  processed_at timestamptz
);

-- 4. Create Clicks Table (for analytics)
create table if not exists affiliate_clicks (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete cascade not null,
  ip_address text, 
  user_agent text,
  referrer_url text,
  created_at timestamptz default now() not null
);

-- 5. Add referred_by to users table
alter table users add column if not exists referred_by text;

-- 6. Update handle_new_user trigger to include referred_by
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, referred_by)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'referred_by'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    referred_by = EXCLUDED.referred_by;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS Policies

-- Affiliates
alter table affiliates enable row level security;
create policy "Users can read own affiliate profile" on affiliates for select using (auth.uid() = user_id);

-- Referrals
alter table referrals enable row level security;
create policy "Affiliates can read own referrals" on referrals for select using (
  exists (select 1 from affiliates where affiliates.id = referrals.affiliate_id and affiliates.user_id = auth.uid())
);

-- Payouts
alter table payouts enable row level security;
create policy "Affiliates can read own payouts" on payouts for select using (
  exists (select 1 from affiliates where affiliates.id = payouts.affiliate_id and affiliates.user_id = auth.uid())
);

-- Clicks
alter table affiliate_clicks enable row level security;
create policy "Affiliates can read own clicks" on affiliate_clicks for select using (
  exists (select 1 from affiliates where affiliates.id = affiliate_clicks.affiliate_id and affiliates.user_id = auth.uid())
);

-- Indexes
create index if not exists idx_affiliates_user_id on affiliates(user_id);
create index if not exists idx_affiliates_code on affiliates(code);
create index if not exists idx_referrals_affiliate_id on referrals(affiliate_id);
create index if not exists idx_payouts_affiliate_id on payouts(affiliate_id);
create index if not exists idx_users_referred_by on users(referred_by);
-- Create Affiliates Table
create table if not exists affiliates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  code text unique not null,
  commission_rate numeric default 20.0 not null,
  status text default 'pending' check (status in ('pending', 'active', 'rejected')),
  total_earnings numeric default 0 not null,
  created_at timestamptz default now() not null
);

-- Create Referrals Table
create table if not exists referrals (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete set null,
  referred_user_id uuid references auth.users(id) on delete cascade unique,
  status text default 'pending' check (status in ('pending', 'converted', 'paid')),
  earnings numeric default 0 not null,
  created_at timestamptz default now() not null,
  converted_at timestamptz 
);

-- Create Payouts Table
create table if not exists payouts (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete cascade not null,
  amount numeric not null,
  status text default 'pending' check (status in ('pending', 'processing', 'paid', 'failed')),
  created_at timestamptz default now() not null,
  processed_at timestamptz
);

-- Create Clicks Table (for analytics)
create table if not exists affiliate_clicks (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete cascade not null,
  ip_address text, -- Hashed or anonymized ideally
  user_agent text,
  referrer_url text,
  created_at timestamptz default now() not null
);

-- RLS Policies

-- Affiliates: Users can read their own affiliate profile
alter table affiliates enable row level security;

create policy "Users can read own affiliate profile"
  on affiliates for select
  using (auth.uid() = user_id);

-- Referrals: Affiliates can read referrals linked to them
alter table referrals enable row level security;

create policy "Affiliates can read own referrals"
  on referrals for select
  using (
    exists (
      select 1 from affiliates
      where affiliates.id = referrals.affiliate_id
      and affiliates.user_id = auth.uid()
    )
  );

-- Payouts: Affiliates can read their own payouts
alter table payouts enable row level security;

create policy "Affiliates can read own payouts"
  on payouts for select
  using (
    exists (
      select 1 from affiliates
      where affiliates.id = payouts.affiliate_id
      and affiliates.user_id = auth.uid()
    )
  );

-- Clicks: Affiliates can read their own clicks
alter table affiliate_clicks enable row level security;

create policy "Affiliates can read own clicks"
  on affiliate_clicks for select
  using (
    exists (
      select 1 from affiliates
      where affiliates.id = affiliate_clicks.affiliate_id
      and affiliates.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index idx_affiliates_user_id on affiliates(user_id);
create index idx_affiliates_code on affiliates(code);
create index idx_referrals_affiliate_id on referrals(affiliate_id);
create index idx_referrals_referred_user_id on referrals(referred_user_id);
create index idx_payouts_affiliate_id on payouts(affiliate_id);
create index idx_clicks_affiliate_id on affiliate_clicks(affiliate_id);
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
-- Add Lemon Squeezy Subscription Columns to Users Table

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id text,
ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id text,
ADD COLUMN IF NOT EXISTS lemon_squeezy_variant_id text,
ADD COLUMN IF NOT EXISTS subscription_status text,
ADD COLUMN IF NOT EXISTS renews_at timestamp with time zone;

-- Index for faster lookups on webhook events
CREATE INDEX IF NOT EXISTS idx_users_ls_subscription_id ON public.users(lemon_squeezy_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_ls_customer_id ON public.users(lemon_squeezy_customer_id);
-- 1. Ensure Plan Tier is TEXT (Handles existing Enum conversion)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'plan_tier') THEN
         ALTER TABLE users ALTER COLUMN plan_tier DROP DEFAULT;
         ALTER TABLE users ALTER COLUMN plan_tier TYPE text USING plan_tier::text;
    END IF;
END $$;

-- 2. Add column if it doesn't exist (fresh install case)
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'FREE';

-- 3. Add strict limit columns with defaults
ALTER TABLE users ADD COLUMN IF NOT EXISTS trade_count_limit integer DEFAULT 50; -- 50 Trades (Free)
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_daily_limit integer DEFAULT 3;     -- 3 Chats (Free)
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_limit integer DEFAULT 1;    -- 1 Portfolio (Free)
ALTER TABLE users ADD COLUMN IF NOT EXISTS backtest_count_limit integer DEFAULT 3; -- 3 Backtests (Free)

-- 4. Update existing NULL users to 'FREE'
UPDATE users SET plan_tier = 'FREE' WHERE plan_tier IS NULL;

-- 5. Update Constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_plan_tier;
ALTER TABLE users ADD CONSTRAINT valid_plan_tier CHECK (plan_tier IN ('FREE', 'STARTER', 'GROWTH', 'ENTERPRISE', 'PROFESSIONAL', 'ELITE'));

-- 6. RLS Policies
DROP POLICY IF EXISTS "Users can view their own limits" ON users;
CREATE POLICY "Users can view their own limits" ON users FOR SELECT USING (auth.uid() = id);

-- 7. Grant access (optional, depending on setup)
GRANT SELECT ON users TO authenticated;
-- Updated Pricing to $19 / $29 / $59 and Add Trial Info

-- 1. Update STARTER ($19)
UPDATE plans 
SET price_monthly = 19, 
    price_yearly = 185,
    features = '["Unlimited Trades", "Basic Analytics", "3 AI Analysis / Day"]'::jsonb
WHERE name = 'STARTER';

-- 2. Update GROWTH ($29) - 7 Days Trial
UPDATE plans 
SET price_monthly = 29, 
    price_yearly = 280,
    features = '["Unlimited Auto-Sync", "Full AI Coach Access", "Prop Firm Guardian", "7-Day Free Trial"]'::jsonb
WHERE name = 'GROWTH';

-- 3. Update ENTERPRISE ($59) - 7 Days Trial
UPDATE plans 
SET price_monthly = 59, 
    price_yearly = 570,
    features = '["Multi-Account Aggregation", "Mentor Access", "API Access", "7-Day Free Trial"]'::jsonb
WHERE name = 'ENTERPRISE';

