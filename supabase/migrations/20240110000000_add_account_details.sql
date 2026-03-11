-- Add missing columns to accounts table for Account Wizard

ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS type text DEFAULT 'LIVE' CHECK (type IN ('LIVE', 'FUNDED')),
ADD COLUMN IF NOT EXISTS prop_firm text,
ADD COLUMN IF NOT EXISTS challenge_type text,
ADD COLUMN IF NOT EXISTS program_type text,
ADD COLUMN IF NOT EXISTS daily_drawdown_limit numeric,
ADD COLUMN IF NOT EXISTS max_drawdown_limit numeric,
ADD COLUMN IF NOT EXISTS profit_target numeric,
ADD COLUMN IF NOT EXISTS consistency_rule boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS consistency_score numeric;

-- Add comment to document the columns
COMMENT ON COLUMN public.accounts.type IS 'Type of account: LIVE or FUNDED';
COMMENT ON COLUMN public.accounts.prop_firm IS 'Name of the prop firm (e.g., FTMO)';
COMMENT ON COLUMN public.accounts.challenge_type IS 'Phase of the challenge (PHASE_1, PHASE_2, etc.)';
