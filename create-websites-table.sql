-- Run this in Supabase Dashboard > SQL Editor

CREATE TABLE websites (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    template TEXT DEFAULT 'restaurant',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    content JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_websites_slug ON websites(slug);
CREATE INDEX idx_websites_user_id ON websites(user_id);

ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

-- Owner can do everything with their own sites
CREATE POLICY "Users can view own websites" ON websites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own websites" ON websites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own websites" ON websites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own websites" ON websites FOR DELETE USING (auth.uid() = user_id);

-- Anyone can view published sites (for the public page)
CREATE POLICY "Anyone can view published websites" ON websites FOR SELECT USING (status = 'published');
