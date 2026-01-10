const express = require('express');
const {
  submitProposal,
  getUserProposals,
  getCustomerDashboard,
  getProposalById,
  updateProposalStatus,
  getAllProposals,
  addCommunication
} = require('../controllers/proposalController');

const router = express.Router();

// Public routes (with optional auth)
router.post('/submit', submitProposal);
router.get('/user/:userId', getUserProposals);
router.get('/dashboard/:userId', getCustomerDashboard);

// Admin routes (require admin auth - implement auth middleware)
router.get('/', getAllProposals);
router.put('/:id/status', updateProposalStatus);
router.post('/:id/communication', addCommunication);

// This should be last as it's a catch-all for IDs
router.get('/:id', getProposalById);

module.exports = router;