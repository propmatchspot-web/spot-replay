-- Drop the existing table if it exists to ensure clean state (or alter it, but drop/create is cleaner for dev)
drop table if exists public.ai_reports;

create table public.ai_reports (
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
