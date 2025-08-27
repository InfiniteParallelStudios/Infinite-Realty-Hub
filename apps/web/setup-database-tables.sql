-- =====================================================
-- INFINITE REALTY HUB - DATABASE SETUP SCRIPT
-- =====================================================
-- This script creates all required database tables for the market data system

-- 1. CREATE MARKET DATA CACHE TABLE
-- This table caches market data API responses to reduce API calls
CREATE TABLE IF NOT EXISTS market_data_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  region_type TEXT NOT NULL CHECK (region_type IN ('city', 'zipcode', 'county', 'state')),
  data JSONB,
  last_fetched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(region, region_type)
);

-- 2. CREATE NEWSLETTER PREFERENCES TABLE  
-- This table stores user preferences for newsletter generation
CREATE TABLE IF NOT EXISTS newsletter_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  regions TEXT[] DEFAULT '{}',
  property_types TEXT[] DEFAULT '{"residential"}',
  price_range JSONB DEFAULT NULL,
  include_market_trends BOOLEAN DEFAULT true,
  include_new_listings BOOLEAN DEFAULT true,
  include_inventory_updates BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. CREATE CONTACTS TABLE (if it doesn't exist)
-- This table stores user contacts for newsletter distribution
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'unsubscribed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- 4. CREATE API USAGE TRACKING TABLE
-- This table tracks API usage for rate limiting
CREATE TABLE IF NOT EXISTS api_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('realtor', 'rentcast', 'public')),
  endpoint TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  date_used DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX(provider, date_used)
);

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_market_data_cache_region ON market_data_cache(region, region_type);
CREATE INDEX IF NOT EXISTS idx_market_data_cache_expires ON market_data_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_preferences_user ON newsletter_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_api_usage_provider_date ON api_usage_log(provider, date_used);

-- 6. CREATE UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. CREATE TRIGGERS FOR UPDATED_AT
DROP TRIGGER IF EXISTS update_market_data_cache_updated_at ON market_data_cache;
CREATE TRIGGER update_market_data_cache_updated_at
    BEFORE UPDATE ON market_data_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletter_preferences_updated_at ON newsletter_preferences;
CREATE TRIGGER update_newsletter_preferences_updated_at
    BEFORE UPDATE ON newsletter_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. INSERT SAMPLE DATA FOR TESTING
-- Sample newsletter preferences
INSERT INTO newsletter_preferences (user_id, frequency, regions, property_types) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'weekly', ARRAY['New York, NY', 'Los Angeles, CA'], ARRAY['residential']),
  ('00000000-0000-0000-0000-000000000002', 'monthly', ARRAY['Miami, FL'], ARRAY['residential', 'commercial'])
ON CONFLICT (user_id) DO NOTHING;

-- Sample contacts  
INSERT INTO contacts (user_id, first_name, last_name, email, phone, address)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'John', 'Smith', 'john.smith@example.com', '555-0101', 'New York, NY'),
  ('00000000-0000-0000-0000-000000000001', 'Sarah', 'Johnson', 'sarah.johnson@example.com', '555-0102', 'Los Angeles, CA'),
  ('00000000-0000-0000-0000-000000000002', 'Mike', 'Davis', 'mike.davis@example.com', '555-0103', 'Miami, FL')
ON CONFLICT (user_id, email) DO NOTHING;

-- 9. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE newsletter_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for newsletter_preferences
DROP POLICY IF EXISTS "Users can view own newsletter preferences" ON newsletter_preferences;
CREATE POLICY "Users can view own newsletter preferences" ON newsletter_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own newsletter preferences" ON newsletter_preferences;
CREATE POLICY "Users can update own newsletter preferences" ON newsletter_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for contacts
DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;
CREATE POLICY "Users can view own contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own contacts" ON contacts;
CREATE POLICY "Users can manage own contacts" ON contacts
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify tables were created successfully:

-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('market_data_cache', 'newsletter_preferences', 'contacts', 'api_usage_log');

-- SELECT count(*) as newsletter_prefs FROM newsletter_preferences;
-- SELECT count(*) as contacts FROM contacts;

COMMENT ON TABLE market_data_cache IS 'Caches market data API responses with 7-day expiration';
COMMENT ON TABLE newsletter_preferences IS 'Stores user preferences for weekly newsletters';  
COMMENT ON TABLE contacts IS 'User contact lists for newsletter distribution';
COMMENT ON TABLE api_usage_log IS 'Tracks API usage for rate limiting and monitoring';