const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getProposals,
  getProposalDetail,
  approveProposal,
  rejectProposal,
  requestDocuments,
  requireMedicalCheckup,
  verifyDocument,
  rejectDocument,
  assignAgent,
  getAuditLog,
  moveToUnderReview,
  getUsers,
  updateUserRole,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// Stats
router.get('/stats',                                      getDashboardStats);

// Proposal queue
router.get('/proposals',                                   getProposals);
router.get('/proposals/:id',                               getProposalDetail);

// Status actions
router.post('/proposals/:id/approve',                      approveProposal);
router.post('/proposals/:id/reject',                       rejectProposal);
router.post('/proposals/:id/request-documents',            requestDocuments);
router.post('/proposals/:id/medical-checkup',              requireMedicalCheckup);
router.post('/proposals/:id/assign',                       assignAgent);
router.post('/proposals/:id/under-review',                 moveToUnderReview);

// Document actions
router.post('/proposals/:id/documents/:docType/verify',    verifyDocument);
router.post('/proposals/:id/documents/:docType/reject',    rejectDocument);

// Audit log (MongoDB)
router.get('/proposals/:id/audit-log',                     getAuditLog);

// User management
router.get('/users',                                       getUsers);
router.patch('/users/:id/role',                            updateUserRole);

// Plan management
router.get('/plans',                                       getPlans);
router.post('/plans',                                      createPlan);
router.put('/plans/:id',                                   updatePlan);
router.delete('/plans/:id',                                deletePlan);

module.exports = router;
