-- Add new columns for detailed trade logging
alter table public.trades
add column if not exists stop_loss numeric,
add column if not exists take_profit numeric,
add column if not exists rr numeric,
add column if not exists closing_reason text check (closing_reason in ('TP', 'SL', 'BE', 'MANUAL'));

-- Update RLS policies if needed (existing ones should cover new columns automatically as they apply to the row)
