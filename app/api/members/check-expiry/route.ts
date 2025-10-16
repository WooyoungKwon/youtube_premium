import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const connectionString = (process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '')
  .replace('&&', '&')
  .replace('sslmode=require', '');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// 갱신 컬럼 추가 마이그레이션
async function ensureRenewalColumns() {
  try {
    await pool.query(`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS will_renew BOOLEAN DEFAULT FALSE
    `);
    await pool.query(`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS renew_months INTEGER DEFAULT 1
    `);
    await pool.query(`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS is_auto_payment BOOLEAN DEFAULT FALSE
    `);
    await pool.query(`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS renewal_message TEXT
    `);
  } catch (error) {
    console.log('Renewal columns migration:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // 갱신 컬럼 확인 및 추가
    await ensureRenewalColumns();

    const { searchParams } = new URL(request.url);
    const emailInput = searchParams.get('email');

    if (!emailInput) {
      return NextResponse.json(
        { error: '이메일 또는 아이디를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일로 멤버 찾기 (부분 매칭 지원)
    // 전체 이메일이 입력된 경우: 정확히 일치
    // 아이디만 입력된 경우: 패턴 매칭 (예: "user1234" -> "user1234@%")
    let result;

    if (emailInput.includes('@')) {
      // 전체 이메일이 입력된 경우
      result = await pool.query(
        'SELECT id, email, payment_date, will_renew, renew_months, is_auto_payment FROM members WHERE email = $1',
        [emailInput]
      );
    } else {
      // 아이디만 입력된 경우 (@ 앞부분으로 검색)
      result = await pool.query(
        'SELECT id, email, payment_date, will_renew, renew_months, is_auto_payment FROM members WHERE email LIKE $1',
        [`${emailInput}@%`]
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '해당 이메일로 등록된 멤버십을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 여러 결과가 있으면 첫 번째 결과 사용
    const member = result.rows[0];

    if (!member.payment_date) {
      return NextResponse.json(
        { error: '만료일 정보가 없습니다. 관리자에게 문의해주세요.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: member.id,
      email: member.email,
      expiryDate: member.payment_date,
      willRenew: member.will_renew || false,
      renewMonths: member.renew_months || 1,
      isAutoPayment: member.is_auto_payment || false,
    });
  } catch (error) {
    console.error('Error checking expiry date:', error);
    return NextResponse.json(
      { error: '만료일 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
