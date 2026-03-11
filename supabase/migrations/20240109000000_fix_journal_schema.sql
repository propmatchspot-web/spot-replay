-- Fix Journal Schema to match Application Code

-- 1. Rename table if it exists as daily_journal
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_journal') THEN
    ALTER TABLE public.daily_journal RENAME TO journal_entries;
  END IF;
END $$;

-- 2. Create table if it doesn't exist (in case daily_journal didn't exist)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  mood text,
  content text, -- Renamed from notes
  rating integer check (rating >= 1 and rating <= 10),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Handle column renaming if we renamed the table
DO $$
BEGIN
  -- If 'notes' column exists, rename it to 'content'
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'notes') THEN
    ALTER TABLE public.journal_entries RENAME COLUMN notes TO content;
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'updated_at') THEN
    ALTER TABLE public.journal_entries ADD COLUMN updated_at timestamp with time zone default timezone('utc'::text, now());
  END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- 5. Recreate Policies (Drop old ones first to avoid conflicts if names match)
DROP POLICY IF EXISTS "Users can view their own journals" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journals" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update their own journals" ON public.journal_entries;

DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;

CREATE POLICY "Users can view their own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);

-- 6. Add unique constraint to prevent duplicate entries for same day
ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_user_id_date_key;
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_user_id_date_key UNIQUE (user_id, date);
