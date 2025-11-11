import { NextResponse } from 'next/server';
import { getAllRequests } from '@/lib/storage';

// 캐싱 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 모든 신청 조회 (관리자용, 페이지네이션 지원)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = (searchParams.get('status') || 'all') as 'all' | 'pending' | 'approved' | 'rejected';
    const search = searchParams.get('search') || '';

    const { requests, total } = await getAllRequests({ page, limit, status, search });

    const response = NextResponse.json({
      requests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

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
