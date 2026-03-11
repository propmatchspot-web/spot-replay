-- Fix missing DELETE/UPDATE policies for backtest related tables
-- This is required for cascading deletes to work with RLS enabled

-- 1. backtest_trades policies (add missing update/delete)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'backtest_trades' AND policyname = 'Users can update their own backtest trades'
    ) THEN
        CREATE POLICY "Users can update their own backtest trades"
            ON backtest_trades FOR UPDATE
            USING (
                EXISTS (SELECT 1 FROM backtest_sessions WHERE id = backtest_trades.backtest_session_id AND user_id = auth.uid())
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'backtest_trades' AND policyname = 'Users can delete their own backtest trades'
    ) THEN
        CREATE POLICY "Users can delete their own backtest trades"
            ON backtest_trades FOR DELETE
            USING (
                EXISTS (SELECT 1 FROM backtest_sessions WHERE id = backtest_trades.backtest_session_id AND user_id = auth.uid())
            );
    END IF;
END $$;

-- 2. backtest_session_data policies (add missing delete)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'backtest_session_data' AND policyname = 'Users can delete their own session data'
    ) THEN
        CREATE POLICY "Users can delete their own session data"
            ON backtest_session_data FOR DELETE
            USING (auth.uid() IN (
                SELECT user_id FROM backtest_sessions WHERE id = session_id
            ));
    END IF;
END $$;
