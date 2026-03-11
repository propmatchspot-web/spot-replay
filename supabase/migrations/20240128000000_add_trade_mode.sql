-- Create enum for trade mode
CREATE TYPE trade_mode AS ENUM ('Live', 'Backtest', 'Paper');

-- Add trade_mode column to trades table
ALTER TABLE trades 
ADD COLUMN mode trade_mode NOT NULL DEFAULT 'Live';

-- Update RLS policies if needed (usually not needed for new columns unless specific logic applies)
-- Existing policies should cover the new column as it's part of the row.
