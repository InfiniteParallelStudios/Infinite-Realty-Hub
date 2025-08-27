-- Create leads table for pipeline management
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
        'new', 
        'contacted', 
        'qualified', 
        'presentation', 
        'negotiation', 
        'contract', 
        'closed_won', 
        'closed_lost'
    )),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    estimated_value DECIMAL(12,2) DEFAULT 0,
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy so users can only see their own leads
CREATE POLICY "Users can only access their own leads" ON public.leads
    FOR ALL USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.leads TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Insert some sample data for testing (optional - the app will create default leads)
-- Uncomment the lines below if you want to test with sample data
-- INSERT INTO public.leads (user_id, contact_name, contact_email, contact_phone, status, priority, estimated_value, probability)
-- SELECT 
--     auth.uid(),
--     'Sample Lead',
--     'sample@example.com',
--     '(555) 123-4567',
--     'new',
--     'high',
--     500000,
--     30
-- WHERE auth.uid() IS NOT NULL;