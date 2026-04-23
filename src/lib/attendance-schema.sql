-- 학생 테이블
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  class_name TEXT DEFAULT '1반',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 출석 테이블
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  class_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  date DATE NOT NULL,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own students"
  ON students FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own attendance"
  ON attendance FOR ALL USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);
