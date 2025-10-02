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
        nickname VARCHAR(255),
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
        nickname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        join_date DATE NOT NULL,
        payment_date DATE NOT NULL,
        deposit_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (youtube_account_id) REFERENCES youtube_accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (request_id) REFERENCES member_requests(id) ON DELETE SET NULL
      )
    `;
    
    // 기존 테이블에 컬럼 추가 (이미 있으면 무시) - 인덱스 생성 전에 먼저 실행
    try {
      await sql`ALTER TABLE member_requests ADD COLUMN IF NOT EXISTS months INTEGER`;
      await sql`ALTER TABLE member_requests ADD COLUMN IF NOT EXISTS depositor_name VARCHAR(255)`;
      await sql`ALTER TABLE youtube_accounts ADD COLUMN IF NOT EXISTS nickname VARCHAR(255)`;
      
      // members 테이블 마이그레이션 (이전 스키마 → 새 스키마)
      await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS nickname VARCHAR(255)`;
      await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS email VARCHAR(255)`;
      await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS name VARCHAR(255)`;
      await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS join_date DATE`;
      await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS payment_date DATE`;
      await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS deposit_status VARCHAR(50) DEFAULT 'pending'`;
      
      // 기존 컬럼의 NOT NULL 제약조건 제거
      await sql`ALTER TABLE members ALTER COLUMN user_email DROP NOT NULL`;
      await sql`ALTER TABLE members ALTER COLUMN start_date DROP NOT NULL`;
      await sql`ALTER TABLE members ALTER COLUMN end_date DROP NOT NULL`;
      
      // 기존 컬럼 삭제는 데이터 손실 위험이 있으므로 나중에 수동으로 처리
      // DROP COLUMN user_email, kakao_id, phone, start_date, end_date, status
    } catch (e) {
      // 컬럼이 이미 존재하면 무시
      console.log('Column migration:', e);
    }
    
    // 인덱스 생성 (컬럼 추가 후)
    await sql`CREATE INDEX IF NOT EXISTS idx_youtube_account ON members(youtube_account_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_request ON members(request_id)`;
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_member_deposit ON members(deposit_status)`;
    } catch (e) {
      // 인덱스가 이미 존재하면 무시
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
    await initDatabase();
    const { rows } = await sql`
      SELECT 
        id, 
        apple_account_id as "appleAccountId",
        youtube_email as "youtubeEmail",
        nickname,
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

export async function addYoutubeAccount(appleAccountId: string, youtubeEmail: string, slotNumber: number, nickname?: string) {
  await initDatabase();
  const id = Date.now().toString();
  await sql`
    INSERT INTO youtube_accounts (id, apple_account_id, youtube_email, nickname, slot_number, created_at)
    VALUES (${id}, ${appleAccountId}, ${youtubeEmail}, ${nickname || null}, ${slotNumber}, CURRENT_TIMESTAMP)
  `;
  return { id, appleAccountId, youtubeEmail, nickname, slotNumber };
}

export async function deleteYoutubeAccount(id: string) {
  await sql`DELETE FROM youtube_accounts WHERE id = ${id}`;
}

// ===== 회원 관리 =====

export async function getMembersByYoutube(youtubeAccountId: string) {
  try {
    await initDatabase();
    const { rows } = await sql`
      SELECT 
        id,
        youtube_account_id as "youtubeAccountId",
        request_id as "requestId",
        nickname,
        email,
        name,
        join_date as "joinDate",
        payment_date as "paymentDate",
        deposit_status as "depositStatus",
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
  nickname: string,
  email: string,
  name: string,
  joinDate: string,
  paymentDate: string,
  depositStatus: string,
  requestId?: string
) {
  await initDatabase();
  const id = Date.now().toString();
  await sql`
    INSERT INTO members (
      id, youtube_account_id, request_id, nickname, email, name,
      join_date, payment_date, deposit_status, created_at
    )
    VALUES (
      ${id}, ${youtubeAccountId}, ${requestId || null}, ${nickname},
      ${email}, ${name}, ${joinDate}, ${paymentDate}, ${depositStatus},
      CURRENT_TIMESTAMP
    )
  `;
  return { id, youtubeAccountId, nickname, email, name, joinDate, paymentDate, depositStatus };
}

export async function updateMemberDepositStatus(id: string, depositStatus: string) {
  await sql`
    UPDATE members
    SET deposit_status = ${depositStatus}
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
