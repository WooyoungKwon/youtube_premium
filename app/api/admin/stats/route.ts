import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET: 관리자 대시보드 통계 조회
export async function GET() {
  try {
    // 전체 회원 수 조회
    const { rows: memberCountRows } = await sql`
      SELECT COUNT(*) as total FROM members
    `;
    const totalMembers = parseInt(memberCountRows[0].total);

    // 회원당 4,000원 기준 월 수익
    const PRICE_PER_MEMBER = 4000;
    const monthlyRevenue = totalMembers * PRICE_PER_MEMBER;

    // 10월부터의 누적 수익 계산
    // 각 회원의 등록일(created_at)부터 현재까지의 개월 수를 계산
    const { rows: revenueRows } = await sql`
      SELECT 
        COUNT(*) as member_count,
        SUM(
          CASE 
            WHEN created_at >= '2025-10-01' THEN
              -- 10월 이후 등록된 회원: 등록일부터 현재까지의 개월 수 계산
              EXTRACT(YEAR FROM AGE(CURRENT_DATE, created_at::date)) * 12 + 
              EXTRACT(MONTH FROM AGE(CURRENT_DATE, created_at::date)) + 1
            ELSE
              -- 10월 이전 회원: 10월 1일부터 현재까지의 개월 수만 계산
              EXTRACT(YEAR FROM AGE(CURRENT_DATE, '2025-10-01'::date)) * 12 + 
              EXTRACT(MONTH FROM AGE(CURRENT_DATE, '2025-10-01'::date)) + 1
          END
        ) as total_months
      FROM members
    `;

    const totalMonths = parseFloat(revenueRows[0].total_months || '0');
    const cumulativeRevenue = Math.floor(totalMonths * PRICE_PER_MEMBER);

    return NextResponse.json({
      totalMembers,
      monthlyRevenue,
      cumulativeRevenue,
      pricePerMember: PRICE_PER_MEMBER,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get admin stats',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
