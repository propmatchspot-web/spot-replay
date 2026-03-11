-- Add emotions column to journal_entries
alter table public.journal_entries 
add column if not exists emotions text[] default '{}';
