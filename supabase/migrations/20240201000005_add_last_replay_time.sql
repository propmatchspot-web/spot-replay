ALTER TABLE backtest_sessions 
ADD COLUMN IF NOT EXISTS last_replay_time BIGINT;
