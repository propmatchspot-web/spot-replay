-- This is a hardened version of the new user trigger.
-- It is designed to never fail and prevent "Database error saving new user".

-- 1. First, make sure the problematic columns in public.users aren't strictly requiring data we don't have.
ALTER TABLE public.users ALTER COLUMN username DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- 2. Replace the trigger function with a crash-proof version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- We wrap the insert in a DO block so even if it fails, Auth user creation succeeds
  BEGIN
    INSERT INTO public.users (id, email, username)
    VALUES (
      new.id, 
      new.email, 
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Trader ' || substr(new.id::text, 1, 6))
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      username = EXCLUDED.username;
  EXCEPTION WHEN OTHERS THEN
    -- If the insert into public.users fails, we log it but don't crash the auth signup
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate the trigger (just in case it was dropped)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
