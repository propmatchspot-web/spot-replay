-- Create backtest_sessions table
CREATE TABLE IF NOT EXISTS backtest_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    pair TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    initial_balance DECIMAL NOT NULL,
    current_balance DECIMAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add backtest_session_id to trades table
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS backtest_session_id UUID REFERENCES backtest_sessions(id) ON DELETE CASCADE;

-- Enable RLS on backtest_sessions
ALTER TABLE backtest_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for backtest_sessions
CREATE POLICY "Users can view their own backtest sessions"
    ON backtest_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backtest sessions"
    ON backtest_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backtest sessions"
    ON backtest_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backtest sessions"
    ON backtest_sessions FOR DELETE
    USING (auth.uid() = user_id);
