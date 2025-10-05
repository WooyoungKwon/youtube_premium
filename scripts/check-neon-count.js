const { Pool } = require('pg');

const neonPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_UDQ3ZFST6qmY@ep-jolly-field-a1434bun-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});

async function checkCounts() {
  try {
    const members = await neonPool.query('SELECT COUNT(*) FROM members');
    const requests = await neonPool.query('SELECT COUNT(*) FROM member_requests');
    const apple = await neonPool.query('SELECT COUNT(*) FROM apple_accounts');
    const youtube = await neonPool.query('SELECT COUNT(*) FROM youtube_accounts');
    const revenue = await neonPool.query('SELECT COUNT(*) FROM revenue_records');

    console.log('📊 Neon DB 통계:');
    console.log(`  회원: ${members.rows[0].count}명`);
    console.log(`  신청: ${requests.rows[0].count}개`);
    console.log(`  Apple 계정: ${apple.rows[0].count}개`);
    console.log(`  YouTube 계정: ${youtube.rows[0].count}개`);
    console.log(`  수익 기록: ${revenue.rows[0].count}개`);

    await neonPool.end();
  } catch (err) {
    console.error('❌ 오류:', err.message);
    await neonPool.end();
    process.exit(1);
  }
}

checkCounts();
