import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// 한국 시간대(KST) 현재 날짜 가져오기
function getKSTDate(): string {
  const now = new Date();
  // UTC 시간을 KST(UTC+9)로 변환
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return kstTime.toISOString().split('T')[0]; // YYYY-MM-DD 형식
}

// 만료된 회원 상태를 대기로 변경하는 함수
export async function GET(request: Request) {
  try {
    // 인증 확인 (Vercel Cron Job의 경우)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kstToday = getKSTDate();
    console.log(`[Cron Job] Running at KST: ${kstToday}`);

    // 결제일이 오늘 이전이고 상태가 완료인 회원들을 대기로 변경
    const result = await sql`
      UPDATE members 
      SET deposit_status = 'pending' 
      WHERE payment_date <= ${kstToday}
      AND deposit_status = 'completed'
      RETURNING id, nickname, email, payment_date
    `;

    console.log(`[Cron Job] Updated ${result.rowCount} members to pending status`);
    console.log('[Cron Job] Updated members:', result.rows);

    return NextResponse.json({
      success: true,
      kstDate: kstToday,
      updatedCount: result.rowCount,
      updatedMembers: result.rows,
    });
  } catch (error) {
    console.error('[Cron Job] Error updating expired members:', error);
    return NextResponse.json({ 
      error: 'Failed to update expired members',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST 메서드도 지원 (수동 실행용)
export async function POST(request: Request) {
  return GET(request);
}
