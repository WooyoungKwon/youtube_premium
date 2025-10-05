import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { addMember, addRevenueRecord } from '@/lib/storage';
import { toDateString, addMonthsKST } from '@/lib/dateUtils';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  },
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
    const { rows: requestRows } = await client.sql`
      SELECT * FROM member_requests WHERE id = ${requestId}
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

    // 날짜 계산: 신청일 + 개월수 (한국 시간 기준)
    console.log('Request data:', {
      created_at: requestData.created_at,
      created_at_type: typeof requestData.created_at,
      months: requestData.months,
      depositor_name: requestData.depositor_name,
      email: requestData.email
    });

    let createdDateStr: string;
    let paymentDateStr: string;

    try {
      createdDateStr = toDateString(requestData.created_at);
      console.log('Created date string:', createdDateStr);
      
      const monthsToAdd = parseInt(requestData.months) || 1;
      console.log('Months to add:', monthsToAdd);
      
      paymentDateStr = addMonthsKST(createdDateStr, monthsToAdd);
      console.log('Payment date string:', paymentDateStr);
    } catch (dateError) {
      console.error('Date calculation error:', dateError);
      throw new Error(`Date calculation failed: ${dateError instanceof Error ? dateError.message : String(dateError)}`);
    }

    console.log('Calculated dates:', {
      createdDateStr,
      paymentDateStr
    });

    // 회원 등록
    const member = await addMember(
      youtubeAccountId,
      '임시닉네임', // 닉네임은 임시로 설정
      requestData.email,
      requestData.depositor_name || '미입력', // 입금자명을 이름으로 사용
      createdDateStr, // 신청일을 입금일로 사용 (한국 시간)
      paymentDateStr, // 다음 결제일은 개월수만큼 더한 날짜 (한국 시간)
      'completed', // 입금 완료 상태
      requestId // 신청 ID 연결
    );

    console.log('Member created successfully:', member);

    // 수익 기록 (입금 완료 상태일 때만)
    const PRICE_PER_MEMBER = 4000;
    const monthsToAdd = parseInt(requestData.months) || 1;
    const revenueAmount = monthsToAdd * PRICE_PER_MEMBER;
    
    await addRevenueRecord(
      member.id,
      revenueAmount,
      monthsToAdd,
      `회원 등록 (${requestData.depositor_name || '미입력'}) - ${monthsToAdd}개월`
    );
    
    console.log('Revenue recorded:', { amount: revenueAmount, months: monthsToAdd });

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
