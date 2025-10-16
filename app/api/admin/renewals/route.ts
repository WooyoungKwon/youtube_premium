import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const connectionString = (process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '')
  .replace('&&', '&')
  .replace('sslmode=require', '');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// 캐싱 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 갱신 요청 목록 조회 (관리자용)
export async function GET(request: Request) {
  try {
    // URL에서 검색 파라미터 추출
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';

    // will_renew가 true인 회원들만 조회 (입금자명으로 검색 가능)
    let query = `
      SELECT
        m.id,
        m.nickname,
        m.email,
        m.name,
        m.payment_date,
        m.will_renew,
        m.renew_months,
        m.is_auto_payment,
        m.renewal_message,
        m.deposit_status,
        y.youtube_email,
        y.nickname as youtube_nickname
      FROM members m
      LEFT JOIN youtube_accounts y ON m.youtube_account_id = y.id
      WHERE m.will_renew = true
    `;

    const params: any[] = [];

    // 검색어가 있으면 입금자명으로 필터링
    if (searchQuery.trim()) {
      query += ` AND m.name ILIKE $1`;
      params.push(`%${searchQuery.trim()}%`);
    }

    query += ` ORDER BY m.payment_date ASC`;

    const result = await pool.query(query, params);

    const renewals = result.rows.map(row => ({
      id: row.id,
      nickname: row.nickname,
      email: row.email,
      name: row.name,
      paymentDate: row.payment_date,
      willRenew: row.will_renew,
      renewMonths: row.renew_months,
      isAutoPayment: row.is_auto_payment || false,
      renewalMessage: row.renewal_message,
      depositStatus: row.deposit_status,
      youtubeEmail: row.youtube_email,
      youtubeNickname: row.youtube_nickname,
    }));

    return NextResponse.json({ renewals });
  } catch (error) {
    console.error('Error fetching renewals:', error);
    return NextResponse.json(
      { error: '갱신 요청을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
