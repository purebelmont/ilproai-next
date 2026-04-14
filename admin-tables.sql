-- Supabase SQL Editor에서 실행
-- 1. 공지사항 테이블
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active announcements" ON announcements FOR SELECT USING (active = true);
CREATE POLICY "Authenticated can insert announcements" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update announcements" ON announcements FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete announcements" ON announcements FOR DELETE USING (true);

-- 2. API 사용 로그 테이블
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  endpoint TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  cost NUMERIC(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert api_logs" ON api_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read api_logs" ON api_logs FOR SELECT USING (true);

-- 3. profiles 테이블에 컬럼 추가 (이미 있으면 무시됨)
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
EXCEPTION WHEN others THEN NULL;
END $$;
