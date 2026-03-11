-- Create backtest_sessions table
CREATE TABLE IF NOT EXISTS backtest_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('BACKTEST', 'PROP_FIRM')),
    initial_balance DECIMAL(15, 2) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL,
    pair TEXT NOT NULL, -- The asset (e.g., EURUSD)
    chart_layout TEXT, -- Optional layout preference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE backtest_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own sessions"
    ON backtest_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON backtest_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
    ON backtest_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
    ON backtest_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_backtest_sessions_user_id ON backtest_sessions(user_id);
