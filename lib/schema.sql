-- YouTube Premium 신청 테이블
CREATE TABLE IF NOT EXISTS member_requests (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  kakao_id VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_email ON member_requests(email);
CREATE INDEX IF NOT EXISTS idx_status ON member_requests(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON member_requests(created_at DESC);
