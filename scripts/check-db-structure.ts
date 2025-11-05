import { Pool } from 'pg';

const connectionString = (process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || '')
  .replace('sslmode=require', '')
  .replace('&&', '&');

const pool = new Pool({
  connectionString,
  ssl: false,
});

async function checkStructure() {
  try {
    // Check members table
    const membersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'members'
      ORDER BY ordinal_position;
    `);

    console.log('=== MEMBERS TABLE ===');
    membersResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Check apple_accounts table
    const appleResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'apple_accounts'
      ORDER BY ordinal_position;
    `);

    console.log('\n=== APPLE_ACCOUNTS TABLE ===');
    appleResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Check youtube_accounts table
    const youtubeResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'youtube_accounts'
      ORDER BY ordinal_position;
    `);

    console.log('\n=== YOUTUBE_ACCOUNTS TABLE ===');
    youtubeResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkStructure();
