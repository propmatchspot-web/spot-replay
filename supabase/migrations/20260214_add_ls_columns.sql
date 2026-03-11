-- Add Lemon Squeezy Subscription Columns to Users Table

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id text,
ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id text,
ADD COLUMN IF NOT EXISTS lemon_squeezy_variant_id text,
ADD COLUMN IF NOT EXISTS subscription_status text,
ADD COLUMN IF NOT EXISTS renews_at timestamp with time zone;

-- Index for faster lookups on webhook events
CREATE INDEX IF NOT EXISTS idx_users_ls_subscription_id ON public.users(lemon_squeezy_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_ls_customer_id ON public.users(lemon_squeezy_customer_id);
