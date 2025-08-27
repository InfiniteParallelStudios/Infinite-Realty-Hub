-- Infinite Realty Hub Database Schema
-- Version: 1.0.0
-- Purpose: Complete schema for real estate platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS widget_configs CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS module_subscriptions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Organizations (Multi-tenancy)
CREATE TABLE organizations (
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
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'broker', 'team_lead', 'admin', 'assistant')),
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    license_number VARCHAR(50),
    license_state VARCHAR(2),
    bio TEXT,
    specialties TEXT[],
    work_areas JSONB DEFAULT '[]', -- Array of cities/areas
    preferences JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module Subscriptions
CREATE TABLE module_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    module_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'trial', 'cancelled', 'expired')),
    pricing_plan VARCHAR(50),
    features JSONB DEFAULT '{}',
    usage_data JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts (CRM Core)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255), -- Generated field
    email VARCHAR(255),
    phone VARCHAR(20),
    secondary_phone VARCHAR(20),
    
    -- Address
    address JSONB DEFAULT '{}', -- {street, city, state, zip, country}
    
    -- Classification
    contact_type VARCHAR(50) DEFAULT 'lead' CHECK (contact_type IN ('buyer', 'seller', 'lead', 'past_client', 'vendor', 'referral')),
    source VARCHAR(100), -- How they found us
    tags TEXT[] DEFAULT '{}',
    
    -- Personal Details
    birthday DATE,
    anniversary DATE,
    spouse_name VARCHAR(100),
    children JSONB DEFAULT '[]', -- Array of {name, age}
    pets JSONB DEFAULT '[]', -- Array of {name, type}
    
    -- Business Details
    occupation VARCHAR(100),
    company VARCHAR(100),
    
    -- Property Interests
    property_types TEXT[] DEFAULT '{}', -- [residential, commercial, land]
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    preferred_areas TEXT[] DEFAULT '{}',
    timeline VARCHAR(50), -- immediate, 3-months, 6-months, 1-year
    motivation_level INTEGER DEFAULT 5 CHECK (motivation_level BETWEEN 1 AND 10),
    
    -- Relationship Management
    last_contact_date TIMESTAMPTZ,
    next_followup_date TIMESTAMPTZ,
    contact_frequency VARCHAR(20) DEFAULT 'monthly', -- weekly, monthly, quarterly
    communication_preferences JSONB DEFAULT '{}', -- {email: true, sms: false, call: true}
    
    -- Notes and Custom Fields
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    
    -- Scoring and Analytics
    engagement_score INTEGER DEFAULT 0,
    conversion_probability DECIMAL(3,2) DEFAULT 0.50,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication Log
CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Communication Details
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'call', 'text', 'meeting', 'note', 'social')),
    direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
    subject VARCHAR(255),
    content TEXT,
    
    -- Call Details
    duration INTEGER, -- seconds
    call_outcome VARCHAR(50), -- answered, voicemail, busy, no-answer
    
    -- Meeting Details
    location VARCHAR(255),
    attendees JSONB DEFAULT '[]',
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMPTZ,
    follow_up_notes TEXT,
    
    -- Attachments and Links
    attachments JSONB DEFAULT '[]',
    external_links JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (Pipeline Management)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Lead Status
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'presentation', 'negotiation', 'contract', 'closed_won', 'closed_lost')),
    stage_position INTEGER DEFAULT 1,
    
    -- Lead Details
    lead_type VARCHAR(20) DEFAULT 'buyer' CHECK (lead_type IN ('buyer', 'seller', 'rental', 'investment')),
    source VARCHAR(100),
    campaign_id VARCHAR(100),
    referral_source VARCHAR(255),
    
    -- Value and Scoring
    estimated_value DECIMAL(12,2),
    probability INTEGER DEFAULT 50 CHECK (probability BETWEEN 0 AND 100),
    lead_score INTEGER DEFAULT 0,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Property Information
    property_interests JSONB DEFAULT '[]',
    specific_properties JSONB DEFAULT '[]', -- Specific property IDs they're interested in
    
    -- Timeline
    decision_timeline VARCHAR(50),
    expected_close_date DATE,
    last_activity TIMESTAMPTZ,
    
    -- Assignment
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    transferred_from UUID REFERENCES profiles(id),
    
    -- Outcome Tracking
    closed_at TIMESTAMPTZ,
    lost_reason VARCHAR(255),
    win_reason VARCHAR(255),
    actual_value DECIMAL(12,2),
    commission_amount DECIMAL(12,2),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments and Calendar
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    
    -- Appointment Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'meeting' CHECK (type IN ('showing', 'listing_presentation', 'buyer_consultation', 'closing', 'inspection', 'open_house', 'meeting', 'call', 'other')),
    
    -- Scheduling
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_all_day BOOLEAN DEFAULT FALSE,
    
    -- Location
    location VARCHAR(255),
    location_type VARCHAR(20) DEFAULT 'in_person' CHECK (location_type IN ('in_person', 'virtual', 'phone')),
    location_coordinates JSONB, -- {lat, lng}
    meeting_link TEXT,
    
    -- Status and Confirmation
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    confirmation_status VARCHAR(20) DEFAULT 'pending' CHECK (confirmation_status IN ('pending', 'confirmed', 'declined')),
    
    -- Attendees
    attendees JSONB DEFAULT '[]',
    max_attendees INTEGER,
    
    -- Reminders
    reminder_settings JSONB DEFAULT '{"email": [24, 1], "sms": [1]}', -- Hours before
    reminders_sent JSONB DEFAULT '{}',
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule JSONB, -- RRULE-like structure
    recurrence_parent_id UUID REFERENCES appointments(id),
    
    -- Results and Follow-up
    outcome VARCHAR(50),
    outcome_notes TEXT,
    next_action VARCHAR(255),
    next_action_date TIMESTAMPTZ,
    
    -- Integration
    external_calendar_id VARCHAR(255),
    external_event_id VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks and Reminders
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Task Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    
    -- Relationships
    related_to_type VARCHAR(50), -- contact, lead, appointment, property
    related_to_id UUID,
    
    -- Priority and Status
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'deferred')),
    
    -- Scheduling
    due_date TIMESTAMPTZ,
    estimated_duration INTEGER, -- minutes
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule JSONB,
    
    -- Completion
    completed_at TIMESTAMPTZ,
    completion_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Widget Configurations (Dashboard)
CREATE TABLE widget_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    dashboard_name VARCHAR(100) DEFAULT 'default',
    
    -- Widget Details
    widget_type VARCHAR(100) NOT NULL,
    widget_title VARCHAR(255),
    
    -- Position and Size
    position JSONB NOT NULL, -- {x, y, width, height}
    
    -- Configuration
    settings JSONB DEFAULT '{}',
    data_sources JSONB DEFAULT '{}',
    
    -- Display
    is_visible BOOLEAN DEFAULT TRUE,
    theme_overrides JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Notification Details
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    
    -- Data and Actions
    data JSONB DEFAULT '{}',
    action_url TEXT,
    action_text VARCHAR(100),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- Delivery
    delivery_method VARCHAR(20) DEFAULT 'in_app' CHECK (delivery_method IN ('in_app', 'email', 'sms', 'push')),
    delivered_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Action Details
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    
    -- Changes
    old_data JSONB,
    new_data JSONB,
    changes JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_profiles_role ON profiles(role);

CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_organization ON contacts(organization_id);
CREATE INDEX idx_contacts_type ON contacts(contact_type);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);
CREATE INDEX idx_contacts_search ON contacts USING GIN(to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(phone, '')));

CREATE INDEX idx_communications_contact ON communications(contact_id);
CREATE INDEX idx_communications_user ON communications(user_id);
CREATE INDEX idx_communications_type ON communications(type);
CREATE INDEX idx_communications_created ON communications(created_at DESC);

