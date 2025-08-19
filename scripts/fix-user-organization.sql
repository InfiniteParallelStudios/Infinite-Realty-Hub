-- Fix user organization assignment for Infinite Realty Hub
-- This script ensures the user profile is properly linked to an organization

-- First, ensure organizations exist (insert if not present)
INSERT INTO organizations (id, name, slug, plan_type) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Demo Realty Group', 'demo-realty', 'professional'),
    ('00000000-0000-0000-0000-000000000002', 'Independent Agent', 'independent', 'free')
ON CONFLICT (id) DO NOTHING;

-- Update the user's profile to assign them to an organization
-- Replace 'USER_ID_HERE' with the actual user ID from the test page
UPDATE profiles 
SET 
    organization_id = '00000000-0000-0000-0000-000000000001',
    role = 'agent',
    updated_at = NOW()
WHERE id = '361000fb-5d07-4d05-a3df-0d686b6808d2';

-- Verify the update worked
SELECT 
    id,
    full_name,
    email,
    organization_id,
    role,
    updated_at
FROM profiles 
WHERE id = '361000fb-5d07-4d05-a3df-0d686b6808d2';

-- Check organizations
SELECT * FROM organizations;