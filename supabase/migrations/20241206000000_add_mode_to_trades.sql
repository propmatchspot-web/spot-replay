-- Add 'mode' column to trades table
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS mode text DEFAULT 'Live' CHECK (mode IN ('Live', 'Paper', 'Backtest'));

-- Update existing rows to have a default mode of 'Live' if they are null (though default above handles new ones, this is for safety on existing data if default wasn't applied retrospectively by the engine, which standard SQL ADD COLUMN DEFAULT does, but good to be sure)
UPDATE public.trades SET mode = 'Live' WHERE mode IS NULL;
