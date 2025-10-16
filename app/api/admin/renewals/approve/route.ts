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

    // 갱신 개월수만큼 다음 결제일 연장
    const newPaymentDate = new Date(currentPaymentDate);
    newPaymentDate.setMonth(newPaymentDate.getMonth() + renewMonths);

    // 갱신 금액 계산
    const prices: { [key: number]: number } = {
      1: 4000,
      2: 8000,
      3: 12000,
      6: 23000,
      12: 45000
    };
    const renewalAmount = prices[renewMonths] || renewMonths * 4000;

    // 회원 정보 업데이트:
    // - last_payment_date: 오늘 (갱신 결제한 날)
    // - payment_date: 기존 다음 결제일 + 갱신 개월 수
    // - deposit_status: 완료
    await pool.query(
      `UPDATE members
       SET payment_date = $1,
           last_payment_date = $2,
           will_renew = false,
           renew_months = null,
           renewal_message = null,
           deposit_status = '완료'
       WHERE id = $3`,
      [newPaymentDate.toISOString().split('T')[0], new Date().toISOString().split('T')[0], memberId]
    );

    // 수익 기록 추가
    const revenueId = Date.now().toString();
    await pool.query(
      `INSERT INTO revenue_records (id, member_id, amount, months, description, recorded_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [revenueId, memberId, renewalAmount, renewMonths, '갱신']
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
