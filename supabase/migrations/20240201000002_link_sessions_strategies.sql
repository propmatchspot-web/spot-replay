-- Add strategy_id to backtest_sessions
ALTER TABLE public.backtest_sessions
ADD COLUMN IF NOT EXISTS strategy_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL;
