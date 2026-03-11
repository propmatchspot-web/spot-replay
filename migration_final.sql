-- ═══════════════════════════════════════════════════════════════
-- SPOT REPLAY — SAFE MIGRATION FOR PROPMATCHSPOT SUPABASE
-- Run this in Supabase SQL Editor. All statements are idempotent.
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- 1. USERS TABLE (Extends Supabase Auth)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  username text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  settings jsonb DEFAULT '{"theme": "dark", "currency": "USD", "timezone": "UTC", "risk_per_trade": 1}'::jsonb,
  subscription_tier text DEFAULT 'free'
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admin Full Access Users" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Add subscription-related columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'SPOT_BASIC';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ai_daily_limit integer DEFAULT 1;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ai_usage_today integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_usage_date date DEFAULT CURRENT_DATE;

-- ═══════════════════════════════════════════════════════════════
-- 2. PROFILES TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name text,
  phone_number text,
  updated_at timestamptz,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trading_preferences jsonb DEFAULT '{"default_risk": 1, "default_pair": "EURUSD", "theme": "dark"}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- ═══════════════════════════════════════════════════════════════
-- 3. ACCOUNTS TABLE (Portfolios)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  initial_balance numeric NOT NULL DEFAULT 0,
  current_balance numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.accounts;
CREATE POLICY "Users can view their own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- Account detail columns
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS type text DEFAULT 'LIVE';
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS prop_firm text;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS challenge_type text;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS program_type text;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS program_details jsonb;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS daily_drawdown_limit numeric;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS max_drawdown_limit numeric;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS profit_target numeric;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS consistency_rule boolean DEFAULT false;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS consistency_score numeric;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS daily_drawdown_type text DEFAULT 'STATIC';
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS max_drawdown_type text DEFAULT 'STATIC';
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS high_water_mark numeric DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════
-- 4. STRATEGIES TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.strategies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  rules jsonb DEFAULT '[]'::jsonb,
  timeframes text[] DEFAULT '{}',
  pairs text[] DEFAULT '{}',
  sessions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can insert their own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can update their own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can delete their own strategies" ON public.strategies;
CREATE POLICY "Users can view their own strategies" ON public.strategies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own strategies" ON public.strategies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own strategies" ON public.strategies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own strategies" ON public.strategies FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- 5. STRATEGY EXAMPLES TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.strategy_examples (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id uuid REFERENCES public.strategies(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.strategy_examples ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own strategy examples" ON public.strategy_examples;
DROP POLICY IF EXISTS "Users can insert their own strategy examples" ON public.strategy_examples;
DROP POLICY IF EXISTS "Users can update their own strategy examples" ON public.strategy_examples;
DROP POLICY IF EXISTS "Users can delete their own strategy examples" ON public.strategy_examples;
CREATE POLICY "Users can view their own strategy examples" ON public.strategy_examples FOR SELECT USING (EXISTS (SELECT 1 FROM public.strategies WHERE strategies.id = strategy_examples.strategy_id AND strategies.user_id = auth.uid()));
CREATE POLICY "Users can insert their own strategy examples" ON public.strategy_examples FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.strategies WHERE strategies.id = strategy_examples.strategy_id AND strategies.user_id = auth.uid()));
CREATE POLICY "Users can update their own strategy examples" ON public.strategy_examples FOR UPDATE USING (EXISTS (SELECT 1 FROM public.strategies WHERE strategies.id = strategy_examples.strategy_id AND strategies.user_id = auth.uid()));
CREATE POLICY "Users can delete their own strategy examples" ON public.strategy_examples FOR DELETE USING (EXISTS (SELECT 1 FROM public.strategies WHERE strategies.id = strategy_examples.strategy_id AND strategies.user_id = auth.uid()));

