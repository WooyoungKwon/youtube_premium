import { NextResponse } from 'next/server';
import { getMembersByYoutube, addMember, updateMemberDepositStatus, addRevenueRecord } from '@/lib/storage';
import { Pool } from 'pg';

// 캐싱 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const connectionString = (process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '')
  .replace('sslmode=require', '')
  .replace('&&', '&');

const pool = new Pool({
  connectionString,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const client = {
  sql: async (strings: TemplateStringsArray, ...values: any[]) => {
    const text = strings.reduce((acc, str, i) =>
      acc + str + (i < values.length ? `$${i + 1}` : ''), ''
    );
    return pool.query(text, values);
  }
};

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
    
    // 입금 완료 상태로 회원을 추가하는 경우 수익 기록
    if (depositStatus === 'completed') {
      const PRICE_PER_MEMBER = 4000;
      // requestId가 있으면 member_requests에서 개월수 조회, 없으면 1개월로 간주
      let months = 1;
      if (requestId) {
        try {
          const { rows } = await client.sql`
            SELECT months FROM member_requests WHERE id = ${requestId}
          `;
          if (rows.length > 0 && rows[0].months) {
            months = parseInt(rows[0].months);
          }
        } catch (err) {
          console.error('Failed to fetch months from request:', err);
        }
      }
      
      const revenueAmount = months * PRICE_PER_MEMBER;
      await addRevenueRecord(
        member.id,
        revenueAmount,
        months,
        `회원 추가 (${name}) - ${months}개월`
      );
      console.log('Revenue recorded:', { amount: revenueAmount, months });
    }
    
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
      const { rows: memberRows } = await client.sql`
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
      await client.sql`
        UPDATE members 
        SET 
          deposit_status = ${depositStatus},
          payment_date = ${newPaymentDateStr}::date
        WHERE id = ${id}
      `;
      
      // 수익 기록
      const PRICE_PER_MEMBER = 4000;
      const revenueAmount = months * PRICE_PER_MEMBER;
      await addRevenueRecord(
        id,
        revenueAmount,
        months,
        `입금 완료 처리 - ${months}개월 연장`
      );
      console.log('Revenue recorded:', { memberId: id, amount: revenueAmount, months });
      
      return NextResponse.json({ 
        success: true, 
        newPaymentDate: newPaymentDateStr,
        months: months
      });
    } else {
      // 기존 로직: 상태만 변경
      // pending -> completed로 변경하는 경우 수익 기록 (개월수 정보 없이)
      if (depositStatus === 'completed') {
        // 회원의 request_id로 개월수 조회
        const { rows: memberRows } = await client.sql`
          SELECT m.request_id, r.months
          FROM members m
          LEFT JOIN member_requests r ON m.request_id = r.id
          WHERE m.id = ${id}
        `;
        
        if (memberRows.length > 0) {
          const months = parseInt(memberRows[0].months || '1');
          const PRICE_PER_MEMBER = 4000;
          const revenueAmount = months * PRICE_PER_MEMBER;
          
          await addRevenueRecord(
            id,
            revenueAmount,
            months,
            `입금 완료 처리 - ${months}개월`
          );
          console.log('Revenue recorded:', { memberId: id, amount: revenueAmount, months });
        }
      }
      
      await updateMemberDepositStatus(id, depositStatus);
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Update member deposit status error:', error);
    return NextResponse.json({ error: 'Failed to update member deposit status' }, { status: 500 });
  }
}


