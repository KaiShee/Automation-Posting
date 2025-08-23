-- Step 1: Create tables first
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  caption TEXT NOT NULL,
  image_url TEXT NOT NULL,
  share TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  app TEXT,
  campaign_id TEXT NOT NULL,
  scan TEXT,
  meta JSONB DEFAULT '{}',
  ip INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_id ON campaigns(id);
CREATE INDEX IF NOT EXISTS idx_events_campaign_id ON events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Step 3: Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies
DROP POLICY IF EXISTS "Allow public read access" ON campaigns;
CREATE POLICY "Allow public read access" ON campaigns
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role full access" ON campaigns;
CREATE POLICY "Allow service role full access" ON campaigns
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow service role full access" ON events;
CREATE POLICY "Allow service role full access" ON events
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow public insert" ON events;
CREATE POLICY "Allow public insert" ON events
  FOR INSERT WITH CHECK (true);

-- Step 5: Create timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Create trigger (now tables exist)
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON campaigns 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Step 8: Insert demo campaign
INSERT INTO campaigns (id, name, caption, image_url, share) 
VALUES (
  'demo',
  'Demo Campaign',
  'Loving this! #YourBrand #Malaysia',
  'https://picsum.photos/seed/demo/1080/1350',
  ARRAY['instagram', 'facebook', 'whatsapp', 'tiktok', 'xhs']
) ON CONFLICT (id) DO NOTHING;