-- ═══════════════════════════════════════════════════════════════
-- 6. TRADES TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.trades (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  pair text NOT NULL,
  direction text,
  entry_price numeric,
  exit_price numeric,
  size numeric,
  pnl numeric,
  pnl_percentage numeric,
  open_time timestamptz,
  close_time timestamptz,
  setup_type text,
  notes text,
  screenshot_entry_url text,
  screenshot_exit_url text,
  mae numeric,
  mfe numeric,
  status text DEFAULT 'OPEN',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can insert their own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can update their own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can delete their own trades" ON public.trades;
CREATE POLICY "Users can view their own trades" ON public.trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trades" ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trades" ON public.trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own trades" ON public.trades FOR DELETE USING (auth.uid() = user_id);

-- Trade detail columns
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS stop_loss numeric;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS take_profit numeric;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS rr numeric;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS closing_reason text;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS strategy_id uuid REFERENCES public.strategies(id) ON DELETE SET NULL;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS mode text DEFAULT 'Live';
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS timeframe text;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS risk_amount numeric;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS risk_percentage numeric;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS backtest_session_id uuid;

-- ═══════════════════════════════════════════════════════════════
-- 7. TAGS TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  trade_id uuid REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text DEFAULT 'manual',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can insert their own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can delete their own tags" ON public.tags;
CREATE POLICY "Users can view their own tags" ON public.tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tags" ON public.tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tags" ON public.tags FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- 8. SESSIONS TABLE (Analytics)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  trade_id uuid REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  session_name text,
  day_of_week text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
CREATE POLICY "Users can view their own sessions" ON public.sessions FOR SELECT USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- 9. AI REPORTS TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ai_reports (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  trade_id uuid REFERENCES public.trades(id) ON DELETE CASCADE,
  report_content text,
  content jsonb,
  rating integer,
  type text DEFAULT 'trade_review',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own ai reports" ON public.ai_reports;
DROP POLICY IF EXISTS "Users can insert their own ai reports" ON public.ai_reports;
DROP POLICY IF EXISTS "Users can delete their own ai reports" ON public.ai_reports;
CREATE POLICY "Users can view their own ai reports" ON public.ai_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ai reports" ON public.ai_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ai reports" ON public.ai_reports FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- 10. JOURNAL ENTRIES TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  content text,
  mood text,
  rating integer,
  emotions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON public.journal_entries;
CREATE POLICY "Users can view their own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- 11. ACHIEVEMENTS TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_code text NOT NULL,
  title text,
  description text,
  unlocked_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.achievements;
CREATE POLICY "Users can view their own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_badge_code ON public.achievements(badge_code);

-- ═══════════════════════════════════════════════════════════════
-- 12. BACKTEST SESSIONS TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.backtest_sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  session_type text DEFAULT 'BACKTEST',
  initial_balance decimal(15, 2) NOT NULL,
  current_balance decimal(15, 2) NOT NULL,
  pair text NOT NULL,
  chart_layout text DEFAULT 'default',
  strategy_id uuid,
  start_date timestamptz,
  end_date timestamptz,
  timezone text DEFAULT 'UTC',
  last_replay_candle_time timestamptz,
  candle_data jsonb,
  timeframe text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);
ALTER TABLE public.backtest_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own backtest sessions" ON public.backtest_sessions;
DROP POLICY IF EXISTS "Users can insert their own backtest sessions" ON public.backtest_sessions;
DROP POLICY IF EXISTS "Users can update their own backtest sessions" ON public.backtest_sessions;
DROP POLICY IF EXISTS "Users can delete their own backtest sessions" ON public.backtest_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.backtest_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.backtest_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.backtest_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.backtest_sessions;
CREATE POLICY "Users can view their own backtest sessions" ON public.backtest_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own backtest sessions" ON public.backtest_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own backtest sessions" ON public.backtest_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own backtest sessions" ON public.backtest_sessions FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_backtest_sessions_user_id ON public.backtest_sessions(user_id);

-- ═══════════════════════════════════════════════════════════════
-- 13. BACKTEST TRADES TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.backtest_trades (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  backtest_session_id uuid REFERENCES public.backtest_sessions(id) ON DELETE CASCADE NOT NULL,
  pair text NOT NULL,
  type text NOT NULL,
  entry_price decimal(15, 5) NOT NULL,
  exit_price decimal(15, 5) NOT NULL,
  size decimal(15, 2) NOT NULL,
  pnl decimal(15, 2) NOT NULL,
  entry_date timestamptz NOT NULL,
  exit_date timestamptz NOT NULL,
  strategy_id uuid,
  created_at timestamptz DEFAULT NOW()
);
ALTER TABLE public.backtest_trades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own backtest trades" ON public.backtest_trades;
DROP POLICY IF EXISTS "Users can insert their own backtest trades" ON public.backtest_trades;
DROP POLICY IF EXISTS "Users can update their own backtest trades" ON public.backtest_trades;
DROP POLICY IF EXISTS "Users can delete their own backtest trades" ON public.backtest_trades;
CREATE POLICY "Users can view their own backtest trades" ON public.backtest_trades FOR SELECT USING (EXISTS (SELECT 1 FROM public.backtest_sessions WHERE id = backtest_trades.backtest_session_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert their own backtest trades" ON public.backtest_trades FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.backtest_sessions WHERE id = backtest_trades.backtest_session_id AND user_id = auth.uid()));
CREATE POLICY "Users can update their own backtest trades" ON public.backtest_trades FOR UPDATE USING (EXISTS (SELECT 1 FROM public.backtest_sessions WHERE id = backtest_trades.backtest_session_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete their own backtest trades" ON public.backtest_trades FOR DELETE USING (EXISTS (SELECT 1 FROM public.backtest_sessions WHERE id = backtest_trades.backtest_session_id AND user_id = auth.uid()));

-- ═══════════════════════════════════════════════════════════════
-- 14. DAILY PLANS TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  market_bias text,
  key_levels jsonb DEFAULT '[]'::jsonb,
  game_plan text,
  risk_budget numeric,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own daily plans" ON public.daily_plans;
CREATE POLICY "Users can manage their own daily plans" ON public.daily_plans FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- 15. PLANS TABLE (Pricing)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.plans (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  price_monthly decimal(10, 2) NOT NULL,
  price_yearly decimal(10, 2) NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Active Plans" ON public.plans;
CREATE POLICY "Public Read Active Plans" ON public.plans FOR SELECT USING (is_active = true);

ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS ls_variant_id_monthly text;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS ls_variant_id_yearly text;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS coinbase_price_id_monthly text;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS coinbase_price_id_yearly text;

-- Seed Spot Replay Plans (2 plans only)
INSERT INTO public.plans (name, price_monthly, price_yearly, features, limits) VALUES
('SPOT_BASIC', 0, 0, '["Up to 1 year of backtest data", "1 live session at a time", "TradingView charts", "Order management (SL/TP)", "Speed controls (1x-10x)", "Basic analytics"]', '{"max_sessions": 1, "max_data_years": 1, "max_speed": 10}'),
('SPOT_EXCLUSIVE', 99, 990, '["Unlimited historical data", "Unlimited live sessions", "TradingView charts", "Order management (SL/TP)", "Speed controls (1x-50x)", "Advanced analytics & P&L curves", "Prop Firm simulation mode", "Priority data loading", "Early access to new features"]', '{"max_sessions": -1, "max_data_years": -1, "max_speed": 50}')
ON CONFLICT (name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 16. COUPONS TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL,
  discount_value decimal(10, 2) NOT NULL,
  max_uses integer,
  used_count integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Coupons" ON public.coupons;
CREATE POLICY "Public Read Coupons" ON public.coupons FOR SELECT USING (is_active = true);

-- ═══════════════════════════════════════════════════════════════
-- 17. ADMIN LOGS TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- 18. AFFILIATE SYSTEM TABLES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.affiliates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  commission_rate decimal(5,2) DEFAULT 30.00,
  total_earnings decimal(10,2) DEFAULT 0,
  total_referrals integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own affiliate" ON public.affiliates;
DROP POLICY IF EXISTS "Users can insert own affiliate" ON public.affiliates;
CREATE POLICY "Users can view own affiliate" ON public.affiliates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own affiliate" ON public.affiliates FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Affiliates can view own referrals" ON public.referrals;
CREATE POLICY "Affiliates can view own referrals" ON public.referrals FOR SELECT USING (EXISTS (SELECT 1 FROM public.affiliates WHERE id = referrals.affiliate_id AND user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  payment_method text,
  payment_details jsonb,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Affiliates can view own payouts" ON public.affiliate_payouts;
CREATE POLICY "Affiliates can view own payouts" ON public.affiliate_payouts FOR SELECT USING (EXISTS (SELECT 1 FROM public.affiliates WHERE id = affiliate_payouts.affiliate_id AND user_id = auth.uid()));

-- ═══════════════════════════════════════════════════════════════
-- 19. SUBSCRIPTION COLUMNS ON USERS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ls_customer_id text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ls_subscription_id text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_plan text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_interval text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS guardian_settings jsonb DEFAULT '{"enabled": false}'::jsonb;

-- ═══════════════════════════════════════════════════════════════
-- 20. TRIGGER — Auto-create user profile on signup
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.profiles (id, full_name, phone_number)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone_number')
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- 21. INDEXES
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_users_plan_tier ON public.users(plan_tier);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON public.trades(account_id);

-- ═══════════════════════════════════════════════════════════════
-- 22. BACKFILL — Ensure existing auth users have entries
-- ═══════════════════════════════════════════════════════════════
INSERT INTO public.users (id, email, username)
SELECT id, email, raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- DONE! All tables created with RLS policies.
-- ═══════════════════════════════════════════════════════════════
