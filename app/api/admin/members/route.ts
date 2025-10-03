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
    const { youtubeAccountId, nickname, email, name, joinDate, paymentDate, depositStatus, requestId } = await request.json();
    const member = await addMember(
      youtubeAccountId,
      nickname,
      email,
      name,
      joinDate,
      paymentDate,
      depositStatus,
      requestId
    );
    return NextResponse.json(member);
  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
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
      
      const currentPaymentDate = new Date(memberRows[0].payment_date);
      
      // 개월 수만큼 결제일 증가
      const newPaymentDate = new Date(currentPaymentDate);
      newPaymentDate.setMonth(newPaymentDate.getMonth() + months);
      
      // 상태와 결제일 동시 업데이트
      await sql`
        UPDATE members 
        SET 
          deposit_status = ${depositStatus},
          payment_date = ${newPaymentDate.toISOString().split('T')[0]}
        WHERE id = ${id}
      `;
      
      return NextResponse.json({ 
        success: true, 
        newPaymentDate: newPaymentDate.toISOString().split('T')[0],
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


