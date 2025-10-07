import { NextResponse } from 'next/server';
import { getTotalRevenue } from '@/lib/storage';
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

// GET: 관리자 대시보드 통계 조회
export async function GET() {
  try {
    // 캐시 비활성화
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    };

    // 전체 회원 수 조회
    const { rows: memberCountRows } = await client.sql`
      SELECT COUNT(*) as total FROM members
    `;
    const totalMembers = parseInt(memberCountRows[0].total);

    // YouTube 계정 수 조회
    const { rows: youtubeCountRows } = await client.sql`
      SELECT COUNT(*) as total FROM youtube_accounts
    `;
    const totalYoutubeAccounts = parseInt(youtubeCountRows[0].total);

    // 회원당 4,000원 기준 월 매출 (현재 회원 수 기준)
    const PRICE_PER_MEMBER = 4000;
    const monthlyRevenue = totalMembers * PRICE_PER_MEMBER;

    // YouTube 계정당 389루피 기준 월 지출 (환율 적용)
    const COST_PER_YOUTUBE_ACCOUNT = 389; // 루피
    const RUPEE_TO_KRW = 16; // 1루피 = 약 16원
    const monthlyCost = totalYoutubeAccounts * COST_PER_YOUTUBE_ACCOUNT * RUPEE_TO_KRW;

    // 순수익 = 매출 - 지출
    const monthlyProfit = monthlyRevenue - monthlyCost;

    // 누적 수익: revenue_records 테이블에서 조회
    // 입금 완료된 모든 회원의 결제 금액이 기록되어 있음
    const cumulativeRevenue = await getTotalRevenue();

    return NextResponse.json({
      totalMembers,
      totalYoutubeAccounts,
      monthlyRevenue,
      monthlyCost,
      monthlyProfit,
      cumulativeRevenue,
      pricePerMember: PRICE_PER_MEMBER,
      costPerYoutubeAccount: COST_PER_YOUTUBE_ACCOUNT,
      rupeeToKrw: RUPEE_TO_KRW,
    }, { headers });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get admin stats',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
