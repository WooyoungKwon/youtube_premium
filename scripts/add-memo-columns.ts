import { Pool } from 'pg';

const connectionString = (process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || '')
  .replace('sslmode=require', '')
  .replace('&&', '&');

const pool = new Pool({
  connectionString,
  ssl: false,
});

async function addMemoColumns() {
  try {
    console.log('Adding memo columns to apple_accounts and youtube_accounts tables...\n');

    // Add memo to apple_accounts
    await pool.query(`
      ALTER TABLE apple_accounts
      ADD COLUMN IF NOT EXISTS memo TEXT;
    `);
    console.log('✓ Added memo column to apple_accounts');

    // Add memo to youtube_accounts
    await pool.query(`
      ALTER TABLE youtube_accounts
      ADD COLUMN IF NOT EXISTS memo TEXT;
    `);
    console.log('✓ Added memo column to youtube_accounts');

    console.log('\n✓ Migration completed successfully!');

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

addMemoColumns();
