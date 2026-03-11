-- Add timezone to backtest_sessions
ALTER TABLE backtest_sessions 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Etc/UTC';
