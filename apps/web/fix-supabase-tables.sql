-- Create missing market_data_cache table
CREATE TABLE IF NOT EXISTS market_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  INDEX idx_market_data_cache_key ON market_data_cache(cache_key),
  INDEX idx_market_data_cache_expires ON market_data_cache(expires_at)
);

-- Create missing newsletter_preferences table
CREATE TABLE IF NOT EXISTS newsletter_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  radius_miles INTEGER DEFAULT 5 CHECK (radius_miles > 0 AND radius_miles <= 100),
  property_types TEXT[] DEFAULT ARRAY['Single Family', 'Condo'],
  price_range_min INTEGER DEFAULT 0,
  price_range_max INTEGER DEFAULT 10000000,
  include_market_insights BOOLEAN DEFAULT true,
  include_property_alerts BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email),
  INDEX idx_newsletter_prefs_user ON newsletter_preferences(user_id),
  INDEX idx_newsletter_prefs_active ON newsletter_preferences(is_active)
);

-- Enable RLS (Row Level Security)
ALTER TABLE market_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for market_data_cache (public read, authenticated write)
CREATE POLICY "Allow public read access to market_data_cache"
  ON market_data_cache FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated write access to market_data_cache"
  ON market_data_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update access to market_data_cache"
  ON market_data_cache FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for newsletter_preferences (user can only access their own)
CREATE POLICY "Users can view own newsletter preferences"
  ON newsletter_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own newsletter preferences"
  ON newsletter_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own newsletter preferences"
  ON newsletter_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own newsletter preferences"
  ON newsletter_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);