import { NextResponse } from 'next/server';
import { getMembersByYoutube, addMember, updateMemberDepositStatus } from '@/lib/storage';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const youtubeId = searchParams.get('youtubeId');
    if (!youtubeId) {
      return NextResponse.json({ error: 'YouTube ID is required' }, { status: 400 });
    }
    const members = await getMembersByYoutube(youtubeId);
    return NextResponse.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json({ error: 'Failed to get members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/admin/members - Request body:', body);
    
    const { youtubeAccountId, nickname, email, name, lastPaymentDate, paymentDate, depositStatus, requestId } = body;
    
    console.log('Calling addMember with:', {
      youtubeAccountId,
      nickname,
      email,
      name,
      lastPaymentDate,
      paymentDate,
      depositStatus,
      requestId
    });
    
    const member = await addMember(
      youtubeAccountId,
      nickname,
      email,
      name,
      lastPaymentDate,
      paymentDate,
      depositStatus,
      requestId
    );
    
    console.log('Member added successfully:', member);
    return NextResponse.json(member);
  } catch (error) {
    console.error('Add member error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Failed to add member',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, depositStatus, months } = await request.json();
    
    // 완료 상태로 변경하면서 개월 수가 제공된 경우
    if (depositStatus === 'completed' && months) {
      // 현재 회원 정보 조회
      const { rows: memberRows } = await sql`
        SELECT payment_date FROM members WHERE id = ${id}
      `;
      
      if (memberRows.length === 0) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }
      
      // YYYY-MM-DD 형식의 문자열을 로컬 시간으로 파싱
      let paymentDateStr = memberRows[0].payment_date;
      
      // Date 객체인 경우 문자열로 변환
      if (paymentDateStr instanceof Date) {
        paymentDateStr = paymentDateStr.toISOString().split('T')[0];
      }
      
      const [year, month, day] = paymentDateStr.split('-').map(Number);
      const currentPaymentDate = new Date(year, month - 1, day);
      
      // 개월 수만큼 결제일 증가
      currentPaymentDate.setMonth(currentPaymentDate.getMonth() + months);
      
      // YYYY-MM-DD 형식으로 변환
      const newPaymentDateStr = currentPaymentDate.toISOString().split('T')[0];
      
      // 상태와 결제일 동시 업데이트
      await sql`
        UPDATE members 
        SET 
          deposit_status = ${depositStatus},
          payment_date = ${newPaymentDateStr}::date
        WHERE id = ${id}
      `;
      
      return NextResponse.json({ 
        success: true, 
        newPaymentDate: newPaymentDateStr,
        months: months
      });
    } else {
      // 기존 로직: 상태만 변경
      await updateMemberDepositStatus(id, depositStatus);
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Update member deposit status error:', error);
    return NextResponse.json({ error: 'Failed to update member deposit status' }, { status: 500 });
  }
}


