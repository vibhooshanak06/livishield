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
const { optionalAuth, authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes (with optional auth)
router.post('/submit', optionalAuth, submitProposal);
router.get('/user/:userId', getUserProposals);
router.get('/dashboard/:userId', getCustomerDashboard);

// Admin routes (require admin auth)
router.get('/', authenticate, authorize('admin'), getAllProposals);
router.put('/:id/status', authenticate, authorize('admin'), updateProposalStatus);
router.post('/:id/communication', authenticate, authorize('admin'), addCommunication);

// This should be last as it's a catch-all for IDs
router.get('/:id', getProposalById);

module.exports = router;