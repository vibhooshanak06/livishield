/**
 * fix_status_enum.js
 * Adds 'policy_issued' and 'cancelled' to the proposals status ENUM,
 * and adds 'policy_issued' to payment_status ENUM if missing.
 * Run: node src/utils/fix_status_enum.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function fix() {
  const conn = await mysql.createConnection({
    host:     process.env.MYSQL_HOST,
    port:     parseInt(process.env.MYSQL_PORT || '3306'),
    user:     process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  console.log('Connected...');

  // 1. Fix proposals.status ENUM — add policy_issued + cancelled if missing
  await conn.query(`
    ALTER TABLE health_insurance_proposals
    MODIFY COLUMN status ENUM(
      'submitted',
      'under_review',
      'documents_required',
      'documents_expired',
      'medical_checkup_required',
      'approved',
      'rejected',
      'policy_issued',
      'cancelled'
    ) NOT NULL DEFAULT 'submitted'
  `);
  console.log('✓ proposals.status ENUM updated');

  // 2. Fix proposals.payment_status ENUM
  await conn.query(`
    ALTER TABLE health_insurance_proposals
    MODIFY COLUMN payment_status ENUM(
      'not_required',
      'pending',
      'paid',
      'failed'
    ) NOT NULL DEFAULT 'not_required'
  `);
  console.log('✓ proposals.payment_status ENUM updated');

  // 3. Fix payments.status ENUM
  await conn.query(`
    ALTER TABLE payments
    MODIFY COLUMN status ENUM(
      'created',
      'attempted',
      'paid',
      'failed',
      'refunded'
    ) NOT NULL DEFAULT 'created'
  `);
  console.log('✓ payments.status ENUM updated');

  const [[col]] = await conn.query(
    "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='health_insurance_proposals' AND COLUMN_NAME='status' AND TABLE_SCHEMA=?",
    [process.env.MYSQL_DATABASE]
  );
  console.log('\nFinal proposals.status:', col.COLUMN_TYPE);

  await conn.end();
  console.log('\n✅ All ENUMs fixed.');
}

fix().catch(e => { console.error('❌', e.message); process.exit(1); });
