-- Recreate backtest_sessions to ensure correct schema
DROP TABLE IF EXISTS backtest_sessions CASCADE;

CREATE TABLE backtest_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('BACKTEST', 'PROP_FIRM')),
    initial_balance DECIMAL(15, 2) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL,
    pair TEXT NOT NULL,
    chart_layout TEXT DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE backtest_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for backtest_sessions
CREATE POLICY "Users can view their own sessions" ON backtest_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sessions" ON backtest_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON backtest_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON backtest_sessions FOR DELETE USING (auth.uid() = user_id);

-- Create backtest_trades table
CREATE TABLE IF NOT EXISTS backtest_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backtest_session_id UUID REFERENCES backtest_sessions(id) ON DELETE CASCADE NOT NULL,
    pair TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('LONG', 'SHORT')),
    entry_price DECIMAL(15, 5) NOT NULL,
    exit_price DECIMAL(15, 5) NOT NULL,
    size DECIMAL(15, 2) NOT NULL,
    pnl DECIMAL(15, 2) NOT NULL,
    entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on backtest_trades
ALTER TABLE backtest_trades ENABLE ROW LEVEL SECURITY;

-- Policies for backtest_trades
CREATE POLICY "Users can view their own backtest trades" ON backtest_trades FOR SELECT USING (
    EXISTS (SELECT 1 FROM backtest_sessions WHERE id = backtest_trades.backtest_session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert their own backtest trades" ON backtest_trades FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM backtest_sessions WHERE id = backtest_trades.backtest_session_id AND user_id = auth.uid())
);
