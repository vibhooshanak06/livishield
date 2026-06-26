'use strict';
const service = require('../services/payment.service');

/* ── Create Razorpay order ── */
const createOrder = async (req, res) => {
  try {
    const data = await service.createOrder(req.params.proposalId, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

/* ── Verify payment (called from frontend after Razorpay success callback) ── */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const data = await service.verifyPayment({
      razorpayOrderId:  razorpay_order_id,
      razorpayPaymentId:razorpay_payment_id,
      razorpaySignature:razorpay_signature,
      userId: req.user.id,
    });
    res.json({ success: true, message: 'Payment verified successfully', data });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

/* ── Razorpay webhook (raw body required) ── */
const webhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    await service.handleWebhook(req.rawBody, signature);
    res.json({ success: true });
  } catch (e) {
    res.status(e.statusCode || 400).json({ success: false, message: e.message });
  }
};

/* ── Get user payment history ── */
const getUserPayments = async (req, res) => {
  try {
    const data = await service.getUserPayments(req.user.id);
    res.json({ success: true, data });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

/* ── Get payment status for a specific proposal ── */
const getPaymentByProposal = async (req, res) => {
  try {
    const data = await service.getPaymentByProposal(req.params.proposalId, req.user.id);
    res.json({ success: true, data });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

module.exports = { createOrder, verifyPayment, webhook, getUserPayments, getPaymentByProposal };
