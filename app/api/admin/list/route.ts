import { NextResponse } from 'next/server';
import { getAllRequests } from '@/lib/storage';

// 캐싱 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 모든 신청 조회 (관리자용)
export async function GET() {
  try {
    const requests = await getAllRequests();

    const response = NextResponse.json(requests);

    // 브라우저 캐싱 허용 (30초)
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: '데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
