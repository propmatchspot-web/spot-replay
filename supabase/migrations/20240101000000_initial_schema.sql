-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS (Extends Supabase Auth)
create table public.users (
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
create table public.accounts (
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
create table public.trades (
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
create table public.tags (
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
create table public.sessions (
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
create table public.ai_reports (
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
create table public.daily_journal (
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
create table public.achievements (
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
