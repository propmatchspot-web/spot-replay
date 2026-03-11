-- Double check column exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_settings JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS allows update
-- We add a specific policy just in case.
DROP POLICY IF EXISTS "Users can update own guardian settings" ON users;

CREATE POLICY "Users can update own guardian settings" ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Grant access just in case
GRANT UPDATE (guardian_settings) ON users TO authenticated;
