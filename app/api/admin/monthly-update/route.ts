import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

const client = createPool({
  connectionString: process.env.POSTGRES_URL,
});

// 월 갱신 로직: 결제일이 지난 회원들의 결제일을 다음 달로 업데이트하고 입금 상태를 대기로 변경
export async function POST(request: NextRequest) {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // JavaScript month는 0부터 시작
    const currentDay = today.getDate();

    // 현재 월의 1일을 기준으로 이전 달에 결제일이 있었던 회원들을 찾습니다
    // 예: 현재가 11월이면, 10월에 결제일이 있었던 회원들을 찾아서 11월로 업데이트
    const { rows: membersToUpdate } = await client.sql`
      SELECT 
        id, 
        payment_date,
        deposit_status,
        EXTRACT(YEAR FROM payment_date) as payment_year,
        EXTRACT(MONTH FROM payment_date) as payment_month,
        EXTRACT(DAY FROM payment_date) as payment_day
      FROM members 
      WHERE 
        -- 지난 달에 결제일이 있었고
        EXTRACT(YEAR FROM payment_date) = ${currentMonth === 1 ? currentYear - 1 : currentYear}
        AND EXTRACT(MONTH FROM payment_date) = ${currentMonth === 1 ? 12 : currentMonth - 1}
        -- 그 날짜가 현재 날짜보다 작거나 같으며 (결제일이 지났음)
        AND EXTRACT(DAY FROM payment_date) <= ${currentDay}
        -- 이미 완료된 상태가 아닌 경우에만 (대기 또는 실패 상태)
        AND deposit_status != 'completed'
    `;

    let updatedCount = 0;

    for (const member of membersToUpdate) {
      const paymentDay = member.payment_day;
      
      // 다음 달의 같은 날짜로 결제일 설정
      let nextMonth = currentMonth;
      let nextYear = currentYear;
      
      if (currentMonth === 12) {
        nextMonth = 1;
        nextYear = currentYear + 1;
      }

      // 다음 달의 마지막 날을 확인하여 유효한 날짜인지 체크
      const lastDayOfNextMonth = new Date(nextYear, nextMonth, 0).getDate();
      const validPaymentDay = Math.min(paymentDay, lastDayOfNextMonth);
      
      const newPaymentDate = new Date(nextYear, nextMonth - 1, validPaymentDay);
      
      // 회원의 결제일과 입금 상태 업데이트
      await client.sql`
        UPDATE members 
        SET 
          payment_date = ${newPaymentDate.toISOString().split('T')[0]},
          deposit_status = 'pending'
        WHERE id = ${member.id}
      `;
      
      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount}명의 회원 정보가 업데이트되었습니다.`,
      updatedCount,
      updatedMembers: membersToUpdate.map(m => ({
        id: m.id,
        previousPaymentDate: m.payment_date,
        previousStatus: m.deposit_status
      }))
    });

  } catch (error) {
    console.error('Monthly update error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Monthly update failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET 요청으로 업데이트가 필요한 회원 목록 미리보기
export async function GET() {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const { rows: candidateMembers } = await client.sql`
      SELECT 
        id,
        nickname,
        email,
        payment_date,
        deposit_status,
        EXTRACT(YEAR FROM payment_date) as payment_year,
        EXTRACT(MONTH FROM payment_date) as payment_month,
        EXTRACT(DAY FROM payment_date) as payment_day
      FROM members 
      WHERE 
        EXTRACT(YEAR FROM payment_date) = ${currentMonth === 1 ? currentYear - 1 : currentYear}
        AND EXTRACT(MONTH FROM payment_date) = ${currentMonth === 1 ? 12 : currentMonth - 1}
        AND EXTRACT(DAY FROM payment_date) <= ${currentDay}
        AND deposit_status != 'completed'
      ORDER BY payment_date ASC
    `;

    return NextResponse.json({
      candidateMembers,
      count: candidateMembers.length,
      currentDate: today.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Get monthly update candidates error:', error);
    return NextResponse.json(
      { error: 'Failed to get update candidates' },
      { status: 500 }
    );
  }
}