CREATE INDEX idx_leads_contact ON leads(contact_id);
CREATE INDEX idx_leads_user ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_priority ON leads(priority);
CREATE INDEX idx_leads_organization ON leads(organization_id);

CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_contact ON appointments(contact_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);

CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);

CREATE INDEX idx_widget_configs_user ON widget_configs(user_id);
CREATE INDEX idx_widget_configs_dashboard ON widget_configs(user_id, dashboard_name);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Create Functions and Triggers

-- Update full_name for contacts
CREATE OR REPLACE FUNCTION update_contact_full_name()
RETURNS TRIGGER AS $$
BEGIN
    NEW.full_name := TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_full_name
    BEFORE INSERT OR UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_full_name();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their organization" ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Profiles: Users can see profiles in their organization
CREATE POLICY "Users can view profiles in their organization" ON profiles
    FOR ALL USING (
        id = auth.uid() 
        OR organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Contacts: Users can only see their own contacts or organization contacts (if broker/admin)
CREATE POLICY "Users can manage their own contacts" ON contacts
    FOR ALL USING (
        user_id = auth.uid()
        OR (
            organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('broker', 'admin', 'team_lead')
            )
        )
    );

-- Communications: Linked to contact access
CREATE POLICY "Users can manage communications for their contacts" ON communications
    FOR ALL USING (
        user_id = auth.uid()
        OR contact_id IN (
            SELECT id FROM contacts 
            WHERE user_id = auth.uid()
            OR (
                organization_id IN (
                    SELECT organization_id FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('broker', 'admin', 'team_lead')
                )
            )
        )
    );

-- Similar policies for other tables...
CREATE POLICY "Users can manage their leads" ON leads
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their appointments" ON appointments
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their tasks" ON tasks
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their widget configs" ON widget_configs
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

-- Audit logs: Organization-level access
CREATE POLICY "Users can view organization audit logs" ON audit_logs
    FOR SELECT USING (
        user_id = auth.uid()
        OR organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('broker', 'admin')
        )
    );

-- Insert seed data for development
INSERT INTO organizations (id, name, slug, plan_type) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Demo Realty Group', 'demo-realty', 'professional'),
    ('00000000-0000-0000-0000-000000000002', 'Independent Agent', 'independent', 'free');

-- Create views for common queries
CREATE VIEW contact_summary AS
SELECT 
    c.id,
    c.full_name,
    c.email,
    c.phone,
    c.contact_type,
    c.tags,
    c.last_contact_date,
    c.next_followup_date,
    COUNT(com.id) as communication_count,
    MAX(com.created_at) as last_communication,
    COUNT(l.id) as lead_count,
    COUNT(a.id) as appointment_count
FROM contacts c
LEFT JOIN communications com ON c.id = com.contact_id
LEFT JOIN leads l ON c.id = l.contact_id
LEFT JOIN appointments a ON c.id = a.contact_id
GROUP BY c.id, c.full_name, c.email, c.phone, c.contact_type, c.tags, c.last_contact_date, c.next_followup_date;

-- Performance metrics view
CREATE VIEW user_performance AS
SELECT 
    p.id as user_id,
    p.full_name,
    COUNT(DISTINCT c.id) as total_contacts,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT CASE WHEN l.status = 'closed_won' THEN l.id END) as closed_deals,
    COALESCE(SUM(CASE WHEN l.status = 'closed_won' THEN l.actual_value END), 0) as total_volume,
    COALESCE(SUM(CASE WHEN l.status = 'closed_won' THEN l.commission_amount END), 0) as total_commission,
    COUNT(DISTINCT a.id) as total_appointments
FROM profiles p
LEFT JOIN contacts c ON p.id = c.user_id
LEFT JOIN leads l ON c.id = l.contact_id
LEFT JOIN appointments a ON p.id = a.user_id
GROUP BY p.id, p.full_name;