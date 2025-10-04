import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// 매월 1일에 실행되어 전월 수익을 기록
export async function GET(request: Request) {
  try {
    // Cron secret 검증
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 전월의 년도와 월 계산
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;

    console.log(`Recording revenue for ${year}-${month}`);

    // 전월 마지막 날의 회원 수 조회
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const { rows: memberCountRows } = await sql`
      SELECT COUNT(*) as count 
      FROM members 
      WHERE created_at <= ${lastDayOfMonth.toISOString()}
    `;

    const memberCount = parseInt(memberCountRows[0].count);
    const PRICE_PER_MEMBER = 4000;
    const revenue = memberCount * PRICE_PER_MEMBER;

    console.log(`Member count: ${memberCount}, Revenue: ${revenue}`);

    // 월별 수익 기록 (이미 존재하면 업데이트)
    await sql`
      INSERT INTO monthly_revenue (year, month, member_count, revenue)
      VALUES (${year}, ${month}, ${memberCount}, ${revenue})
      ON CONFLICT (year, month) 
      DO UPDATE SET 
        member_count = ${memberCount},
        revenue = ${revenue},
        recorded_at = CURRENT_TIMESTAMP
    `;

    console.log(`Revenue recorded successfully for ${year}-${month}`);

    return NextResponse.json({ 
      success: true,
      year,
      month,
      memberCount,
      revenue,
      message: `Revenue recorded for ${year}-${month}` 
    });
  } catch (error) {
    console.error('Record monthly revenue error:', error);
    return NextResponse.json({ 
      error: 'Failed to record monthly revenue',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
