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
