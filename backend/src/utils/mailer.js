'use strict';
/**
 * mailer.js — nodemailer transporter + HTML email templates.
 * Fire-and-forget pattern: never breaks the calling flow on failure.
 */
const nodemailer = require('nodemailer');
const logger     = require('./logger');

// ── Transporter (lazy-init) ────────────────────────────────────
let _transport = null;
const getTransport = () => {
  if (!_transport) {
    if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('your_gmail')) {
      return null; // Not configured — skip silently
    }
    _transport = nodemailer.createTransport({
      host:   process.env.SMTP_HOST || 'smtp.gmail.com',
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transport;
};

// ── Fire-and-forget helper ─────────────────────────────────────
const sendMail = (options) => {
  const transport = getTransport();
  if (!transport) {
    logger.warn(`Email skipped (SMTP not configured): ${options.subject}`);
    return;
  }
  transport.sendMail({
    from:     process.env.EMAIL_FROM || 'LiviShield <noreply@livishield.com>',
    replyTo:  'support@livishield.com',
    headers: {
      'X-Mailer':        'LiviShield Mailer 1.0',
      'X-Priority':      '3',          // Normal priority (not bulk)
      'Precedence':      'bulk',       // Tells Gmail to place in Primary/Updates
      'List-Unsubscribe':'<mailto:support@livishield.com>',
    },
    ...options,
  }).then(() => {
    logger.info(`Email sent: ${options.subject} → ${options.to}`);
  }).catch(err => {
    logger.warn(`Email failed (${options.subject}): ${err.message}`);
  });
};

// ── Shared HTML wrapper ─────────────────────────────────────────
const wrap = (body) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>LiviShield</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f0f4f8;-webkit-text-size-adjust:100%;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:30px 0;">
    <tr><td align="center">
      <table width="600" border="0" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0077b6;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">LiviShield</h1>
            <p style="margin:4px 0 0;color:#caf0f8;font-size:13px;">Health Insurance Protection</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              LiviShield Health Insurance | support@livishield.com<br/>
              You are receiving this email because you have an account with LiviShield.<br/>
              <a href="mailto:support@livishield.com?subject=Unsubscribe" style="color:#94a3b8;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── Reusable row ───────────────────────────────────────────────
const row = (label, value, highlight = false) => `
  <tr>
    <td style="padding:8px 12px;color:#64748b;font-size:13px;width:45%;border-bottom:1px solid #f1f5f9;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;font-weight:${highlight ? '700' : '500'};
               color:${highlight ? '#0077b6' : '#1e293b'};border-bottom:1px solid #f1f5f9;">${value}</td>
  </tr>`;

const fmt = (n) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) : '—';

// ══════════════════════════════════════════════════════════════
// TEMPLATE 1 — Policy Issued / Payment Success
// ══════════════════════════════════════════════════════════════
const sendPolicyIssuedEmail = ({
  to, firstName, planName, proposalNumber, policyNumber,
  policyStartDate, policyEndDate,
  amountPaid, gstAmount, netPremium, paymentId,
  paymentMethod,
}) => {
  const body = `
    <h2 style="margin:0 0 6px;color:#0f172a;font-size:20px;">🎉 Your Policy is Active!</h2>
    <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
      Congratulations, <strong>${firstName}</strong>! Your payment has been received and your
      <strong>${planName}</strong> policy is now active. You are covered starting today.
    </p>

    <!-- Policy Card -->
    <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #86efac;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;margin-bottom:12px;">
        <span style="font-size:22px;margin-right:10px;">🛡️</span>
        <div>
          <p style="margin:0;font-size:16px;font-weight:700;color:#15803d;">${planName}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#16a34a;">Policy Active ✓</p>
        </div>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row('Policy Number', `<span style="font-family:monospace;font-size:15px;color:#0077b6;">${policyNumber || '—'}</span>`, true)}
        ${row('Proposal Number', `<span style="font-family:monospace;">${proposalNumber}</span>`)}
        ${row('Coverage Start', fmtDate(policyStartDate))}
        ${row('Coverage End', fmtDate(policyEndDate))}
      </table>
    </div>

    <!-- Payment Summary -->
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Payment Receipt</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      ${row('Net Premium', fmt(netPremium))}
      ${row('GST (18%)', fmt(gstAmount))}
      ${row('Total Paid', `<strong style="color:#0077b6;font-size:15px;">${fmt(amountPaid)}</strong>`, true)}
      ${row('Payment Method', paymentMethod ? paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1) : 'Online')}
      ${row('Payment ID', `<span style="font-family:monospace;font-size:12px;color:#6b7280;">${paymentId || '—'}</span>`)}
    </table>

    <!-- What's next -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#1d4ed8;">What happens next?</p>
      <ul style="margin:0;padding-left:16px;color:#3730a3;font-size:13px;line-height:2;">
        <li>Your policy document will be issued within 24 hours</li>
        <li>Cashless treatment available at 50,000+ network hospitals</li>
        <li>For emergencies, call our 24/7 helpline: <strong>1800-123-4567</strong></li>
        <li>Keep this email as your payment confirmation</li>
      </ul>
    </div>

    <p style="margin:0;font-size:13px;color:#64748b;">
      Questions? Email us at 
      <a href="mailto:support@livishield.com" style="color:#0077b6;">support@livishield.com</a>
    </p>`;

  sendMail({
    to,
    subject: `✅ Policy Issued — ${planName} | ${policyNumber || proposalNumber}`,
    text: `Hi ${firstName},\n\nYour ${planName} policy is now active!\n\nPolicy Number: ${policyNumber || '—'}\nProposal: ${proposalNumber}\nAmount Paid: ${fmt(amountPaid)} (incl. 18% GST)\nPayment ID: ${paymentId || '—'}\n\nFor support: support@livishield.com\nHelpline: 1800-123-4567\n\n— LiviShield Health Insurance`,
    html: wrap(body),
  });
};

// ══════════════════════════════════════════════════════════════
// TEMPLATE 2 — Proposal Submitted confirmation
// ══════════════════════════════════════════════════════════════
const sendProposalSubmittedEmail = ({ to, firstName, planName, proposalNumber, requiredDocuments }) => {
  const docList = (requiredDocuments || [])
    .filter(d => d.required)
    .map(d => `<li style="margin-bottom:4px;color:#374151;">${d.name}</li>`)
    .join('');

  const body = `
    <h2 style="margin:0 0 6px;color:#0f172a;font-size:20px;">✅ Proposal Submitted Successfully</h2>
    <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
      Hi <strong>${firstName}</strong>, we've received your application for
      <strong>${planName}</strong>. Our team will review it within 1–2 business days.
    </p>

    <div style="background:#fefce8;border:1px solid #fde047;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#854d0e;">📋 Proposal Reference</p>
      <p style="margin:0;font-family:monospace;font-size:18px;font-weight:700;color:#0077b6;">${proposalNumber}</p>
    </div>

    ${docList ? `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151;">📎 Documents Required (upload within 48 hrs)</p>
    <ul style="margin:0 0 20px;padding-left:20px;">${docList}</ul>` : ''}

    <p style="margin:0;font-size:13px;color:#64748b;">
      Visit your dashboard to upload documents and track status:
      <a href="${process.env.FRONTEND_URL}/dashboard" style="color:#0077b6;font-weight:600;">My Dashboard →</a>
    </p>`;

  sendMail({
    to,
    subject: `Proposal Submitted — ${planName} | ${proposalNumber}`,
    text: `Hi ${firstName},\n\nWe've received your application for ${planName}.\n\nProposal Number: ${proposalNumber}\n\nPlease upload your documents within 48 hours at: ${process.env.FRONTEND_URL}/dashboard\n\n— LiviShield Health Insurance`,
    html: wrap(body),
  });
};

// ══════════════════════════════════════════════════════════════
// TEMPLATE 3 — Proposal Approved (pay now reminder)
// ══════════════════════════════════════════════════════════════
const sendProposalApprovedEmail = ({ to, firstName, planName, proposalNumber, proposalId, totalPayable }) => {
  const body = `
    <h2 style="margin:0 0 6px;color:#0f172a;font-size:20px;">🎊 Your Proposal is Approved!</h2>
    <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
      Great news, <strong>${firstName}</strong>! Your application for 
      <strong>${planName}</strong> has been approved by our underwriting team.
      Complete your payment to activate the policy.
    </p>

    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row('Proposal Number', `<span style="font-family:monospace;">${proposalNumber}</span>`)}
        ${row('Plan', planName)}
        ${row('Amount Due (incl. 18% GST)', `<strong style="color:#15803d;font-size:15px;">${fmt(totalPayable)}</strong>`, true)}
      </table>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.FRONTEND_URL}/proposals/${proposalId}/pay"
         style="display:inline-block;background:linear-gradient(135deg,#00b4d8,#0077b6);color:#fff;
                text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;">
        Pay Now &amp; Activate Policy →
      </a>
    </div>

    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
      Amount includes 18% GST as per IRDAI regulations.
    </p>`;

  sendMail({
    to,
    subject: `Your ${planName} proposal is approved — pay to activate`,
    text: `Hi ${firstName},\n\nGreat news! Your ${planName} application has been approved.\n\nProposal: ${proposalNumber}\nAmount Due (incl. 18% GST): ${fmt(totalPayable)}\n\nPay now: ${process.env.FRONTEND_URL}/proposals/${proposalId}/pay\n\n— LiviShield Health Insurance`,
    html: wrap(body),
  });
};

// ══════════════════════════════════════════════════════════════
// TEMPLATE 4 — Proposal Rejected
// ══════════════════════════════════════════════════════════════
const sendProposalRejectedEmail = ({ to, firstName, planName, proposalNumber, reason, detailedReason }) => {
  const body = `
    <h2 style="margin:0 0 6px;color:#0f172a;font-size:20px;">Update on Your Health Insurance Application</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
      Hi <strong>${firstName}</strong>, we regret to inform you that your application for
      <strong>${planName}</strong> could not be approved at this time.
    </p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#991b1b;">📋 Application Reference</p>
      <p style="margin:0 0 12px;font-family:monospace;font-size:16px;font-weight:700;color:#dc2626;">${proposalNumber}</p>
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#7f1d1d;">Reason:</p>
      <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.5;">${reason}</p>
      ${detailedReason ? `<p style="margin:8px 0 0;font-size:12px;color:#b91c1c;line-height:1.5;">${detailedReason}</p>` : ''}
    </div>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#1d4ed8;">What you can do</p>
      <ul style="margin:0;padding-left:16px;color:#3730a3;font-size:13px;line-height:2;">
        <li>Review the reason above and consider re-applying with updated information</li>
        <li>Browse other health insurance plans that may better fit your profile</li>
        <li>Contact our support team for personalised guidance</li>
      </ul>
    </div>

    <div style="text-align:center;margin:20px 0;">
      <a href="${process.env.FRONTEND_URL}/health-insurance/plans"
         style="display:inline-block;background:linear-gradient(135deg,#00b4d8,#0077b6);color:#fff;
                text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin-right:12px;">
        Browse Plans →
      </a>
      <a href="mailto:support@livishield.com"
         style="display:inline-block;background:#f8fafc;border:1px solid #e2e8f0;color:#374151;
                text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">
        Contact Support
      </a>
    </div>

    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
      We appreciate your trust in LiviShield and hope to serve you better in the future.
    </p>`;

  sendMail({
    to,
    subject: `Update on your ${planName} application — ${proposalNumber}`,
    text: `Hi ${firstName},\n\nWe regret to inform you that your ${planName} application (${proposalNumber}) could not be approved.\n\nReason: ${reason}\n${detailedReason ? `\nDetails: ${detailedReason}\n` : ''}\nYou can browse other plans at: ${process.env.FRONTEND_URL}/health-insurance/plans\n\nFor support: support@livishield.com\n\n— LiviShield Health Insurance`,
    html: wrap(body),
  });
};

module.exports = { sendPolicyIssuedEmail, sendProposalSubmittedEmail, sendProposalApprovedEmail, sendProposalRejectedEmail };