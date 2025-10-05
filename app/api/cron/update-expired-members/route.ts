import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL,
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

// 한국 시간대(KST) 현재 날짜 가져오기
function getKSTDate(): string {
  const now = new Date();
  // UTC 시간을 KST(UTC+9)로 변환
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return kstTime.toISOString().split('T')[0]; // YYYY-MM-DD 형식
}

// 월별 수익 기록 함수
async function recordMonthlyRevenue() {
  try {
    const now = new Date();
    const today = now.getDate();
    
    // 매월 1일에만 실행
    if (today !== 1) {
      console.log(`[Monthly Revenue] Not the 1st of month (today: ${today}), skipping`);
      return null;
    }

    // 전월의 년도와 월 계산
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;

    console.log(`[Monthly Revenue] Recording revenue for ${year}-${month}`);

    // 전월 마지막 날의 회원 수 조회
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const { rows: memberCountRows } = await client.sql`
      SELECT COUNT(*) as count 
      FROM members 
      WHERE created_at <= ${lastDayOfMonth.toISOString()}
    `;

    const memberCount = parseInt(memberCountRows[0].count);
    const PRICE_PER_MEMBER = 4000;
    const revenue = memberCount * PRICE_PER_MEMBER;

    console.log(`[Monthly Revenue] Member count: ${memberCount}, Revenue: ${revenue}`);

    // 월별 수익 기록 (이미 존재하면 업데이트)
    await client.sql`
      INSERT INTO monthly_revenue (year, month, member_count, revenue)
      VALUES (${year}, ${month}, ${memberCount}, ${revenue})
      ON CONFLICT (year, month) 
      DO UPDATE SET 
        member_count = ${memberCount},
        revenue = ${revenue},
        recorded_at = CURRENT_TIMESTAMP
    `;

    console.log(`[Monthly Revenue] Revenue recorded successfully for ${year}-${month}`);
    
    return { year, month, memberCount, revenue };
  } catch (error) {
    console.error('[Monthly Revenue] Error:', error);
    return null;
  }
}

// YouTube 계정 갱신 및 Apple 계정 크레딧 차감 함수
async function processYoutubeRenewals(kstToday: string) {
  try {
    console.log(`[YouTube Renewal] Checking renewals for ${kstToday}`);
    
    const RENEWAL_COST = 389; // 루피
    
    // 오늘이 갱신일인 YouTube 계정들 조회
    const { rows: renewalAccounts } = await client.sql`
      SELECT 
        ya.id as youtube_id,
        ya.youtube_email,
        ya.apple_account_id,
        ya.renewal_date,
        aa.apple_email,
        aa.remaining_credit
      FROM youtube_accounts ya
      JOIN apple_accounts aa ON ya.apple_account_id = aa.id
      WHERE ya.renewal_date = ${kstToday}::date
    `;
    
    console.log(`[YouTube Renewal] Found ${renewalAccounts.length} accounts to renew`);
    
    const results = [];
    
    for (const account of renewalAccounts) {
      try {
        const currentCredit = account.remaining_credit || 0;
        
        if (currentCredit < RENEWAL_COST) {
          console.warn(`[YouTube Renewal] Insufficient credit for ${account.youtube_email}. Current: ${currentCredit}, Required: ${RENEWAL_COST}`);
          results.push({
            youtubeEmail: account.youtube_email,
            appleEmail: account.apple_email,
            status: 'insufficient_credit',
            currentCredit,
            requiredCredit: RENEWAL_COST
          });
          continue;
        }
        
        // Apple 계정 크레딧 차감
        const newCredit = currentCredit - RENEWAL_COST;
        await client.sql`
          UPDATE apple_accounts
          SET remaining_credit = ${newCredit}, last_updated = CURRENT_TIMESTAMP
          WHERE id = ${account.apple_account_id}
        `;
        
        console.log(`[YouTube Renewal] Successfully renewed ${account.youtube_email}. Credit: ${currentCredit} -> ${newCredit}`);
        
        results.push({
          youtubeEmail: account.youtube_email,
          appleEmail: account.apple_email,
          status: 'success',
          previousCredit: currentCredit,
          newCredit,
          deducted: RENEWAL_COST
        });
      } catch (error) {
        console.error(`[YouTube Renewal] Error processing ${account.youtube_email}:`, error);
        results.push({
          youtubeEmail: account.youtube_email,
          appleEmail: account.apple_email,
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return {
      totalProcessed: renewalAccounts.length,
      results
    };
  } catch (error) {
    console.error('[YouTube Renewal] Error:', error);
    return null;
  }
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

    // 1. 월별 수익 기록 (매월 1일에만 실행)
    const revenueResult = await recordMonthlyRevenue();

    // 2. YouTube 계정 갱신 및 Apple 계정 크레딧 차감
    const renewalResult = await processYoutubeRenewals(kstToday);

    // 3. 결제일이 오늘 이전이고 상태가 완료인 회원들을 대기로 변경
    const result = await client.sql`
      UPDATE members 
      SET deposit_status = 'pending' 
      WHERE payment_date <= ${kstToday}::date
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
      monthlyRevenue: revenueResult,
      youtubeRenewals: renewalResult,
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
