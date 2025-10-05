import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

const client = createPool({
  connectionString: process.env.POSTGRES_URL,
});

// GET: 수익 기록 상세 조회 (디버깅용)
export async function GET() {
  try {
    // 모든 수익 기록 조회
    const { rows: revenueRecords } = await client.sql`
      SELECT 
        rr.id,
        rr.member_id,
        rr.amount,
        rr.months,
        rr.description,
        rr.recorded_at,
        m.name as member_name,
        m.email as member_email
      FROM revenue_records rr
      LEFT JOIN members m ON rr.member_id = m.id
      ORDER BY rr.recorded_at DESC
    `;

    // 총 수익 계산
    const totalRevenue = revenueRecords.reduce((sum, record) => sum + parseInt(record.amount), 0);

    // 통계
    const stats = {
      totalRecords: revenueRecords.length,
      totalRevenue: totalRevenue,
      recordsByMonth: {} as Record<number, number>,
    };

    // 개월수별 집계
    revenueRecords.forEach(record => {
      const months = parseInt(record.months);
      stats.recordsByMonth[months] = (stats.recordsByMonth[months] || 0) + 1;
    });

    return NextResponse.json({
      stats,
      records: revenueRecords.map(record => ({
        id: record.id,
        memberId: record.member_id,
        memberName: record.member_name,
        memberEmail: record.member_email,
        amount: parseInt(record.amount),
        months: parseInt(record.months),
        description: record.description,
        recordedAt: record.recorded_at,
      })),
    });
  } catch (error) {
    console.error('Get revenue details error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get revenue details',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
