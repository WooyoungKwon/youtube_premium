import { NextResponse } from 'next/server';
import { getStats } from '@/lib/data';

// 캐싱 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: 관리자 대시보드 통계 조회
export async function GET() {
  try {
    // 캐시 비활성화 헤더
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    };

    const stats = await getStats();

    return NextResponse.json(stats, { headers });

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
