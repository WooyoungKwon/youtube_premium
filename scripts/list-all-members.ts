import { Pool } from 'pg';

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

async function listAllMembers() {
  try {
    const { rows } = await pool.query(`
      SELECT
        name,
        email,
        TO_CHAR(payment_date, 'YYYY-MM-DD') as payment_date,
        EXTRACT(DAY FROM payment_date) as day
      FROM members
      ORDER BY name
    `);

    console.log(`총 회원 수: ${rows.length}명\n`);
    rows.forEach(row => {
      console.log(`${row.name} - ${row.day}일 (${row.payment_date}) - ${row.email}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

listAllMembers();
