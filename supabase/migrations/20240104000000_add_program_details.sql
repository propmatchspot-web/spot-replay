-- Add program_details column to store multi-phase rules (JSON)
ALTER TABLE accounts
ADD COLUMN program_details JSONB;

COMMENT ON COLUMN accounts.program_details IS 'Stores configuration for all phases (e.g., { phase1: { dd: 5, pt: 10 }, phase2: { ... } })';
