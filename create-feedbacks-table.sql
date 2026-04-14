-- Supabase에서 실행: feedbacks 테이블 생성
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  category TEXT DEFAULT 'general',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 누구나 피드백 삽입 가능
CREATE POLICY "Users can insert feedbacks" ON feedbacks FOR INSERT WITH CHECK (true);

-- 본인 피드백만 조회
CREATE POLICY "Users can view own feedbacks" ON feedbacks FOR SELECT USING (auth.uid() = user_id);

-- 관리자는 전체 조회 (service role key 사용 시)
