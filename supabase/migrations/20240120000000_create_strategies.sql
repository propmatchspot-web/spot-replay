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
