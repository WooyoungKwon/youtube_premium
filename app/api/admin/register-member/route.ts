import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { addMember } from '@/lib/storage';

// POST: 승인된 신청을 회원으로 등록
export async function POST(request: Request) {
  try {
    const { requestId, youtubeAccountId } = await request.json();
    
    if (!requestId || !youtubeAccountId) {
      return NextResponse.json({ 
        error: 'requestId and youtubeAccountId are required' 
      }, { status: 400 });
    }

    // 신청 정보 조회
    const { rows: requestRows } = await sql`
      SELECT * FROM requests WHERE id = ${requestId}
    `;

    if (requestRows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const requestData = requestRows[0];

    // 승인된 신청만 회원으로 등록 가능
    if (requestData.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Only approved requests can be registered as members' 
      }, { status: 400 });
    }

    // 날짜 계산: 신청일 + 개월수
    const createdDate = new Date(requestData.created_at);
    const paymentDate = new Date(createdDate);
    paymentDate.setMonth(paymentDate.getMonth() + (requestData.months || 1));

    // 날짜를 YYYY-MM-DD 형식으로 변환
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    // 회원 등록
    const member = await addMember(
      youtubeAccountId,
      '임시닉네임', // 닉네임은 임시로 설정
      requestData.email,
      requestData.depositor_name || '미입력', // 입금자명을 이름으로 사용
      formatDate(createdDate), // 신청일을 입금일로 사용
      formatDate(paymentDate), // 다음 결제일은 개월수만큼 더한 날짜
      'completed', // 입금 완료 상태
      requestId // 신청 ID 연결
    );

    return NextResponse.json({ 
      success: true, 
      member,
      message: '회원 등록이 완료되었습니다.' 
    });
  } catch (error) {
    console.error('Register member from request error:', error);
    return NextResponse.json({ 
      error: 'Failed to register member',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
