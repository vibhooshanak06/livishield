/**
 * migrate_payments.js
 * Creates the payments table and adds payment_status column to proposals.
 * Run: node src/utils/migrate_payments.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host:     process.env.MYSQL_HOST,
    port:     parseInt(process.env.MYSQL_PORT || '3306'),
    user:     process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  console.log('Connected to MySQL...');

  // 1. Create payments table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id               VARCHAR(36)     NOT NULL PRIMARY KEY,
      proposal_id      VARCHAR(36)     NOT NULL,
      user_id          VARCHAR(100)    NOT NULL,
      razorpay_order_id   VARCHAR(100) UNIQUE,
      razorpay_payment_id VARCHAR(100) UNIQUE,
      razorpay_signature  TEXT,
      amount           DECIMAL(12,2)   NOT NULL,
      currency         VARCHAR(10)     NOT NULL DEFAULT 'INR',
      status           ENUM('created','attempted','paid','failed','refunded')
                       NOT NULL DEFAULT 'created',
      payment_method   VARCHAR(50),
      payment_details  JSON,
      paid_at          DATETIME,
      created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_proposal (proposal_id),
      INDEX idx_user     (user_id),
      INDEX idx_rzp_order (razorpay_order_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✓ payments table ready');

  // 2. Add payment_status column to proposals if missing
  const [cols] = await conn.query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='health_insurance_proposals' AND COLUMN_NAME='payment_status' AND TABLE_SCHEMA=?",
    [process.env.MYSQL_DATABASE]
  );
  if (!cols.length) {
    await conn.query(`
      ALTER TABLE health_insurance_proposals
      ADD COLUMN payment_status ENUM('not_required','pending','paid','failed')
        NOT NULL DEFAULT 'not_required'
        AFTER status
    `);
    console.log('✓ payment_status column added to health_insurance_proposals');
  } else {
    console.log('  payment_status column already exists');
  }

  console.log('\n✅ Payment migration complete.');
  await conn.end();
}

migrate().catch(err => { console.error('❌', err.message); process.exit(1); });
