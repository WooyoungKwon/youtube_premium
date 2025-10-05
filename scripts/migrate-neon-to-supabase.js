const { Pool } = require('pg');

// Neon DB (소스)
const neonPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_UDQ3ZFST6qmY@ep-jolly-field-a1434bun-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});

// Supabase DB (대상)
const supabasePool = new Pool({
  connectionString: 'postgresql://postgres.yspccxpyaxtqmmikjbpl:AOEs1YLr6gohgorM@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=15',
  ssl: false
});

async function migrateData() {
  try {
    console.log('🚀 데이터 마이그레이션 시작...\n');

    // 1. Admin Credentials 마이그레이션
    console.log('1️⃣ Admin Credentials 마이그레이션...');
    const adminCreds = await neonPool.query('SELECT * FROM admin_credentials ORDER BY created_at');
    let credCount = 0;
    for (const cred of adminCreds.rows) {
      try {
        await supabasePool.query(`
          INSERT INTO admin_credentials (id, credential_id, public_key, counter, device_name, created_at, last_used_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [cred.id, cred.credential_id, cred.public_key, cred.counter, cred.device_name, cred.created_at, cred.last_used_at]);
        credCount++;
      } catch (err) {
        console.log(`  ⚠️ 스킵: ${cred.id} (이미 존재)`);
      }
    }
    console.log(`  ✅ ${credCount}/${adminCreds.rows.length}개 마이그레이션 완료\n`);

    // 2. Member Requests 마이그레이션
    console.log('2️⃣ Member Requests 마이그레이션...');
    const requests = await neonPool.query('SELECT * FROM member_requests ORDER BY created_at');
    let reqCount = 0;
    for (const req of requests.rows) {
      try {
        await supabasePool.query(`
          INSERT INTO member_requests (id, email, kakao_id, phone, months, depositor_name, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING
        `, [req.id, req.email, req.kakao_id, req.phone, req.months, req.depositor_name, req.status, req.created_at]);
        reqCount++;
      } catch (err) {
        console.log(`  ⚠️ 스킵: ${req.email} (이미 존재)`);
      }
    }
    console.log(`  ✅ ${reqCount}/${requests.rows.length}개 마이그레이션 완료\n`);

    // 3. Apple Accounts 마이그레이션
    console.log('3️⃣ Apple Accounts 마이그레이션...');
    const appleAccounts = await neonPool.query('SELECT * FROM apple_accounts ORDER BY created_at');
    let appleCount = 0;
    for (const apple of appleAccounts.rows) {
      try {
        await supabasePool.query(`
          INSERT INTO apple_accounts (id, apple_email, remaining_credit, last_updated, created_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING
        `, [apple.id, apple.apple_email, apple.remaining_credit, apple.last_updated, apple.created_at]);
        appleCount++;
      } catch (err) {
        console.log(`  ⚠️ 스킵: ${apple.apple_email} (이미 존재)`);
      }
    }
    console.log(`  ✅ ${appleCount}/${appleAccounts.rows.length}개 마이그레이션 완료\n`);

    // 4. YouTube Accounts 마이그레이션
    console.log('4️⃣ YouTube Accounts 마이그레이션...');
    const youtubeAccounts = await neonPool.query('SELECT * FROM youtube_accounts ORDER BY created_at');
    let ytCount = 0;
    for (const yt of youtubeAccounts.rows) {
      try {
        await supabasePool.query(`
          INSERT INTO youtube_accounts (id, apple_account_id, youtube_email, nickname, renewal_date, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING
        `, [yt.id, yt.apple_account_id, yt.youtube_email, yt.nickname, yt.renewal_date, yt.created_at]);
        ytCount++;
      } catch (err) {
        console.log(`  ⚠️ 스킵: ${yt.youtube_email} - ${err.message}`);
      }
    }
    console.log(`  ✅ ${ytCount}/${youtubeAccounts.rows.length}개 마이그레이션 완료\n`);

    // 5. Members 마이그레이션
    console.log('5️⃣ Members 마이그레이션...');
    const members = await neonPool.query('SELECT * FROM members ORDER BY created_at');
    let memberCount = 0;
    for (const member of members.rows) {
      try {
        await supabasePool.query(`
          INSERT INTO members (id, youtube_account_id, request_id, nickname, email, name, last_payment_date, payment_date, deposit_status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING
        `, [member.id, member.youtube_account_id, member.request_id, member.nickname, member.email, member.name, member.last_payment_date, member.payment_date, member.deposit_status, member.created_at]);
        memberCount++;
      } catch (err) {
        console.log(`  ⚠️ 스킵: ${member.email} - ${err.message}`);
      }
    }
    console.log(`  ✅ ${memberCount}/${members.rows.length}개 마이그레이션 완료\n`);

    // 6. Revenue Records 마이그레이션
    console.log('6️⃣ Revenue Records 마이그레이션...');
    const revenues = await neonPool.query('SELECT * FROM revenue_records ORDER BY recorded_at');
    let revCount = 0;
    for (const rev of revenues.rows) {
      try {
        await supabasePool.query(`
          INSERT INTO revenue_records (id, member_id, amount, months, recorded_at, description)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING
        `, [rev.id, rev.member_id, rev.amount, rev.months, rev.recorded_at, rev.description]);
        revCount++;
      } catch (err) {
        console.log(`  ⚠️ 스킵: ${rev.id} - ${err.message}`);
      }
    }
    console.log(`  ✅ ${revCount}/${revenues.rows.length}개 마이그레이션 완료\n`);

    console.log('✨ 마이그레이션 완료!\n');

    // 최종 통계
    console.log('📊 최종 통계:');
    const finalRequests = await supabasePool.query('SELECT COUNT(*) FROM member_requests');
    const finalMembers = await supabasePool.query('SELECT COUNT(*) FROM members');
    const finalApple = await supabasePool.query('SELECT COUNT(*) FROM apple_accounts');
    const finalYoutube = await supabasePool.query('SELECT COUNT(*) FROM youtube_accounts');
    const finalRevenue = await supabasePool.query('SELECT COUNT(*) FROM revenue_records');

    console.log(`  신청: ${finalRequests.rows[0].count}개`);
    console.log(`  회원: ${finalMembers.rows[0].count}명`);
    console.log(`  Apple 계정: ${finalApple.rows[0].count}개`);
    console.log(`  YouTube 계정: ${finalYoutube.rows[0].count}개`);
    console.log(`  수익 기록: ${finalRevenue.rows[0].count}개`);

    await neonPool.end();
    await supabasePool.end();
  } catch (err) {
    console.error('❌ 마이그레이션 오류:', err.message);
    console.error(err);
    await neonPool.end();
    await supabasePool.end();
    process.exit(1);
  }
}

migrateData();
