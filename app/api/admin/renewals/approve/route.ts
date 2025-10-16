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

// 갱신 요청 승인
export async function POST(request: NextRequest) {
  try {
    const { memberId } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { error: '회원 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 회원 정보 조회
    const memberResult = await pool.query(
      'SELECT payment_date, renew_months FROM members WHERE id = $1',
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: '회원을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const member = memberResult.rows[0];
    const currentPaymentDate = new Date(member.payment_date);
    const renewMonths = member.renew_months || 0;

    // 갱신 개월수만큼 날짜 연장
    const newPaymentDate = new Date(currentPaymentDate);
    newPaymentDate.setMonth(newPaymentDate.getMonth() + renewMonths);

    // 회원 정보 업데이트: 만료일 연장, 갱신 상태 및 메시지 초기화
    await pool.query(
      `UPDATE members
       SET payment_date = $1,
           last_payment_date = $2,
           will_renew = false,
           renew_months = null,
           renewal_message = null
       WHERE id = $3`,
      [newPaymentDate.toISOString().split('T')[0], new Date().toISOString().split('T')[0], memberId]
    );

    return NextResponse.json({
      success: true,
      newPaymentDate: newPaymentDate.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error approving renewal:', error);
    return NextResponse.json(
      { error: '갱신 승인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
