'use strict';
const Razorpay    = require('razorpay');
const crypto      = require('crypto');
const { randomUUID } = require('crypto');
const repo        = require('../repositories/payment.repository');
const logger      = require('../../../utils/logger');

const parseJSON = (v, fb = null) => {
  if (!v) return fb;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return fb; }
};

// Lazy-init Razorpay so missing keys don't crash startup
let _rzp = null;
const getRazorpay = () => {
  if (!_rzp) {
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('REPLACE')) {
      throw Object.assign(
        new Error('Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'),
        { statusCode: 503 }
      );
    }
    _rzp = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _rzp;
};

class PaymentService {

  /* ── Create Razorpay order ── */
  async createOrder(proposalId, userId) {
    const proposal = await repo.findProposalForPayment(proposalId);
    if (!proposal) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });

    if (proposal.user_id !== String(userId))
      throw Object.assign(new Error('Access denied'), { statusCode: 403 });

    if (proposal.status !== 'approved')
      throw Object.assign(new Error('Payment is only allowed for approved proposals'), { statusCode: 400 });

    if (proposal.payment_status === 'paid')
      throw Object.assign(new Error('Premium for this proposal has already been paid'), { statusCode: 400 });

    const premiumDetails = parseJSON(proposal.premium_details, {});
    const amount         = Math.round((premiumDetails.totalAnnualPremium || proposal.premium_annual || 0) * 100); // paise
    if (amount <= 0) throw Object.assign(new Error('Invalid premium amount'), { statusCode: 400 });

    const rzp   = getRazorpay();
    const order = await rzp.orders.create({
      amount,
      currency: 'INR',
      receipt:  `rcpt_${proposalId.slice(0, 10)}_${Date.now()}`,
      notes: {
        proposalId,
        proposalNumber: proposal.proposal_number,
        userId:         String(userId),
        planName:       proposal.plan_name || '',
      },
    });

    // Save order in DB
    await repo.createPayment({
      id:              randomUUID(),
      proposalId,
      userId:          String(userId),
      razorpayOrderId: order.id,
      amount:          amount / 100,
      currency:        'INR',
    });

    // Mark proposal as payment_pending
    await repo.updateProposalPaymentStatus(proposalId, 'pending');

    logger.info(`Razorpay order created: ${order.id} for proposal ${proposal.proposal_number}`);

    return {
      orderId:        order.id,
      amount:         order.amount,   // paise
      currency:       order.currency,
      keyId:          process.env.RAZORPAY_KEY_ID,
      proposalNumber: proposal.proposal_number,
      planName:       proposal.plan_name,
      description:    `Annual premium for ${proposal.plan_name}`,
      prefill: {
        name:    parseJSON(proposal.personal_info, {}).firstName || '',
        email:   parseJSON(proposal.personal_info, {}).email     || '',
        contact: parseJSON(proposal.personal_info, {}).phone     || '',
      },
    };
  }

  /* ── Verify payment after frontend callback ── */
  async verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature, userId }) {
    // 1. Signature check
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expected !== razorpaySignature)
      throw Object.assign(new Error('Payment signature verification failed'), { statusCode: 400 });

    // 2. Load payment record
    const payment = await repo.findByOrderId(razorpayOrderId);
    if (!payment) throw Object.assign(new Error('Payment record not found'), { statusCode: 404 });
    if (payment.user_id !== String(userId))
      throw Object.assign(new Error('Access denied'), { statusCode: 403 });
    if (payment.status === 'paid')
      return { alreadyPaid: true, proposalId: payment.proposal_id };

    // 3. Fetch payment details from Razorpay
    const rzp          = getRazorpay();
    const rzpPayment   = await rzp.payments.fetch(razorpayPaymentId);
    const paymentMethod = rzpPayment.method || 'card';

    // 4. Mark payment paid
    await repo.markPaid({
      id:                 payment.id,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod,
      paymentDetails:     rzpPayment,
    });

    // 5. Move proposal → policy_issued
    const proposal = await repo.findProposalForPayment(payment.proposal_id);
    const history  = parseJSON(proposal.status_history, []);
    history.push({
      status:    'policy_issued',
      comment:   `Premium paid via Razorpay. Payment ID: ${razorpayPaymentId}`,
      updatedBy: String(userId),
      timestamp: new Date(),
    });
    await repo.updateProposalToPolicyIssued(payment.proposal_id, history);

    logger.info(`Payment ${razorpayPaymentId} verified. Proposal ${proposal.proposal_number} → policy_issued`);

    return {
      success:        true,
      proposalId:     payment.proposal_id,
      proposalNumber: proposal.proposal_number,
      planName:       proposal.plan_name,
      amountPaid:     payment.amount,
      paymentId:      razorpayPaymentId,
      policyDetails:  parseJSON(proposal.policy_details, null),
    };
  }

  /* ── Razorpay webhook handler ── */
  async handleWebhook(rawBody, signature) {
    const secret   = process.env.RAZORPAY_WEBHOOK_SECRET;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (expected !== signature) {
      throw Object.assign(new Error('Invalid webhook signature'), { statusCode: 400 });
    }

    const event = JSON.parse(rawBody);
    logger.info(`Webhook received: ${event.event}`);

    if (event.event === 'payment.captured') {
      const p = event.payload.payment.entity;
      const payment = await repo.findByOrderId(p.order_id);
      if (payment && payment.status !== 'paid') {
        await repo.markPaid({
          id: payment.id, razorpayPaymentId: p.id,
          razorpaySignature: '', paymentMethod: p.method, paymentDetails: p,
        });
        const proposal = await repo.findProposalForPayment(payment.proposal_id);
        if (proposal && proposal.status === 'approved') {
          const history = parseJSON(proposal.status_history, []);
          history.push({ status: 'policy_issued', comment: `Webhook: payment captured ${p.id}`, updatedBy: 'system', timestamp: new Date() });
          await repo.updateProposalToPolicyIssued(payment.proposal_id, history);
          logger.info(`Webhook: proposal ${proposal.proposal_number} → policy_issued`);
        }
      }
    }

    if (event.event === 'payment.failed') {
      const p = event.payload.payment.entity;
      const payment = await repo.findByOrderId(p.order_id);
      if (payment) {
        await repo.markFailed(payment.id);
        await repo.updateProposalPaymentStatus(payment.proposal_id, 'failed');
        logger.info(`Webhook: payment failed for order ${p.order_id}`);
      }
    }
  }

  /* ── Get user payment history ── */
  async getUserPayments(userId) {
    const rows = await repo.findByUserId(userId);
    return rows.map(r => ({
      id:               r.id,
      proposalId:       r.proposal_id,
      proposalNumber:   r.proposal_number,
      planName:         r.plan_name,
      planProvider:     r.plan_provider,
      amount:           r.amount,
      currency:         r.currency,
      status:           r.status,
      paymentMethod:    r.payment_method,
      razorpayOrderId:  r.razorpay_order_id,
      razorpayPaymentId:r.razorpay_payment_id,
      paidAt:           r.paid_at,
      createdAt:        r.created_at,
    }));
  }

  /* ── Get single payment for a proposal ── */
  async getPaymentByProposal(proposalId, userId) {
    const proposal = await repo.findProposalForPayment(proposalId);
    if (!proposal) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
    if (proposal.user_id !== String(userId))
      throw Object.assign(new Error('Access denied'), { statusCode: 403 });
    return repo.findByProposalId(proposalId);
  }
}

module.exports = new PaymentService();
