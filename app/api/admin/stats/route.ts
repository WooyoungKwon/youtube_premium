import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getTotalRevenue } from '@/lib/storage';

// GET: 관리자 대시보드 통계 조회
export async function GET() {
  try {
    // 캐시 헤더 추가 (10초간 캐시)
    const headers = {
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
    };
    
    // 전체 회원 수 조회
    const { rows: memberCountRows } = await sql`
      SELECT COUNT(*) as total FROM members
    `;
    const totalMembers = parseInt(memberCountRows[0].total);

    // 회원당 4,000원 기준 월 수익 (현재 회원 수 기준)
    const PRICE_PER_MEMBER = 4000;
    const monthlyRevenue = totalMembers * PRICE_PER_MEMBER;

    // 누적 수익: revenue_records 테이블에서 조회
    // 입금 완료된 모든 회원의 결제 금액이 기록되어 있음
    const cumulativeRevenue = await getTotalRevenue();

    return NextResponse.json({
      totalMembers,
      monthlyRevenue,
      cumulativeRevenue,
      pricePerMember: PRICE_PER_MEMBER,
    }, { headers });
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
