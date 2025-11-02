import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const { memberIds, depositStatus } = await request.json();

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: '회원 ID 목록이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!depositStatus) {
      return NextResponse.json(
        { error: '변경할 상태가 필요합니다.' },
        { status: 400 }
      );
    }

    // 여러 회원의 상태를 한번에 업데이트
    const placeholders = memberIds.map((_, i) => `$${i + 1}`).join(', ');
    const query = `
      UPDATE members
      SET deposit_status = $${memberIds.length + 1}
      WHERE id IN (${placeholders})
      RETURNING id, nickname, email, deposit_status
    `;

    const result = await pool.query(query, [...memberIds, depositStatus]);

    return NextResponse.json({
      success: true,
      updatedCount: result.rowCount,
      updatedMembers: result.rows,
    });
  } catch (error) {
    console.error('Error bulk updating members:', error);
    return NextResponse.json(
      { error: '일괄 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
