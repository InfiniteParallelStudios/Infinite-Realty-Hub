-- Check and Fix Schema for Infinite Realty Hub
-- This script will check what exists and add missing columns/tables

-- First, let's see what columns exist in profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check if organizations table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'organizations'
);

-- If organizations doesn't exist, let's create it first
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

-- Now let's add the missing columns to profiles table
-- Add organization_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'organization_id') THEN
        ALTER TABLE profiles ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add other missing columns
DO $$ 
BEGIN
    -- Add role column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user' 
        CHECK (role IN ('agent', 'broker', 'team_lead', 'admin', 'user'));
    END IF;
    
    -- Add phone column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone VARCHAR(20);
    END IF;
    
    -- Add license_number column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'license_number') THEN
        ALTER TABLE profiles ADD COLUMN license_number VARCHAR(50);
    END IF;
    
    -- Add license_state column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'license_state') THEN
        ALTER TABLE profiles ADD COLUMN license_state VARCHAR(2);
    END IF;
    
    -- Add bio column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
    
    -- Add specialties column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'specialties') THEN
        ALTER TABLE profiles ADD COLUMN specialties TEXT[];
    END IF;
    
    -- Add work_areas column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'work_areas') THEN
        ALTER TABLE profiles ADD COLUMN work_areas JSONB DEFAULT '[]';
    END IF;
    
    -- Add preferences column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
        ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
    
    -- Add onboarding_completed column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Insert seed organizations
INSERT INTO organizations (id, name, slug, plan_type) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Demo Realty Group', 'demo-realty', 'professional'),
    ('00000000-0000-0000-0000-000000000002', 'Independent Agent', 'independent', 'free')
ON CONFLICT (id) DO NOTHING;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Enable RLS on organizations if not already enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies for organizations
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
CREATE POLICY "Users can view their organization" ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Update the user's profile to assign them to an organization
UPDATE profiles 
SET 
    organization_id = '00000000-0000-0000-0000-000000000001',
    role = 'agent',
    updated_at = NOW()
WHERE id = '361000fb-5d07-4d05-a3df-0d686b6808d2';

-- Verify everything worked
SELECT 'Organizations created:' as info;
SELECT id, name, slug FROM organizations;

SELECT 'User profile updated:' as info;
SELECT 
    id,
    full_name,
    email,
    organization_id,
    role,
    updated_at
FROM profiles 
WHERE id = '361000fb-5d07-4d05-a3df-0d686b6808d2';

SELECT 'Schema is now complete!' as status;