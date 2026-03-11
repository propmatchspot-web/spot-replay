
-- 1. Create PLANS table (Dynamic Pricing)
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- 'STARTER', 'PROFESSIONAL', 'ELITE'
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb, -- Store list of features dynamically
    limits JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "ai_daily_limit": 20 }
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Initial Plans
INSERT INTO plans (name, price_monthly, price_yearly, features, limits) VALUES
('STARTER', 0, 0, '["Basic Journaling", "3 AI Analysis / Day", "Standard Analytics", "Community Access"]', '{"ai_daily_limit": 3, "vision_limit": 1}'),
('PROFESSIONAL', 49, 490, '["Unlimited AI Analysis", "Advanced Market Structure AI", "Psychology Coaching", "Unlimited Vision Requests", "Priority Support"]', '{"ai_daily_limit": 1000, "vision_limit": 1000}'),
('ELITE', 99, 990, '["Everything in Pro", "Mentor Dashboard", "Team Management", "API Access", "White Label Reports"]', '{"ai_daily_limit": 10000, "vision_limit": 10000}')
ON CONFLICT (name) DO NOTHING;


-- 2. Create COUPONS table (Discounts)
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    discount_value DECIMAL(10, 2) NOT NULL,
    max_uses INTEGER DEFAULT NULL, -- NULL = Unlimited
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create ADMIN LOGS (Audit Trail)
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- 'GRANT_PLAN', 'BAN_USER', 'UPDATE_PLAN'
    target_id UUID, -- Affected User ID or Plan ID
    details JSONB, -- Context (Old Value -> New Value)
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies

-- Plans: Public can view active plans, Admin can edit
CREATE POLICY "Public Read Active Plans" ON plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin All Plans" ON plans
    FOR ALL USING (auth.email() = 'admin@email.com'); -- REPLACE WITH YOUR ACTUAL ADMIN EMAIL CHECK IN CODE OR DB

-- Coupons: Public can view active coupons (to validate), Admin can edit
CREATE POLICY "Public Read Coupons" ON coupons
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin All Coupons" ON coupons
    FOR ALL USING (auth.email() = 'admin@email.com');

-- Admin Logs: Admin Only
CREATE POLICY "Admin View Logs" ON admin_logs
    FOR SELECT USING (auth.email() = 'admin@email.com');

CREATE POLICY "Admin Insert Logs" ON admin_logs
    FOR INSERT WITH CHECK (auth.email() = 'admin@email.com');

-- Users: Update RLS to allow Admin full access to users table
-- NOTE: Existing RLS might block listing all users. We need an Admin Policy on 'users'
CREATE POLICY "Admin Full Access Users" ON users
    FOR ALL USING (auth.email() = 'admin@email.com');

