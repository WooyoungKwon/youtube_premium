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

    // 회원당 4,000원 기준 월 수익 (현재 회원 수 기준)
    const PRICE_PER_MEMBER = 4000;
    const monthlyRevenue = totalMembers * PRICE_PER_MEMBER;

    // 누적 수익 = 과거 기록된 월별 수익 합계 + 현재 달 예상 수익
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // 2025년 10월부터 전월까지의 기록된 수익 합계
    const { rows: recordedRevenueRows } = await sql`
      SELECT COALESCE(SUM(revenue), 0) as total_recorded
      FROM monthly_revenue
      WHERE (year = 2025 AND month >= 10)
         OR (year > 2025)
    `;

    const recordedRevenue = parseInt(recordedRevenueRows[0].total_recorded || '0');
    
    // 현재 달의 예상 수익 (아직 기록되지 않음)
    const currentMonthRevenue = monthlyRevenue;
    
    // 누적 수익 = 기록된 수익 + 현재 달 예상 수익
    const cumulativeRevenue = recordedRevenue + currentMonthRevenue;

    return NextResponse.json({
      totalMembers,
      monthlyRevenue,
      cumulativeRevenue,
      recordedRevenue, // 과거 기록된 수익
      currentMonthRevenue, // 현재 달 예상 수익
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
