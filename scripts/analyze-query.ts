import { pool } from '../lib/storage';

async function analyzeQuery() {
  try {
    console.log('Analyzing query performance...\n');

    // EXPLAIN ANALYZE로 쿼리 실행 계획 확인
    const explainQuery = `
      EXPLAIN ANALYZE
      SELECT
        mr.id,
        mr.email,
        mr.kakao_id as "kakaoId",
        mr.phone,
        mr.referral_email as "referralEmail",
        mr.months,
        mr.depositor_name as "depositorName",
        mr.plan_type as "planType",
        mr.account_type as "accountType",
        mr.status,
        mr.created_at as "createdAt",
        (m.id IS NOT NULL) as "isRegistered"
      FROM member_requests mr
      LEFT JOIN members m ON mr.id = m.request_id
      ORDER BY mr.created_at DESC
      LIMIT 10 OFFSET 0
    `;

    const result = await pool.query(explainQuery);
    console.log('Query Execution Plan:');
    result.rows.forEach((row: any) => {
      console.log(row['QUERY PLAN']);
    });

    console.log('\n--- Checking indexes ---');
    const indexQuery = `
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND (tablename = 'member_requests' OR tablename = 'members')
      ORDER BY tablename, indexname;
    `;

    const indexes = await pool.query(indexQuery);
    console.log('\nExisting indexes:');
    indexes.rows.forEach((row: any) => {
      console.log(`  ${row.tablename}.${row.indexname}: ${row.indexdef}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

analyzeQuery();
