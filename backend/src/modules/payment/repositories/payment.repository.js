'use strict';
const { getConnection } = require('../../../config/mysql');

class PaymentRepository {
  async createPayment({ id, proposalId, userId, razorpayOrderId, amount, currency }) {
    const conn = getConnection();
    await conn.query(
      `INSERT INTO payments (id, proposal_id, user_id, razorpay_order_id, amount, currency, status)
       VALUES (?, ?, ?, ?, ?, ?, 'created')`,
      [id, proposalId, userId, razorpayOrderId, amount, currency]
    );
  }

  async findByProposalId(proposalId) {
    const [rows] = await getConnection().query(
      'SELECT * FROM payments WHERE proposal_id = ? ORDER BY created_at DESC LIMIT 1',
      [proposalId]
    );
    return rows[0] || null;
  }

  async findByOrderId(orderId) {
    const [rows] = await getConnection().query(
      'SELECT * FROM payments WHERE razorpay_order_id = ?', [orderId]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await getConnection().query(
      'SELECT * FROM payments WHERE id = ?', [id]
    );
    return rows[0] || null;
  }

  async findByUserId(userId) {
    const [rows] = await getConnection().query(
      `SELECT p.*, pr.proposal_number, pr.plan_id,
              pl.name AS plan_name, pl.provider AS plan_provider
       FROM payments p
       LEFT JOIN health_insurance_proposals pr ON p.proposal_id = pr.id
       LEFT JOIN health_insurance_plans pl ON pr.plan_id = pl.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return rows;
  }

  async markPaid({ id, razorpayPaymentId, razorpaySignature, paymentMethod, paymentDetails }) {
    await getConnection().query(
      `UPDATE payments
       SET status = 'paid',
           razorpay_payment_id = ?,
           razorpay_signature  = ?,
           payment_method      = ?,
           payment_details     = ?,
           paid_at             = NOW(),
           updated_at          = NOW()
       WHERE id = ?`,
      [razorpayPaymentId, razorpaySignature,
       paymentMethod, JSON.stringify(paymentDetails || {}), id]
    );
  }

  async markFailed(id) {
    await getConnection().query(
      `UPDATE payments SET status = 'failed', updated_at = NOW() WHERE id = ?`, [id]
    );
  }

  async updateProposalPaymentStatus(proposalId, paymentStatus) {
    await getConnection().query(
      `UPDATE health_insurance_proposals SET payment_status = ?, updated_at = NOW() WHERE id = ?`,
      [paymentStatus, proposalId]
    );
  }

  async updateProposalToPolicyIssued(proposalId, statusHistory) {
    await getConnection().query(
      `UPDATE health_insurance_proposals
       SET status = 'policy_issued', payment_status = 'paid',
           status_history = ?, updated_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(statusHistory), proposalId]
    );
  }

  async findProposalForPayment(proposalId) {
    const [rows] = await getConnection().query(
      `SELECT p.*, pl.name AS plan_name, pl.sum_insured,
              pl.premium_annual, pl.premium_monthly
       FROM health_insurance_proposals p
       LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id
       WHERE p.id = ?`,
      [proposalId]
    );
    return rows[0] || null;
  }
}

module.exports = new PaymentRepository();
