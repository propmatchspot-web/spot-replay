-- Create Affiliates Table
create table if not exists affiliates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  code text unique not null,
  commission_rate numeric default 20.0 not null,
  status text default 'pending' check (status in ('pending', 'active', 'rejected')),
  total_earnings numeric default 0 not null,
  created_at timestamptz default now() not null
);

-- Create Referrals Table
create table if not exists referrals (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete set null,
  referred_user_id uuid references auth.users(id) on delete cascade unique,
  status text default 'pending' check (status in ('pending', 'converted', 'paid')),
  earnings numeric default 0 not null,
  created_at timestamptz default now() not null,
  converted_at timestamptz 
);

-- Create Payouts Table
create table if not exists payouts (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete cascade not null,
  amount numeric not null,
  status text default 'pending' check (status in ('pending', 'processing', 'paid', 'failed')),
  created_at timestamptz default now() not null,
  processed_at timestamptz
);

-- Create Clicks Table (for analytics)
create table if not exists affiliate_clicks (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete cascade not null,
  ip_address text, -- Hashed or anonymized ideally
  user_agent text,
  referrer_url text,
  created_at timestamptz default now() not null
);

-- RLS Policies

-- Affiliates: Users can read their own affiliate profile
alter table affiliates enable row level security;

create policy "Users can read own affiliate profile"
  on affiliates for select
  using (auth.uid() = user_id);

-- Referrals: Affiliates can read referrals linked to them
alter table referrals enable row level security;

create policy "Affiliates can read own referrals"
  on referrals for select
  using (
    exists (
      select 1 from affiliates
      where affiliates.id = referrals.affiliate_id
      and affiliates.user_id = auth.uid()
    )
  );

-- Payouts: Affiliates can read their own payouts
alter table payouts enable row level security;

create policy "Affiliates can read own payouts"
  on payouts for select
  using (
    exists (
      select 1 from affiliates
      where affiliates.id = payouts.affiliate_id
      and affiliates.user_id = auth.uid()
    )
  );

-- Clicks: Affiliates can read their own clicks
alter table affiliate_clicks enable row level security;

create policy "Affiliates can read own clicks"
  on affiliate_clicks for select
  using (
    exists (
      select 1 from affiliates
      where affiliates.id = affiliate_clicks.affiliate_id
      and affiliates.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index idx_affiliates_user_id on affiliates(user_id);
create index idx_affiliates_code on affiliates(code);
create index idx_referrals_affiliate_id on referrals(affiliate_id);
create index idx_referrals_referred_user_id on referrals(referred_user_id);
create index idx_payouts_affiliate_id on payouts(affiliate_id);
create index idx_clicks_affiliate_id on affiliate_clicks(affiliate_id);
