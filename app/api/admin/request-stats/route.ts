import { NextResponse } from 'next/server';
import { pool } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 신청 통계 조회 (필터별 개수)
export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) as total
      FROM member_requests
    `);

    const response = NextResponse.json(rows[0]);
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('Get request stats error:', error);
    return NextResponse.json(
      { error: '통계를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
