const express = require('express');
const {
  submitProposal,
  getUserProposals,
  getCustomerDashboard,
  getProposalById,
  updateProposalStatus,
  getAllProposals,
  addCommunication,
  reactivateProposal,
  uploadDocument,
  deleteDocument,
  submitDocuments
} = require('../controllers/proposalController');
const { optionalAuth, authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Public / optional-auth routes
router.post('/submit', optionalAuth, submitProposal);
router.get('/user/:userId', getUserProposals);
router.get('/dashboard/:userId', getCustomerDashboard);

// Customer document routes — order matters: specific before :docType param
router.post('/:id/documents/submit', optionalAuth, submitDocuments);
router.post('/:id/documents', optionalAuth, upload.single('file'), uploadDocument);
router.delete('/:id/documents/:docType', optionalAuth, deleteDocument);
router.post('/:id/reactivate', optionalAuth, reactivateProposal);

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllProposals);
router.put('/:id/status', authenticate, authorize('admin'), updateProposalStatus);
router.post('/:id/communication', authenticate, authorize('admin'), addCommunication);

// Catch-all — keep last
router.get('/:id', getProposalById);

module.exports = router;