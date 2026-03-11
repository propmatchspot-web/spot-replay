-- Add strategy_id to trades table
alter table public.trades 
add column if not exists strategy_id uuid references public.strategies(id) on delete set null;

-- Index for performance
create index if not exists trades_strategy_id_idx on public.trades(strategy_id);
