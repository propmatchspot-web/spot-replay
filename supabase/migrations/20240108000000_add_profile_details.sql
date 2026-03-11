ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS location text;
