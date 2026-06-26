'use strict';
const express        = require('express');
const { authenticate } = require('../../../middleware/auth');
const ctrl           = require('../controllers/payment.controller');

const router = express.Router();

// Webhook must use raw body — registered BEFORE json middleware via express.raw()
// We handle it here but raw-body capture is done in app.js
router.post('/webhook', ctrl.webhook);

// All other payment routes require auth
router.post('/orders/:proposalId',   authenticate, ctrl.createOrder);
router.post('/verify',               authenticate, ctrl.verifyPayment);
router.get('/my',                    authenticate, ctrl.getUserPayments);
router.get('/proposal/:proposalId',  authenticate, ctrl.getPaymentByProposal);

module.exports = router;
