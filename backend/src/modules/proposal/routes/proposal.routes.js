'use strict';
const express = require('express');
const ctrl    = require('../controllers/proposal.controller');
const { optionalAuth, authenticate, authorize } = require('../../../middleware/auth');
const { upload } = require('../../../middleware/upload');

const router = express.Router();

router.post('/submit',                   optionalAuth,                                    ctrl.submitProposal);
router.get('/user/:userId',              ctrl.getUserProposals);
router.get('/dashboard/:userId',         ctrl.getCustomerDashboard);

// Specific sub-paths before :docType param
router.post('/:id/documents/submit',     optionalAuth,                                    ctrl.submitDocuments);
router.post('/:id/documents',            optionalAuth, upload.single('file'),             ctrl.uploadDocument);
router.delete('/:id/documents/:docType', optionalAuth,                                    ctrl.deleteDocument);
router.post('/:id/reactivate',           optionalAuth,                                    ctrl.reactivateProposal);

// Admin-only
router.get('/',                          authenticate, authorize('admin'),                ctrl.getAllProposals);
router.put('/:id/status',                authenticate, authorize('admin'),                ctrl.updateProposalStatus);
router.post('/:id/communication',        authenticate, authorize('admin'),                ctrl.addCommunication);

// Catch-all last
router.get('/:id',                       ctrl.getProposalById);

module.exports = router;
