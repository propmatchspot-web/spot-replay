-- Add new columns to accounts table for Advanced Account Setup

-- Create enums for better data integrity
CREATE TYPE account_type_enum AS ENUM ('LIVE', 'FUNDED');
CREATE TYPE challenge_type_enum AS ENUM ('PHASE_1', 'PHASE_2', 'PHASE_3', 'INSTANT');

ALTER TABLE accounts
ADD COLUMN type account_type_enum NOT NULL DEFAULT 'LIVE',
ADD COLUMN prop_firm text,
ADD COLUMN challenge_type challenge_type_enum,
ADD COLUMN daily_drawdown_limit numeric, -- Stored as amount (e.g., 500 for $500 limit)
ADD COLUMN max_drawdown_limit numeric,   -- Stored as amount
ADD COLUMN profit_target numeric,        -- Stored as amount
ADD COLUMN consistency_rule boolean DEFAULT false,
ADD COLUMN consistency_score numeric;

-- Add check constraint to ensure prop firm details are present if type is FUNDED
ALTER TABLE accounts
ADD CONSTRAINT funded_account_details_check
CHECK (
  (type = 'LIVE') OR
  (type = 'FUNDED' AND prop_firm IS NOT NULL AND challenge_type IS NOT NULL)
);

-- Comment on columns
COMMENT ON COLUMN accounts.type IS 'Type of account: LIVE or FUNDED';
COMMENT ON COLUMN accounts.daily_drawdown_limit IS 'Daily drawdown limit amount';
COMMENT ON COLUMN accounts.max_drawdown_limit IS 'Max drawdown limit amount';
