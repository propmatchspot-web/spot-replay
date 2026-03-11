-- Add start_date and end_date to backtest_sessions
ALTER TABLE backtest_sessions 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
