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

export async function POST(request: NextRequest) {
  try {
    const { email, willRenew, renewMonths, isAutoPayment, renewalMessage } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (typeof willRenew !== 'boolean') {
      return NextResponse.json(
        { error: '갱신 여부를 선택해주세요.' },
        { status: 400 }
      );
    }

    if (willRenew && (!renewMonths || renewMonths < 1)) {
      return NextResponse.json(
        { error: '갱신 기간을 선택해주세요.' },
        { status: 400 }
      );
    }

    // 회원 갱신 정보 업데이트 (자동이체 및 메시지 포함)
    const result = await pool.query(
      'UPDATE members SET will_renew = $1, renew_months = $2, is_auto_payment = $3, renewal_message = $4 WHERE email = $5 RETURNING id, email, will_renew, renew_months, is_auto_payment',
      [
        willRenew,
        willRenew ? renewMonths : null,
        willRenew ? isAutoPayment : false,
        willRenew && renewalMessage ? renewalMessage : null,
        email
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '해당 이메일로 등록된 멤버십을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updatedMember = result.rows[0];

    return NextResponse.json({
      success: true,
      willRenew: updatedMember.will_renew,
      renewMonths: updatedMember.renew_months,
      isAutoPayment: updatedMember.is_auto_payment,
    });
  } catch (error) {
    console.error('Error updating renewal preferences:', error);
    return NextResponse.json(
      { error: '갱신 정보 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
