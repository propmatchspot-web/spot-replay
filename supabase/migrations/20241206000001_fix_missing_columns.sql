-- Comprehensive Schema Fix for Trades Table
-- Adds all identified missing columns from code usage

-- 1. OUTCOME (WIN, LOSS, BE)
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS outcome text CHECK (outcome IN ('WIN', 'LOSS', 'BE'));

-- 2. RISK TO REWARD (rr)
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS rr numeric;

-- 3. SESSION (London, New York, etc.)
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS session text;

-- 4. STOP LOSS & TAKE PROFIT
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS stop_loss numeric,
ADD COLUMN IF NOT EXISTS take_profit numeric;

-- 5. CLOSING REASON
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS closing_reason text;

-- 6. STRATEGY ID (Foreign Key)
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS strategy_id uuid REFERENCES public.strategies(id) ON DELETE SET NULL;

-- 7. COMMISSIONS & FEES (Proactive add, commonly used though not explicitly seen in snippets but good for future proofing)
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS commission numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS fees numeric DEFAULT 0;

-- Backfill 'outcome' based on PnL for existing closed trades
UPDATE public.trades 
SET outcome = CASE 
    WHEN pnl > 0 THEN 'WIN'
    WHEN pnl < 0 THEN 'LOSS'
    ELSE 'BE'
END
WHERE outcome IS NULL AND status = 'CLOSED';
