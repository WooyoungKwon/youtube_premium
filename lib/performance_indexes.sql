-- 자주 사용되는 컬럼에 인덱스 추가 (성능 개선)
CREATE INDEX IF NOT EXISTS idx_members_request_id ON members(request_id) WHERE request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_members_deposit_status ON members(deposit_status);
CREATE INDEX IF NOT EXISTS idx_revenue_member_id ON revenue_records(member_id);

-- 복합 인덱스로 조회 성능 개선
CREATE INDEX IF NOT EXISTS idx_members_status_date ON members(deposit_status, payment_date);
