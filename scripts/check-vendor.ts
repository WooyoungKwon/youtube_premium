import { Pool } from 'pg';

const connectionString = (process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '')
  .replace('&&', '&')
  .replace('sslmode=require', '');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function checkVendor() {
  try {
    const vendorId = process.argv[2] || 'vendor_1760199406122_co2tz9gpy';
    console.log(`Checking vendor: ${vendorId}\n`);

    const result = await pool.query(`
      SELECT id, name, email, phone, is_active
      FROM vendors
      WHERE id = $1
    `, [vendorId]);

    if (result.rows.length === 0) {
      console.log('❌ Vendor not found in database');
    } else {
      const vendor = result.rows[0];
      console.log('✅ Vendor found:');
      console.log(`   ID: ${vendor.id}`);
      console.log(`   Name: ${vendor.name}`);
      console.log(`   Email: ${vendor.email}`);
      console.log(`   Phone: ${vendor.phone}`);
      console.log(`   Active: ${vendor.is_active}`);
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkVendor();
