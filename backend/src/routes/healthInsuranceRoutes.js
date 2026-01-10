const express = require('express');
const {
  getHealthInsurancePlans,
  getFeaturedPlans,
  getHealthInsurancePlanById,
  comparePlans,
  getPlanStatistics
} = require('../controllers/healthInsuranceController');

const router = express.Router();

// Public routes
router.get('/plans', getHealthInsurancePlans);
router.get('/plans/featured', getFeaturedPlans);
router.get('/plans/statistics', getPlanStatistics);
router.get('/plans/:id', getHealthInsurancePlanById);
router.post('/plans/compare', comparePlans);

module.exports = router;