import { MemberRequest } from '@/types';
import { sql } from '@vercel/postgres';

// 데이터베이스 초기화 (첫 실행 시)
export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS member_requests (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        kakao_id VARCHAR(255),
        phone VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_email ON member_requests(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_status ON member_requests(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_created_at ON member_requests(created_at DESC)`;
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// 모든 신청 조회
export async function getAllRequests(): Promise<MemberRequest[]> {
  try {
    await initDatabase();
    const { rows } = await sql`
      SELECT 
        id,
        email,
        kakao_id as "kakaoId",
        phone,
        status,
        created_at as "createdAt"
      FROM member_requests
      ORDER BY created_at DESC
    `;
    
    return rows.map(row => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.createdAt.toISOString(),
    })) as MemberRequest[];
  } catch (error) {
    console.error('Get all requests error:', error);
    return [];
  }
}

// 신청 추가
export async function addRequest(email: string, kakaoId?: string, phone?: string): Promise<MemberRequest> {
  await initDatabase();
  
  // 이미 신청한 이메일인지 확인
  const { rows: existing } = await sql`
    SELECT id FROM member_requests WHERE email = ${email}
  `;
  
  if (existing.length > 0) {
    throw new Error('이미 신청한 이메일입니다.');
  }
  
  const id = Date.now().toString();
  const createdAt = new Date().toISOString();
  
  await sql`
    INSERT INTO member_requests (id, email, kakao_id, phone, status, created_at)
    VALUES (${id}, ${email}, ${kakaoId || null}, ${phone || null}, 'pending', ${createdAt})
  `;
  
  return {
    id,
    email,
    kakaoId,
    phone,
    status: 'pending',
    createdAt,
    updatedAt: createdAt,
  };
}

// 신청 상태 업데이트
export async function updateRequestStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<MemberRequest> {
  await initDatabase();
  
  const { rows } = await sql`
    UPDATE member_requests
    SET status = ${status}
    WHERE id = ${id}
    RETURNING 
      id,
      email,
      kakao_id as "kakaoId",
      phone,
      status,
      created_at as "createdAt"
  `;
  
  if (rows.length === 0) {
    throw new Error('신청을 찾을 수 없습니다.');
  }
  
  const row = rows[0];
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: new Date().toISOString(),
  } as MemberRequest;
}

// 신청 삭제
export async function deleteRequest(id: string): Promise<void> {
  await initDatabase();
  
  await sql`
    DELETE FROM member_requests
    WHERE id = ${id}
  `;
}
