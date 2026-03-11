-- Add columns for Prop Firm Simulator
ALTER TABLE backtest_sessions 
ADD COLUMN IF NOT EXISTS challenge_rules JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS challenge_status JSONB DEFAULT NULL;

-- Comment on columns
COMMENT ON COLUMN backtest_sessions.challenge_rules IS 'Stores rules like max_drawdown, profit_target, etc.';
COMMENT ON COLUMN backtest_sessions.challenge_status IS 'Stores current state: ACTIVE, PASSED, FAILED, and failure reason.';
