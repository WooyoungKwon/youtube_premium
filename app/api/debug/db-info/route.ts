import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = new Pool({
      connectionString: process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL,
      ssl: false,
    });

    // 연결 정보 확인
    const connectionInfo = {
      envVar: process.env.POSTGRES_URL ? 'POSTGRES_URL exists' : 'POSTGRES_URL missing',
      // 보안을 위해 비밀번호 부분은 마스킹
      connectionString: process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL?.replace(/:[^@]+@/, ':****@'),
      allEnvVars: Object.keys(process.env)
        .filter(key => key.includes('POSTGRES') || key.includes('DATABASE'))
        .reduce((acc, key) => {
          acc[key] = process.env[key]?.replace(/:[^@]+@/, ':****@') || '';
          return acc;
        }, {} as Record<string, string>)
    };

    // 실제 DB에서 최근 데이터 확인
    const recentData = await pool.query(`
      SELECT
        email,
        depositor_name,
        created_at,
        created_at AT TIME ZONE 'Asia/Seoul' as kst_time
      FROM member_requests
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // 전체 데이터 개수
    const countResult = await pool.query('SELECT COUNT(*) FROM member_requests');

    // 오늘(한국시간) 데이터 개수
    const todayResult = await pool.query(`
      SELECT COUNT(*)
      FROM member_requests
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `);

    await pool.end();

    return NextResponse.json({
      connectionInfo,
      stats: {
        total: countResult.rows[0].count,
        last24Hours: todayResult.rows[0].count,
      },
      recentRequests: recentData.rows.map(r => ({
        email: r.email,
        depositorName: r.depositor_name,
        createdAt: r.created_at,
        kstTime: r.kst_time,
      })),
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get DB info',
      details: error instanceof Error ? error.message : String(error),
      envVars: Object.keys(process.env)
        .filter(key => key.includes('POSTGRES') || key.includes('DATABASE'))
        .reduce((acc, key) => {
          acc[key] = 'exists';
          return acc;
        }, {} as Record<string, string>)
    }, { status: 500 });
  }
}
