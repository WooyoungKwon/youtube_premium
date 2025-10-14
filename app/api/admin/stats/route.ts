import { NextResponse } from 'next/server';
import { getStats } from '@/lib/data';

// 캐싱 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: 관리자 대시보드 통계 조회
export async function GET() {
  try {
    const stats = await getStats();

    const response = NextResponse.json(stats);

    // 브라우저 캐싱 허용 (30초)
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');

    return response;

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
