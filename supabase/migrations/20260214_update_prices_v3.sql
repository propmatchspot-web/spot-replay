-- Updated Pricing to $19 / $29 / $59 and Add Trial Info

-- 1. Update STARTER ($19)
UPDATE plans 
SET price_monthly = 19, 
    price_yearly = 185,
    features = '["Unlimited Trades", "Basic Analytics", "3 AI Analysis / Day"]'::jsonb
WHERE name = 'STARTER';

-- 2. Update GROWTH ($29) - 7 Days Trial
UPDATE plans 
SET price_monthly = 29, 
    price_yearly = 280,
    features = '["Unlimited Auto-Sync", "Full AI Coach Access", "Prop Firm Guardian", "7-Day Free Trial"]'::jsonb
WHERE name = 'GROWTH';

-- 3. Update ENTERPRISE ($59) - 7 Days Trial
UPDATE plans 
SET price_monthly = 59, 
    price_yearly = 570,
    features = '["Multi-Account Aggregation", "Mentor Access", "API Access", "7-Day Free Trial"]'::jsonb
WHERE name = 'ENTERPRISE';
