import { MemberRequest } from '@/types';
import { Pool } from 'pg';

// Supabase pooled connection using pg
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 데이터베이스 초기화 (첫 실행 시)
export async function initDatabase() {
  try {
    // 회원 신청 테이블
    await client.sql`
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
    
    // Apple 계정 테이블
    await client.sql`
      CREATE TABLE IF NOT EXISTS apple_accounts (
        id VARCHAR(255) PRIMARY KEY,
        apple_email VARCHAR(255) NOT NULL UNIQUE,
        remaining_credit INTEGER DEFAULT 0,
        renewal_date DATE,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 기존 테이블에 last_updated 컬럼 추가 (마이그레이션)
    try {
      await client.sql`
        ALTER TABLE apple_accounts 
        ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `;
    } catch (error) {
      // 컬럼이 이미 존재하는 경우 무시
      console.log('last_updated column already exists or migration failed:', error);
    }

    // 기존 테이블에 renewal_date 컬럼 추가 (마이그레이션)
    try {
      await client.sql`
        ALTER TABLE apple_accounts 
        ADD COLUMN IF NOT EXISTS renewal_date DATE
      `;
    } catch (error) {
      // 컬럼이 이미 존재하는 경우 무시
      console.log('renewal_date column already exists or migration failed:', error);
    }
    
    // YouTube 계정 테이블
    await client.sql`
      CREATE TABLE IF NOT EXISTS youtube_accounts (
        id VARCHAR(255) PRIMARY KEY,
        apple_account_id VARCHAR(255) NOT NULL,
        youtube_email VARCHAR(255) NOT NULL,
        nickname VARCHAR(255),
        renewal_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (apple_account_id) REFERENCES apple_accounts(id) ON DELETE CASCADE
      )
    `;
    
    // 가입 회원 테이블 (깔끔한 스키마)
    // last_payment_date: 이전 결제일 (마지막으로 결제한 날짜)
    // payment_date: 다음 결제 예정일 (월 구독 갱신일)
    await client.sql`
      CREATE TABLE IF NOT EXISTS members (
        id VARCHAR(255) PRIMARY KEY,
        youtube_account_id VARCHAR(255) NOT NULL,
        request_id VARCHAR(255),
        nickname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        last_payment_date DATE,
        payment_date DATE NOT NULL,
        deposit_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (youtube_account_id) REFERENCES youtube_accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (request_id) REFERENCES member_requests(id) ON DELETE SET NULL
      )
    `;
    
    // 기존 테이블에 last_payment_date 컬럼 추가 (마이그레이션)
    try {
      await client.sql`
        ALTER TABLE members 
        ADD COLUMN IF NOT EXISTS last_payment_date DATE
      `;
    } catch (error) {
      // 컬럼이 이미 존재하는 경우 무시
      console.log('last_payment_date column already exists or migration failed:', error);
    }
    
    // join_date를 last_payment_date로 이름 변경 (이미 데이터가 있는 경우)
    try {
      await client.sql`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'members' AND column_name = 'join_date'
          ) AND NOT EXISTS (
            SELECT 1 FROM members WHERE last_payment_date IS NOT NULL LIMIT 1
          ) THEN
            UPDATE members SET last_payment_date = join_date WHERE last_payment_date IS NULL;
          END IF;
        END $$;
      `;
    } catch (error) {
      console.log('Migration from join_date to last_payment_date skipped or failed:', error);
    }
    
    // join_date 컬럼 완전히 삭제 (더 이상 사용하지 않음)
    try {
      await client.sql`
        ALTER TABLE members 
        DROP COLUMN IF EXISTS join_date
      `;
    } catch (error) {
      console.log('Drop join_date column failed:', error);
    }
    
    // 수익 기록 테이블 (누적 수익 관리)
    await client.sql`
      CREATE TABLE IF NOT EXISTS revenue_records (
        id VARCHAR(255) PRIMARY KEY,
        member_id VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL,
        months INTEGER NOT NULL,
        recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      )
    `;
    
    // WebAuthn 인증 정보 테이블 (Face ID, Touch ID 등)
    await client.sql`
      CREATE TABLE IF NOT EXISTS admin_credentials (
        id VARCHAR(255) PRIMARY KEY,
        credential_id TEXT NOT NULL UNIQUE,
        public_key TEXT NOT NULL,
        counter BIGINT NOT NULL DEFAULT 0,
        device_name VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP
      )
    `;
    
    // 인덱스 생성 (성능 최적화)
    await client.sql`CREATE INDEX IF NOT EXISTS idx_email ON member_requests(email)`;
    await client.sql`CREATE INDEX IF NOT EXISTS idx_status ON member_requests(status)`;
    await client.sql`CREATE INDEX IF NOT EXISTS idx_created_at ON member_requests(created_at DESC)`;
    await client.sql`CREATE INDEX IF NOT EXISTS idx_apple_account ON youtube_accounts(apple_account_id)`;
    await client.sql`CREATE INDEX IF NOT EXISTS idx_youtube_account ON members(youtube_account_id)`;
    await client.sql`CREATE INDEX IF NOT EXISTS idx_request ON members(request_id)`;
    await client.sql`CREATE INDEX IF NOT EXISTS idx_member_deposit ON members(deposit_status)`;
    await client.sql`CREATE INDEX IF NOT EXISTS idx_revenue_member ON revenue_records(member_id)`;
    await client.sql`CREATE INDEX IF NOT EXISTS idx_revenue_recorded_at ON revenue_records(recorded_at DESC)`;
    
    // 성능 최적화를 위한 추가 인덱스
    try {
      await client.sql`CREATE INDEX IF NOT EXISTS idx_members_status_date ON members(deposit_status, payment_date)`;
      await client.sql`CREATE INDEX IF NOT EXISTS idx_members_request_completed ON members(request_id, deposit_status) WHERE request_id IS NOT NULL`;
    } catch (error) {
      console.log('Additional indexes creation skipped:', error);
    }
    
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// 모든 신청 조회
export async function getAllRequests(): Promise<MemberRequest[]> {
  try {
    const { rows } = await client.sql`
      SELECT 
        mr.id,
        mr.email,
        mr.kakao_id as "kakaoId",
        mr.phone,
        mr.months,
        mr.depositor_name as "depositorName",
        mr.status,
        mr.created_at as "createdAt",
        CASE WHEN m.id IS NOT NULL THEN true ELSE false END as "isRegistered"
      FROM member_requests mr
      LEFT JOIN members m ON mr.id = m.request_id
      ORDER BY mr.created_at DESC
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
    const { rows } = await client.sql`
      SELECT 
        id, 
        apple_email as "appleEmail", 
        remaining_credit as "remainingCredit",
        renewal_date as "renewalDate",
        last_updated as "lastUpdated",
        created_at as "createdAt"
      FROM apple_accounts
      ORDER BY created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Get apple accounts error:', error);
    return [];
  }
}

export async function addAppleAccount(appleEmail: string, remainingCredit?: number, renewalDate?: string) {
  try {
    console.log('addAppleAccount called with:', { appleEmail, remainingCredit, renewalDate });
    const id = Date.now().toString();
    
    console.log('Inserting into database with id:', id);
    await client.sql`
      INSERT INTO apple_accounts (id, apple_email, remaining_credit, renewal_date, created_at)
      VALUES (${id}, ${appleEmail}, ${remainingCredit || 0}, ${renewalDate || null}, CURRENT_TIMESTAMP)
    `;
    
    const result = { id, appleEmail, remainingCredit: remainingCredit || 0, renewalDate };
    console.log('Successfully created account:', result);
    return result;
  } catch (error) {
    console.error('Error in addAppleAccount:', error);
    throw error;
  }
}

export async function updateAppleAccount(id: string, appleEmail: string, remainingCredit: number, renewalDate?: string) {
  await client.sql`
    UPDATE apple_accounts
    SET apple_email = ${appleEmail}, remaining_credit = ${remainingCredit}, renewal_date = ${renewalDate || null}, last_updated = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;
}

export async function deleteAppleAccount(id: string) {
  await client.sql`DELETE FROM apple_accounts WHERE id = ${id}`;
}

// ===== YouTube 계정 관리 =====

export async function getYoutubeAccountsByApple(appleAccountId: string) {
  try {
    const { rows } = await client.sql`
      SELECT 
        id, 
        apple_account_id as "appleAccountId",
        youtube_email as "youtubeEmail",
        nickname,
        renewal_date as "renewalDate",
        created_at as "createdAt"
      FROM youtube_accounts
      WHERE apple_account_id = ${appleAccountId}
      ORDER BY created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Get youtube accounts error:', error);
    return [];
  }
}

export async function addYoutubeAccount(appleAccountId: string, youtubeEmail: string, nickname?: string, renewalDate?: string) {
  const id = Date.now().toString();
  await client.sql`
    INSERT INTO youtube_accounts (id, apple_account_id, youtube_email, nickname, renewal_date, created_at)
    VALUES (${id}, ${appleAccountId}, ${youtubeEmail}, ${nickname || null}, ${renewalDate || null}, CURRENT_TIMESTAMP)
  `;
  return { id, appleAccountId, youtubeEmail, nickname, renewalDate };
}

export async function updateYoutubeAccount(id: string, youtubeEmail: string, nickname?: string, renewalDate?: string) {
  await client.sql`
    UPDATE youtube_accounts
    SET 
      youtube_email = ${youtubeEmail},
      nickname = ${nickname || null},
      renewal_date = ${renewalDate || null}
    WHERE id = ${id}
  `;
}

export async function deleteYoutubeAccount(id: string) {
  await client.sql`DELETE FROM youtube_accounts WHERE id = ${id}`;
}

// ===== 회원 관리 =====

export async function getMembersByYoutube(youtubeAccountId: string) {
  try {
    const { rows } = await client.sql`
      SELECT 
        id,
        youtube_account_id as "youtubeAccountId",
        request_id as "requestId",
        nickname,
        email,
        name,
        TO_CHAR(last_payment_date, 'YYYY-MM-DD') as "lastPaymentDate",
        TO_CHAR(payment_date, 'YYYY-MM-DD') as "paymentDate",
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
  lastPaymentDate: string,
  paymentDate: string,
  depositStatus: string,
  requestId?: string
) {
  const id = Date.now().toString();
  
  console.log('addMember called with:', {
    youtubeAccountId,
    nickname,
    email,
    name,
    lastPaymentDate,
    paymentDate,
    depositStatus,
    requestId
  });

  // 날짜는 이미 YYYY-MM-DD 형식으로 전달되어야 함 (호출하는 쪽에서 처리)
  const validLastPaymentDate = lastPaymentDate;
  const validPaymentDate = paymentDate;

  // 날짜 형식 검증
  if (!/^\d{4}-\d{2}-\d{2}$/.test(validLastPaymentDate)) {
    throw new Error(`Invalid lastPaymentDate format: ${validLastPaymentDate}. Expected YYYY-MM-DD`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(validPaymentDate)) {
    throw new Error(`Invalid paymentDate format: ${validPaymentDate}. Expected YYYY-MM-DD`);
  }
  
  try {
    await client.sql`
      INSERT INTO members (
        id, youtube_account_id, request_id, nickname, email, name,
        last_payment_date, payment_date, deposit_status, created_at
      )
      VALUES (
        ${id}, ${youtubeAccountId}, ${requestId || null}, ${nickname},
        ${email}, ${name}, ${validLastPaymentDate}::date, ${validPaymentDate}::date, ${depositStatus},
        CURRENT_TIMESTAMP
      )
    `;
    console.log('Member inserted successfully with id:', id);
  } catch (error) {
    console.error('SQL Insert Error:', error);
    throw error;
  }
  
  return { id, youtubeAccountId, nickname, email, name, lastPaymentDate: validLastPaymentDate, paymentDate: validPaymentDate, depositStatus };
}

export async function updateMemberDepositStatus(id: string, depositStatus: string) {
  await client.sql`
    UPDATE members
    SET deposit_status = ${depositStatus}
    WHERE id = ${id}
  `;
}

export async function updateMember(
  id: string,
  nickname: string,
  email: string,
  name: string,
  lastPaymentDate: string,
  paymentDate: string,
  depositStatus: string
) {
  // 날짜 문자열을 YYYY-MM-DD 형식으로 확실하게 변환
  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    // 이미 YYYY-MM-DD 형식이면 그대로 사용
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    // ISO 형식이면 날짜 부분만 추출
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    return dateStr;
  };

  const formattedLastPaymentDate = formatDate(lastPaymentDate);
  const formattedPaymentDate = formatDate(paymentDate);

  await client.sql`
    UPDATE members
    SET 
      nickname = ${nickname},
      email = ${email},
      name = ${name},
      last_payment_date = ${formattedLastPaymentDate}::date,
      payment_date = ${formattedPaymentDate}::date,
      deposit_status = ${depositStatus}
    WHERE id = ${id}
  `;
}

export async function deleteMember(id: string) {
  await client.sql`DELETE FROM members WHERE id = ${id}`;
}

// 신청 추가
export async function addRequest(
  email: string, 
  kakaoId?: string, 
  phone?: string, 
  months?: number, 
  depositorName?: string
): Promise<MemberRequest> {
  
  // 이미 신청한 이메일인지 확인
  const { rows: existing } = await client.sql`
    SELECT id FROM member_requests WHERE email = ${email}
  `;
  
  if (existing.length > 0) {
    throw new Error('이미 신청한 이메일입니다.');
  }
  
  const id = Date.now().toString();
  const createdAt = new Date().toISOString();
  
  await client.sql`
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
  
  const { rows } = await client.sql`
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
  
  await client.sql`
    DELETE FROM member_requests
    WHERE id = ${id}
  `;
}

// 모든 회원을 Apple, YouTube 계정 정보와 함께 조회
export async function getAllMembersWithDetails() {
  
  const { rows } = await client.sql`
    SELECT 
      m.id,
      m.nickname,
      m.email,
      m.name,
      TO_CHAR(m.last_payment_date, 'YYYY-MM-DD') as last_payment_date,
      TO_CHAR(m.payment_date, 'YYYY-MM-DD') as payment_date,
      m.deposit_status,
      m.created_at,
      y.youtube_email,
      y.nickname as youtube_nickname,
      a.apple_email
    FROM members m
    LEFT JOIN youtube_accounts y ON m.youtube_account_id = y.id
    LEFT JOIN apple_accounts a ON y.apple_account_id = a.id
    ORDER BY m.payment_date DESC, m.created_at DESC
  `;
  
  return rows.map(row => ({
    id: row.id,
    nickname: row.nickname,
    email: row.email,
    name: row.name,
    lastPaymentDate: row.last_payment_date,
    paymentDate: row.payment_date,
    depositStatus: row.deposit_status,
    createdAt: row.created_at.toISOString(),
    youtubeEmail: row.youtube_email,
    youtubeNickname: row.youtube_nickname,
    appleEmail: row.apple_email,
  }));
}

// ===== 수익 기록 관리 =====

// 수익 기록 추가
export async function addRevenueRecord(
  memberId: string,
  amount: number,
  months: number,
  description?: string
) {
  const id = Date.now().toString();
  
  await client.sql`
    INSERT INTO revenue_records (id, member_id, amount, months, description, recorded_at)
    VALUES (${id}, ${memberId}, ${amount}, ${months}, ${description || ''}, CURRENT_TIMESTAMP)
  `;
  
  return { id, memberId, amount, months, description };
}

// 전체 누적 수익 조회
export async function getTotalRevenue() {
  
  const { rows } = await client.sql`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM revenue_records
  `;
  
  return parseInt(rows[0].total);
}
