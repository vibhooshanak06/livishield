'use strict';
const express = require('express');
const { authenticate, authorize } = require('../../../middleware/auth');
const ctrl = require('../controllers/admin.controller');

const router = express.Router();
router.use(authenticate, authorize('admin'));

router.get('/stats',                                        ctrl.getDashboardStats);
router.get('/proposals',                                    ctrl.getProposals);
router.get('/proposals/:id',                               ctrl.getProposalDetail);
router.post('/proposals/:id/approve',                      ctrl.approveProposal);
router.post('/proposals/:id/reject',                       ctrl.rejectProposal);
router.post('/proposals/:id/request-documents',            ctrl.requestDocuments);
router.post('/proposals/:id/medical-checkup',              ctrl.requireMedicalCheckup);
router.post('/proposals/:id/assign',                       ctrl.assignAgent);
router.post('/proposals/:id/under-review',                 ctrl.moveToUnderReview);
router.post('/proposals/:id/documents/:docType/verify',    ctrl.verifyDocument);
router.post('/proposals/:id/documents/:docType/reject',    ctrl.rejectDocument);
router.get('/proposals/:id/audit-log',                     ctrl.getAuditLog);
router.get('/users',                                       ctrl.getUsers);
router.patch('/users/:id/role',                            ctrl.updateUserRole);
router.get('/plans',                                       ctrl.getPlans);
router.post('/plans',                                      ctrl.createPlan);
router.put('/plans/:id',                                   ctrl.updatePlan);
router.delete('/plans/:id',                                ctrl.deletePlan);

module.exports = router;
