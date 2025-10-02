import { MemberRequest } from '@/types';
import { sql } from '@vercel/postgres';

// 데이터베이스 초기화 (첫 실행 시)
export async function initDatabase() {
  try {
    // 회원 신청 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS member_requests (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        kakao_id VARCHAR(255),
        phone VARCHAR(50),
        months INTEGER,
        depositor_name VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_email ON member_requests(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_status ON member_requests(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_created_at ON member_requests(created_at DESC)`;
    
    // Apple 계정 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS apple_accounts (
        id VARCHAR(255) PRIMARY KEY,
        apple_email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // YouTube 계정 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS youtube_accounts (
        id VARCHAR(255) PRIMARY KEY,
        apple_account_id VARCHAR(255) NOT NULL,
        youtube_email VARCHAR(255) NOT NULL,
        slot_number INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (apple_account_id) REFERENCES apple_accounts(id) ON DELETE CASCADE
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_apple_account ON youtube_accounts(apple_account_id)`;
    
    // 가입 회원 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id VARCHAR(255) PRIMARY KEY,
        youtube_account_id VARCHAR(255) NOT NULL,
        request_id VARCHAR(255),
        user_email VARCHAR(255) NOT NULL,
        kakao_id VARCHAR(255),
        phone VARCHAR(50),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (youtube_account_id) REFERENCES youtube_accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (request_id) REFERENCES member_requests(id) ON DELETE SET NULL
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_youtube_account ON members(youtube_account_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_request ON members(request_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_member_status ON members(status)`;
    
    // 기존 테이블에 컬럼 추가 (이미 있으면 무시)
    try {
      await sql`ALTER TABLE member_requests ADD COLUMN IF NOT EXISTS months INTEGER`;
      await sql`ALTER TABLE member_requests ADD COLUMN IF NOT EXISTS depositor_name VARCHAR(255)`;
    } catch (e) {
      // 컬럼이 이미 존재하면 무시
    }
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
        months,
        depositor_name as "depositorName",
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

// ===== Apple 계정 관리 =====

export async function getAllAppleAccounts() {
  try {
    await initDatabase();
    const { rows } = await sql`
      SELECT id, apple_email as "appleEmail", created_at as "createdAt"
      FROM apple_accounts
      ORDER BY created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Get apple accounts error:', error);
    return [];
  }
}

export async function addAppleAccount(appleEmail: string, password?: string) {
  await initDatabase();
  const id = Date.now().toString();
  await sql`
    INSERT INTO apple_accounts (id, apple_email, password, created_at)
    VALUES (${id}, ${appleEmail}, ${password || null}, CURRENT_TIMESTAMP)
  `;
  return { id, appleEmail };
}

export async function deleteAppleAccount(id: string) {
  await sql`DELETE FROM apple_accounts WHERE id = ${id}`;
}

// ===== YouTube 계정 관리 =====

export async function getYoutubeAccountsByApple(appleAccountId: string) {
  try {
    const { rows } = await sql`
      SELECT 
        id, 
        apple_account_id as "appleAccountId",
        youtube_email as "youtubeEmail",
        slot_number as "slotNumber",
        created_at as "createdAt"
      FROM youtube_accounts
      WHERE apple_account_id = ${appleAccountId}
      ORDER BY slot_number ASC
    `;
    return rows;
  } catch (error) {
    console.error('Get youtube accounts error:', error);
    return [];
  }
}

export async function addYoutubeAccount(appleAccountId: string, youtubeEmail: string, slotNumber: number) {
  const id = Date.now().toString();
  await sql`
    INSERT INTO youtube_accounts (id, apple_account_id, youtube_email, slot_number, created_at)
    VALUES (${id}, ${appleAccountId}, ${youtubeEmail}, ${slotNumber}, CURRENT_TIMESTAMP)
  `;
  return { id, appleAccountId, youtubeEmail, slotNumber };
}

export async function deleteYoutubeAccount(id: string) {
  await sql`DELETE FROM youtube_accounts WHERE id = ${id}`;
}

// ===== 회원 관리 =====

export async function getMembersByYoutube(youtubeAccountId: string) {
  try {
    const { rows } = await sql`
      SELECT 
        id,
        youtube_account_id as "youtubeAccountId",
        request_id as "requestId",
        user_email as "userEmail",
        kakao_id as "kakaoId",
        phone,
        start_date as "startDate",
        end_date as "endDate",
        status,
        created_at as "createdAt"
      FROM members
      WHERE youtube_account_id = ${youtubeAccountId}
      ORDER BY created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Get members error:', error);
    return [];
  }
}

export async function addMember(
  youtubeAccountId: string,
  userEmail: string,
  startDate: string,
  endDate: string,
  requestId?: string,
  kakaoId?: string,
  phone?: string
) {
  const id = Date.now().toString();
  await sql`
    INSERT INTO members (
      id, youtube_account_id, request_id, user_email, kakao_id, phone,
      start_date, end_date, status, created_at
    )
    VALUES (
      ${id}, ${youtubeAccountId}, ${requestId || null}, ${userEmail},
      ${kakaoId || null}, ${phone || null}, ${startDate}, ${endDate},
      'active', CURRENT_TIMESTAMP
    )
  `;
  return { id, youtubeAccountId, userEmail, startDate, endDate };
}

export async function updateMemberStatus(id: string, status: string) {
  await sql`
    UPDATE members
    SET status = ${status}
    WHERE id = ${id}
  `;
}

export async function deleteMember(id: string) {
  await sql`DELETE FROM members WHERE id = ${id}`;
}

// 신청 추가
export async function addRequest(
  email: string, 
  kakaoId?: string, 
  phone?: string, 
  months?: number, 
  depositorName?: string
): Promise<MemberRequest> {
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
    INSERT INTO member_requests (id, email, kakao_id, phone, months, depositor_name, status, created_at)
    VALUES (${id}, ${email}, ${kakaoId || null}, ${phone || null}, ${months || null}, ${depositorName || null}, 'pending', ${createdAt})
  `;
  
  return {
    id,
    email,
    kakaoId,
    phone,
    months,
    depositorName,
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
      months,
      depositor_name as "depositorName",
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
