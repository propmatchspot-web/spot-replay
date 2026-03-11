-- 1. Create Affiliates Table
create table if not exists affiliates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  code text unique not null,
  commission_rate numeric default 20.0 not null,
  status text default 'pending' check (status in ('pending', 'active', 'rejected')),
  total_earnings numeric default 0 not null,
  created_at timestamptz default now() not null
);

-- 2. Create Referrals Table
create table if not exists referrals (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete set null,
  referred_user_id uuid references auth.users(id) on delete cascade unique,
  status text default 'pending' check (status in ('pending', 'converted', 'paid')),
  earnings numeric default 0 not null,
  created_at timestamptz default now() not null,
  converted_at timestamptz 
);

-- 3. Create Payouts Table
create table if not exists payouts (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete cascade not null,
  amount numeric not null,
  status text default 'pending' check (status in ('pending', 'processing', 'paid', 'failed')),
  created_at timestamptz default now() not null,
  processed_at timestamptz
);

-- 4. Create Clicks Table (for analytics)
create table if not exists affiliate_clicks (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete cascade not null,
  ip_address text, 
  user_agent text,
  referrer_url text,
  created_at timestamptz default now() not null
);

-- 5. Add referred_by to users table
alter table users add column if not exists referred_by text;

-- 6. Update handle_new_user trigger to include referred_by
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, referred_by)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'referred_by'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    referred_by = EXCLUDED.referred_by;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS Policies

-- Affiliates
alter table affiliates enable row level security;
create policy "Users can read own affiliate profile" on affiliates for select using (auth.uid() = user_id);

-- Referrals
alter table referrals enable row level security;
create policy "Affiliates can read own referrals" on referrals for select using (
  exists (select 1 from affiliates where affiliates.id = referrals.affiliate_id and affiliates.user_id = auth.uid())
);

-- Payouts
alter table payouts enable row level security;
create policy "Affiliates can read own payouts" on payouts for select using (
  exists (select 1 from affiliates where affiliates.id = payouts.affiliate_id and affiliates.user_id = auth.uid())
);

-- Clicks
alter table affiliate_clicks enable row level security;
create policy "Affiliates can read own clicks" on affiliate_clicks for select using (
  exists (select 1 from affiliates where affiliates.id = affiliate_clicks.affiliate_id and affiliates.user_id = auth.uid())
);

-- Indexes
create index if not exists idx_affiliates_user_id on affiliates(user_id);
create index if not exists idx_affiliates_code on affiliates(code);
create index if not exists idx_referrals_affiliate_id on referrals(affiliate_id);
create index if not exists idx_payouts_affiliate_id on payouts(affiliate_id);
create index if not exists idx_users_referred_by on users(referred_by);
