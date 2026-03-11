-- Create enum for program structure
CREATE TYPE program_type_enum AS ENUM ('ONE_STEP', 'TWO_STEP', 'THREE_STEP', 'INSTANT');

-- Add program_type to accounts table
ALTER TABLE accounts
ADD COLUMN program_type program_type_enum;

-- Update check constraint to include program_type for FUNDED accounts
ALTER TABLE accounts
DROP CONSTRAINT funded_account_details_check;

ALTER TABLE accounts
ADD CONSTRAINT funded_account_details_check
CHECK (
  (type = 'LIVE') OR
  (type = 'FUNDED' AND prop_firm IS NOT NULL AND challenge_type IS NOT NULL AND program_type IS NOT NULL)
);

COMMENT ON COLUMN accounts.program_type IS 'Structure of the funded program (e.g., ONE_STEP, TWO_STEP)';
