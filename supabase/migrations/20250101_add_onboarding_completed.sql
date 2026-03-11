-- Add onboarding_completed column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to have it TRUE so they aren't locked out
UPDATE users SET onboarding_completed = TRUE;
