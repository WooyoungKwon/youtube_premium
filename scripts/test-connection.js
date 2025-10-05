const { Pool } = require('pg');

// Supabase connection URL
const connectionString = 'postgresql://postgres.yspccxpyaxtqmmikjbpl:AOEs1YLr6gohgorM@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=15';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@'));

    const result = await pool.query('SELECT COUNT(*) as total FROM members');
    console.log('✅ Connection successful!');
    console.log('Total members:', result.rows[0].total);

    await pool.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Full error:', err);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
