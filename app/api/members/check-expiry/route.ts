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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일로 멤버 찾기
    const result = await pool.query(
      'SELECT email, payment_date FROM members WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '해당 이메일로 등록된 멤버십을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const member = result.rows[0];

    if (!member.payment_date) {
      return NextResponse.json(
        { error: '만료일 정보가 없습니다. 관리자에게 문의해주세요.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      email: member.email,
      expiryDate: member.payment_date,
    });
  } catch (error) {
    console.error('Error checking expiry date:', error);
    return NextResponse.json(
      { error: '만료일 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
