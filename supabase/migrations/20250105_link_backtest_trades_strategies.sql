-- Add strategy_id to backtest_trades table
alter table public.backtest_trades 
add column if not exists strategy_id uuid references public.strategies(id) on delete set null;

-- Index for performance
create index if not exists backtest_trades_strategy_id_idx on public.backtest_trades(strategy_id);
