-- Add drawdown type columns to accounts table
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS daily_drawdown_type TEXT DEFAULT 'STATIC' CHECK (daily_drawdown_type IN ('STATIC', 'TRAILING')),
ADD COLUMN IF NOT EXISTS max_drawdown_type TEXT DEFAULT 'STATIC' CHECK (max_drawdown_type IN ('STATIC', 'TRAILING')),
ADD COLUMN IF NOT EXISTS high_water_mark NUMERIC DEFAULT 0;

-- Update high_water_mark to be at least initial_balance for existing accounts
UPDATE public.accounts 
SET high_water_mark = initial_balance 
WHERE high_water_mark < initial_balance OR high_water_mark IS NULL;
