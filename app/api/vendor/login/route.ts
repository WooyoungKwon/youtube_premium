import { NextResponse } from 'next/server';
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

// POST: 판매자 로그인 (이메일로 확인)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 판매자 확인
    const result = await pool.query(
      'SELECT * FROM vendors WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '존재하지 않는 이메일입니다.' },
        { status: 404 }
      );
    }

    const vendor = result.rows[0];

    if (!vendor.is_active) {
      return NextResponse.json(
        { error: '비활성화된 계정입니다. 관리자에게 문의하세요.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      rating: parseFloat(vendor.rating) || 5.0,
      completedBookings: vendor.completed_bookings || 0,
      totalEarnings: parseFloat(vendor.total_earnings) || 0,
    });
  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json(
      { error: '로그인에 실패했습니다.' },
      { status: 500 }
    );
  }
}
