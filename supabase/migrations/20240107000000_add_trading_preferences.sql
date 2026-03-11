ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trading_preferences JSONB DEFAULT '{"default_risk": 1, "default_pair": "EURUSD", "theme": "dark"}'::jsonb;
