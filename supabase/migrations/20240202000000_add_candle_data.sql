-- Add candle_data column to backtest_sessions
ALTER TABLE backtest_sessions ADD COLUMN IF NOT EXISTS candle_data JSONB;
