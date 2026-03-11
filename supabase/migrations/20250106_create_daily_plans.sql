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
