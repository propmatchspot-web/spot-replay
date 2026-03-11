-- Add missing columns to trades table
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS stop_loss numeric,
ADD COLUMN IF NOT EXISTS take_profit numeric,
ADD COLUMN IF NOT EXISTS rr numeric,
ADD COLUMN IF NOT EXISTS closing_reason text;

COMMENT ON COLUMN public.trades.rr IS 'Risk:Reward ratio';
