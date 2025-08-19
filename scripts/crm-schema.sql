-- ===============================================
-- CRM SCHEMA FOR INFINITE REALTY HUB
-- Complete Contact Management System
-- ===============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- CONTACTS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Basic Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    
    -- Contact Type and Status
    contact_type VARCHAR(50) DEFAULT 'lead' CHECK (contact_type IN ('lead', 'prospect', 'client', 'past_client', 'vendor', 'colleague')),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'closed', 'inactive')),
    source VARCHAR(100), -- referral, website, social_media, etc.
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Address Information
    street_address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    
    -- Professional Information
    company VARCHAR(255),
    job_title VARCHAR(100),
    industry VARCHAR(100),
    
    -- Real Estate Specific
    property_type VARCHAR(50), -- residential, commercial, land, etc.
    price_range_min INTEGER,
    price_range_max INTEGER,
    preferred_areas TEXT[],
    timeline VARCHAR(50), -- immediate, 3_months, 6_months, 1_year, etc.
    financing_status VARCHAR(50), -- pre_approved, needs_approval, cash, etc.
    
    -- Relationship & Notes
    notes TEXT,
    tags TEXT[],
    birthday DATE,
    anniversary DATE,
    spouse_name VARCHAR(100),
    children_count INTEGER DEFAULT 0,
    
    -- Preferences
    communication_preference VARCHAR(50) DEFAULT 'email' CHECK (communication_preference IN ('email', 'phone', 'text', 'mail')),
    best_contact_time VARCHAR(50),
    do_not_contact BOOLEAN DEFAULT FALSE,
    
    -- Tracking
    last_contact_date TIMESTAMPTZ,
    next_followup_date TIMESTAMPTZ,
    conversion_date TIMESTAMPTZ,
    referral_source_contact_id UUID REFERENCES contacts(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- CONTACT INTERACTIONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS contact_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    
    -- Interaction Details
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('call', 'email', 'text', 'meeting', 'showing', 'note', 'task', 'appointment')),
    subject VARCHAR(255),
    description TEXT,
    outcome VARCHAR(100),
    
    -- Scheduling (for appointments/meetings)
    scheduled_date TIMESTAMPTZ,
    duration_minutes INTEGER,
    location TEXT,
    
    -- Communication specific
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
    channel VARCHAR(50), -- phone, email, whatsapp, facebook, etc.
    
    -- Attachments and references
    attachments JSONB DEFAULT '[]',
    related_property_id UUID, -- for future property integration
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- TASKS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    
    -- Task Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    
    -- Scheduling
    due_date TIMESTAMPTZ,
    reminder_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    
    -- Categorization
    category VARCHAR(50), -- follow_up, showing, paperwork, etc.
    tags TEXT[],
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- LEAD PIPELINE TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Stage Details
    name VARCHAR(100) NOT NULL,
    description TEXT,
    stage_order INTEGER NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    
    -- Automation
    auto_tasks JSONB DEFAULT '[]',
    stage_requirements TEXT[],
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, stage_order)
);

-- Insert default pipeline stages
INSERT INTO pipeline_stages (organization_id, name, description, stage_order, color) VALUES
    ('00000000-0000-0000-0000-000000000001', 'New Lead', 'Fresh leads that need initial contact', 1, '#6B7280'),
    ('00000000-0000-0000-0000-000000000001', 'Contacted', 'Initial contact made, awaiting response', 2, '#F59E0B'),
    ('00000000-0000-0000-0000-000000000001', 'Qualified', 'Lead is qualified and interested', 3, '#10B981'),
    ('00000000-0000-0000-0000-000000000001', 'Showing Scheduled', 'Property showing scheduled', 4, '#3B82F6'),
    ('00000000-0000-0000-0000-000000000001', 'Offer Preparation', 'Preparing or reviewing offers', 5, '#8B5CF6'),
    ('00000000-0000-0000-0000-000000000001', 'Under Contract', 'Offer accepted, in escrow', 6, '#F97316'),
    ('00000000-0000-0000-0000-000000000001', 'Closed', 'Transaction completed successfully', 7, '#059669'),
    ('00000000-0000-0000-0000-000000000002', 'New Lead', 'Fresh leads that need initial contact', 1, '#6B7280'),
    ('00000000-0000-0000-0000-000000000002', 'Contacted', 'Initial contact made, awaiting response', 2, '#F59E0B'),
    ('00000000-0000-0000-0000-000000000002', 'Qualified', 'Lead is qualified and interested', 3, '#10B981'),
    ('00000000-0000-0000-0000-000000000002', 'Closed', 'Transaction completed successfully', 4, '#059669')
ON CONFLICT (organization_id, stage_order) DO NOTHING;

-- ===============================================
-- CONTACT PIPELINE TRACKING
-- ===============================================

