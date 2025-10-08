
import { Pool } from 'pg';
import { getTotalRevenue } from '@/lib/storage';

// 캐싱 비활성화 - 데이터가 자주 변경되므로 요청 시마다 새로 조회
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

export async function getStats() {
  try {
    // 전체 회원 수 조회
    const { rows: memberCountRows } = await client.sql`
      SELECT COUNT(*) as total FROM members
    `;
    const totalMembers = parseInt(memberCountRows[0].total);

    // 10월 한 달 결제 인원
    const { rows: octoberMembersRows } = await client.sql`
      SELECT COUNT(*) as total
      FROM members
      WHERE EXTRACT(YEAR FROM last_payment_date) = 2025
      AND EXTRACT(MONTH FROM last_payment_date) = 10
      AND deposit_status = 'completed'
    `;
    const octoberMembers = parseInt(octoberMembersRows[0].total);

    // 누적 수익
    const cumulativeRevenue = await getTotalRevenue();
    
    // YouTube 계정 수 조회
    const { rows: youtubeCountRows } = await client.sql`
      SELECT COUNT(*) as total FROM youtube_accounts
    `;
    const totalYoutubeAccounts = parseInt(youtubeCountRows[0].total);

    // 월 매출 (현재 회원 수 기준)
    const PRICE_PER_MEMBER = 4000;
    const monthlyRevenue = totalMembers * PRICE_PER_MEMBER;

    // 월 지출 (YouTube 계정 수 기준)
    const COST_PER_YOUTUBE_ACCOUNT = 389; // 루피
    const RUPEE_TO_KRW = 16; // 1루피 = 약 16원
    const monthlyCost = totalYoutubeAccounts * COST_PER_YOUTUBE_ACCOUNT * RUPEE_TO_KRW;

    // 순수익
    const monthlyProfit = monthlyRevenue - monthlyCost;

    return {
      totalMembers,
      octoberMembers,
      totalYoutubeAccounts,
      monthlyRevenue,
      monthlyCost,
      monthlyProfit,
      cumulativeRevenue,
      pricePerMember: PRICE_PER_MEMBER,
      costPerYoutubeAccount: COST_PER_YOUTUBE_ACCOUNT,
      rupeeToKrw: RUPEE_TO_KRW,
    };
  } catch (error) {
    console.error('Failed to get stats:', error);
    // 에러 발생 시 기본값 또는 빈 값을 반환하여 페이지 렌더링은 유지
    return {
      totalMembers: 0,
      octoberMembers: 0,
      totalYoutubeAccounts: 0,
      monthlyRevenue: 0,
      monthlyCost: 0,
      monthlyProfit: 0,
      cumulativeRevenue: 0,
      pricePerMember: 4000,
      costPerYoutubeAccount: 389,
      rupeeToKrw: 16,
    };
  }
}
