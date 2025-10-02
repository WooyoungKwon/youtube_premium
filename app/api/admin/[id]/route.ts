import { NextResponse } from 'next/server';
import { getAllRequests, updateRequestStatus, deleteRequest } from '@/lib/storage';

// 모든 신청 조회
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

// 신청 상태 업데이트
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;
    
    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json(
        { error: '올바른 상태값을 입력해주세요. (approved 또는 rejected)' },
        { status: 400 }
      );
    }
    
    const updatedRequest = await updateRequestStatus(params.id, status);
    
    return NextResponse.json(updatedRequest);
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

// 신청 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteRequest(params.id);
    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (error) {
    return NextResponse.json(
      { error: '삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
