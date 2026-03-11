-- Create a separate table for storing large candle data blobs
-- This prevents the main sessions table from becoming too heavy
CREATE TABLE IF NOT EXISTS backtest_session_data (
    session_id UUID PRIMARY KEY REFERENCES backtest_sessions(id) ON DELETE CASCADE,
    candle_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS Policies
ALTER TABLE backtest_session_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own session data"
    ON backtest_session_data FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM backtest_sessions WHERE id = session_id
    ));

CREATE POLICY "Users can insert their own session data"
    ON backtest_session_data FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT user_id FROM backtest_sessions WHERE id = session_id
    ));

CREATE POLICY "Users can update their own session data"
    ON backtest_session_data FOR UPDATE
    USING (auth.uid() IN (
        SELECT user_id FROM backtest_sessions WHERE id = session_id
    ));
