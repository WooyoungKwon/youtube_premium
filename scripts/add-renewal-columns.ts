import { initDatabase } from '../lib/storage';

async function addRenewalColumns() {
  console.log('Adding will_renew and renew_months columns to members table...');

  try {
    await initDatabase();
    console.log('✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addRenewalColumns();
