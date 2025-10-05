const { Pool } = require('pg');

const supabasePool = new Pool({
  connectionString: 'postgresql://postgres.yspccxpyaxtqmmikjbpl:AOEs1YLr6gohgorM@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=15',
  ssl: false
});

async function checkCounts() {
  try {
    const members = await supabasePool.query('SELECT COUNT(*) FROM members');
    const requests = await supabasePool.query('SELECT COUNT(*) FROM member_requests');
    const apple = await supabasePool.query('SELECT COUNT(*) FROM apple_accounts');
    const youtube = await supabasePool.query('SELECT COUNT(*) FROM youtube_accounts');
    const revenue = await supabasePool.query('SELECT COUNT(*) FROM revenue_records');

    console.log('📊 Supabase DB 통계:');
    console.log(`  회원: ${members.rows[0].count}명`);
    console.log(`  신청: ${requests.rows[0].count}개`);
    console.log(`  Apple 계정: ${apple.rows[0].count}개`);
    console.log(`  YouTube 계정: ${youtube.rows[0].count}개`);
    console.log(`  수익 기록: ${revenue.rows[0].count}개`);

    await supabasePool.end();
  } catch (err) {
    console.error('❌ 오류:', err.message);
    await supabasePool.end();
    process.exit(1);
  }
}

checkCounts();
