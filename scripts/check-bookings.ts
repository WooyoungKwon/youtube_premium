import { Pool } from 'pg';

const connectionString = (process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '')
  .replace('&&', '&')
  .replace('sslmode=require', '');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function checkBookings() {
  try {
    console.log('Checking movie booking requests...\n');

    const result = await pool.query(`
      SELECT
        id,
        customer_email,
        customer_phone,
        movie_title,
        theater,
        show_date,
        show_time,
        seats,
        status,
        referral_code,
        referral_type,
        created_at
      FROM movie_booking_requests
      ORDER BY created_at DESC
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      console.log('❌ No booking requests found in database');
    } else {
      console.log(`✅ Found ${result.rows.length} booking request(s):\n`);
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.movie_title} at ${row.theater}`);
        console.log(`   Customer: ${row.customer_email} (${row.customer_phone})`);
        console.log(`   Time: ${row.show_date} ${row.show_time}`);
        console.log(`   Status: ${row.status}`);
        console.log(`   Referral: ${row.referral_code || 'none'} (${row.referral_type || 'none'})`);
        console.log(`   Created: ${row.created_at}`);
        console.log('');
      });
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkBookings();
