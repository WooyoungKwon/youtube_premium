const { Pool } = require('pg');

const supabasePool = new Pool({
  connectionString: 'postgresql://postgres.yspccxpyaxtqmmikjbpl:AOEs1YLr6gohgorM@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=15',
  ssl: false
});

async function fixSchema() {
  try {
    console.log('🔧 Supabase 스키마 수정 중...\n');

    // renewal_date를 nullable로 변경
    await supabasePool.query(`
      ALTER TABLE youtube_accounts
      ALTER COLUMN renewal_date DROP NOT NULL
    `);

    console.log('✅ renewal_date를 nullable로 변경 완료!\n');

    await supabasePool.end();
  } catch (err) {
    console.error('❌ 오류:', err.message);
    await supabasePool.end();
    process.exit(1);
  }
}

fixSchema();
