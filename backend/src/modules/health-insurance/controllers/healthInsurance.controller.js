'use strict';
/**
 * healthInsurance.controller.js
 * HTTP layer only — parse request, call service, format response.
 * Zero SQL / business logic here.
 */
const service = require('../services/healthInsurance.service');

const getHealthInsurancePlans = async (req, res) => {
  try {
    const data = await service.getPlans(req.query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getFeaturedPlans = async (req, res) => {
  try {
    const data = await service.getFeaturedPlans(req.query.limit);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getHealthInsurancePlanById = async (req, res) => {
  try {
    const plan = await service.getPlanById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Health insurance plan not found' });
    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const comparePlans = async (req, res) => {
  try {
    const data = await service.comparePlans(req.body.planIds);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getPlanStatistics = async (req, res) => {
  try {
    const data = await service.getStatistics();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getHealthInsurancePlans,
  getFeaturedPlans,
  getHealthInsurancePlanById,
  comparePlans,
  getPlanStatistics,
};