CREATE TABLE IF NOT EXISTS contact_pipeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    stage_id UUID REFERENCES pipeline_stages(id) ON DELETE CASCADE NOT NULL,
    
    -- Movement tracking
    entered_date TIMESTAMPTZ DEFAULT NOW(),
    expected_close_date TIMESTAMPTZ,
    estimated_value DECIMAL(12,2),
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    
    -- Notes for this stage
    stage_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(contact_id, stage_id)
);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- Contacts indexes
CREATE INDEX IF NOT EXISTS idx_contacts_organization ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_type_status ON contacts(contact_type, status);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_contacts_next_followup ON contacts(next_followup_date) WHERE next_followup_date IS NOT NULL;

-- Interactions indexes
CREATE INDEX IF NOT EXISTS idx_interactions_contact ON contact_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON contact_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON contact_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON contact_interactions(created_at);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_contact ON tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Pipeline indexes
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_org ON pipeline_stages(organization_id);
CREATE INDEX IF NOT EXISTS idx_contact_pipeline_contact ON contact_pipeline(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_pipeline_stage ON contact_pipeline(stage_id);

-- ===============================================
-- UPDATE TRIGGERS
-- ===============================================

-- Update triggers for all tables
DROP TRIGGER IF EXISTS trigger_contacts_updated_at ON contacts;
CREATE TRIGGER trigger_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_contact_interactions_updated_at ON contact_interactions;
CREATE TRIGGER trigger_contact_interactions_updated_at 
    BEFORE UPDATE ON contact_interactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_tasks_updated_at ON tasks;
CREATE TRIGGER trigger_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_pipeline_stages_updated_at ON pipeline_stages;
CREATE TRIGGER trigger_pipeline_stages_updated_at 
    BEFORE UPDATE ON pipeline_stages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_contact_pipeline_updated_at ON contact_pipeline;
CREATE TRIGGER trigger_contact_pipeline_updated_at 
    BEFORE UPDATE ON contact_pipeline 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- ROW LEVEL SECURITY POLICIES
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_pipeline ENABLE ROW LEVEL SECURITY;

-- Contacts RLS Policies
DROP POLICY IF EXISTS "Users can manage contacts in their organization" ON contacts;
CREATE POLICY "Users can manage contacts in their organization" ON contacts
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Contact Interactions RLS Policies
DROP POLICY IF EXISTS "Users can manage interactions for their contacts" ON contact_interactions;
CREATE POLICY "Users can manage interactions for their contacts" ON contact_interactions
    FOR ALL USING (
        contact_id IN (
            SELECT id FROM contacts WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Tasks RLS Policies
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
CREATE POLICY "Users can manage their own tasks" ON tasks
    FOR ALL USING (
        user_id = auth.uid()
        OR contact_id IN (
            SELECT id FROM contacts WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Pipeline Stages RLS Policies
DROP POLICY IF EXISTS "Users can view pipeline stages in their organization" ON pipeline_stages;
CREATE POLICY "Users can view pipeline stages in their organization" ON pipeline_stages
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Contact Pipeline RLS Policies  
DROP POLICY IF EXISTS "Users can manage pipeline for their contacts" ON contact_pipeline;
CREATE POLICY "Users can manage pipeline for their contacts" ON contact_pipeline
    FOR ALL USING (
        contact_id IN (
            SELECT id FROM contacts WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- ===============================================
-- HELPFUL VIEWS
-- ===============================================

-- Contact summary view
CREATE OR REPLACE VIEW contact_summary AS
SELECT 
    c.*,
    COUNT(ci.id) as interaction_count,
    MAX(ci.created_at) as last_interaction_date,
    COUNT(t.id) FILTER (WHERE t.status != 'completed') as open_tasks_count,
    ps.name as current_stage
FROM contacts c
LEFT JOIN contact_interactions ci ON c.id = ci.contact_id
LEFT JOIN tasks t ON c.id = t.contact_id
LEFT JOIN contact_pipeline cp ON c.id = cp.contact_id
LEFT JOIN pipeline_stages ps ON cp.stage_id = ps.id
GROUP BY c.id, ps.name;

-- Pipeline summary view
CREATE OR REPLACE VIEW pipeline_summary AS
SELECT 
    ps.id,
    ps.name,
    ps.stage_order,
    ps.color,
    COUNT(cp.contact_id) as contact_count,
    SUM(cp.estimated_value) as total_estimated_value,
    AVG(cp.probability) as avg_probability
FROM pipeline_stages ps
LEFT JOIN contact_pipeline cp ON ps.id = cp.stage_id
GROUP BY ps.id, ps.name, ps.stage_order, ps.color
ORDER BY ps.stage_order;

-- ===============================================
-- SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '✅ CRM Schema Applied Successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables Created:';
    RAISE NOTICE '   - contacts (contact management)';
    RAISE NOTICE '   - contact_interactions (communication log)';
    RAISE NOTICE '   - tasks (task management)';
    RAISE NOTICE '   - pipeline_stages (sales pipeline)';
    RAISE NOTICE '   - contact_pipeline (pipeline tracking)';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Row Level Security: Enabled';
    RAISE NOTICE '📈 Performance Indexes: Created';
    RAISE NOTICE '🔄 Auto-update Triggers: Active';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to build CRM features!';
END $$;