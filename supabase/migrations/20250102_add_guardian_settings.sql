-- Add guardian_settings column to users table
-- Structure: { "daily_loss_limit": 500, "max_daily_trades": 3, "trading_hours_start": "09:00", "trading_hours_end": "17:00", "is_enabled": true }
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_settings JSONB DEFAULT '{}'::jsonb;
