import { NextResponse } from 'next/server';
import { getAllRequests } from '@/lib/storage';

// 모든 신청 조회 (관리자용)
export async function GET() {
  try {
    const requests = await getAllRequests();
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json(
      { error: '데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
