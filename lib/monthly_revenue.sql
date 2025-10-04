-- 월별 수익 기록 테이블
CREATE TABLE IF NOT EXISTS monthly_revenue (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL,
  month INT NOT NULL,
  member_count INT NOT NULL,
  revenue INT NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(year, month)
);

-- 인덱스 생성
CREATE INDEX idx_monthly_revenue_year_month ON monthly_revenue(year, month);
