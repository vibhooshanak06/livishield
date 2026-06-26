'use strict';
const express = require('express');
const ctrl    = require('../controllers/healthInsurance.controller');

const router = express.Router();

// Specific paths MUST come before parameterised :id
router.get('/plans/featured',   ctrl.getFeaturedPlans);
router.get('/plans/statistics', ctrl.getPlanStatistics);
router.get('/plans',            ctrl.getHealthInsurancePlans);
router.get('/plans/:id',        ctrl.getHealthInsurancePlanById);
router.post('/plans/compare',   ctrl.comparePlans);

module.exports = router;
