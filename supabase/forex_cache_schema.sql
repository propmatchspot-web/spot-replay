-- Forex Candle Cache Table
-- Run this in your CACHE Supabase project (not the main one)

CREATE TABLE IF NOT EXISTS forex_candles (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,        -- EURUSD, GBPUSD, etc.
    interval VARCHAR(5) NOT NULL,       -- 1m, 5m
    timestamp BIGINT NOT NULL,          -- Unix timestamp in seconds
    open DECIMAL(20, 10) NOT NULL,
    high DECIMAL(20, 10) NOT NULL,
    low DECIMAL(20, 10) NOT NULL,
    close DECIMAL(20, 10) NOT NULL,
    volume DECIMAL(20, 4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    CONSTRAINT unique_candle UNIQUE (symbol, interval, timestamp)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_forex_symbol_interval ON forex_candles(symbol, interval);
CREATE INDEX IF NOT EXISTS idx_forex_timestamp ON forex_candles(timestamp);
CREATE INDEX IF NOT EXISTS idx_forex_lookup ON forex_candles(symbol, interval, timestamp);

-- Enable Row Level Security but allow all reads (public cache)
ALTER TABLE forex_candles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (it's public market data)
CREATE POLICY "Allow public read" ON forex_candles
    FOR SELECT USING (true);

-- Allow authenticated service role to insert
CREATE POLICY "Allow service insert" ON forex_candles
    FOR INSERT WITH CHECK (true);
