/**
 * test_email.js — Quick smoke test for the email setup.
 * Run: node src/utils/test_email.js your@email.com
 *
 * Steps to configure Gmail:
 * 1. Go to myaccount.google.com → Security → 2-Step Verification → ON
 * 2. Go to myaccount.google.com → Security → App Passwords
 * 3. Select "Mail" + "Windows Computer" → Generate
 * 4. Copy the 16-char password into .env SMTP_PASS
 * 5. Set SMTP_USER=your_gmail@gmail.com
 * 6. Set EMAIL_FROM=LiviShield <your_gmail@gmail.com>
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

const to = process.argv[2];
if (!to) { console.error('Usage: node src/utils/test_email.js recipient@email.com'); process.exit(1); }

if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('your_gmail')) {
  console.error('❌  SMTP_USER not configured in .env');
  console.log('\nAdd these to your .env file:');
  console.log('  SMTP_HOST=smtp.gmail.com');
  console.log('  SMTP_PORT=587');
  console.log('  SMTP_USER=your_gmail@gmail.com');
  console.log('  SMTP_PASS=your_16_char_app_password');
  console.log('  EMAIL_FROM=LiviShield <your_gmail@gmail.com>');
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

async function run() {
  console.log(`Testing SMTP connection to ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}...`);
  await transport.verify();
  console.log('✓ SMTP connection OK');

  console.log(`Sending test email to ${to}...`);
  await transport.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject: '✅ LiviShield Email Test',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:20px auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;">
        <h2 style="color:#0077b6;">🛡️ LiviShield</h2>
        <p>Your email configuration is working correctly!</p>
        <p style="color:#64748b;font-size:13px;">
          This confirms that LiviShield can send emails for:<br/>
          ✓ Proposal submission confirmations<br/>
          ✓ Approval notifications with pay link<br/>
          ✓ Policy issued receipts after payment
        </p>
        <p style="color:#94a3b8;font-size:12px;">Sent at ${new Date().toLocaleString('en-IN')}</p>
      </div>`,
  });
  console.log(`✅ Test email sent to ${to}`);
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Email test failed:', err.message);
  if (err.message.includes('Invalid login')) {
    console.log('\nFix: Use a Gmail App Password (not your regular password).');
    console.log('Guide: myaccount.google.com → Security → App Passwords');
  }
  process.exit(1);
});
