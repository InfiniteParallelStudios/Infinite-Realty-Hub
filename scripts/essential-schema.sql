-- Essential Schema for Infinite Realty Hub
-- Apply this first to get authentication working

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (Multi-tenancy)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan_type VARCHAR(50) DEFAULT 'free' CHECK (plan_type IN ('free', 'professional', 'team', 'enterprise')),
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('agent', 'broker', 'team_lead', 'admin', 'user')),
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    license_number VARCHAR(50),
    license_state VARCHAR(2),
    bio TEXT,
    specialties TEXT[],
    work_areas JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for timestamps
DROP TRIGGER IF EXISTS trigger_organizations_updated_at ON organizations;
CREATE TRIGGER trigger_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
CREATE POLICY "Users can view profiles in their organization" ON profiles
    FOR ALL USING (
        id = auth.uid() 
        OR organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Basic RLS for organizations
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
CREATE POLICY "Users can view their organization" ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Insert seed organizations
INSERT INTO organizations (id, name, slug, plan_type) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Demo Realty Group', 'demo-realty', 'professional'),
    ('00000000-0000-0000-0000-000000000002', 'Independent Agent', 'independent', 'free')
ON CONFLICT (id) DO NOTHING;