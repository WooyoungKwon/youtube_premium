import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Supabase connection
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
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    // 회원 데이터베이스에서 이메일 확인
    const result = await pool.query(
      'SELECT id FROM members WHERE LOWER(TRIM(email)) = LOWER(TRIM($1)) LIMIT 1',
      [email]
    );

    return NextResponse.json({ valid: result.rows.length > 0 });
  } catch (error) {
    console.error('Error verifying member:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
