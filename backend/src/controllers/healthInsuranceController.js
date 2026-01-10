const HealthInsurancePlan = require('../models/HealthInsurancePlan');
const { validationResult } = require('express-validator');

// Get all health insurance plans with filtering and pagination
const getHealthInsurancePlans = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      minSumInsured,
      maxSumInsured,
      minPremium,
      maxPremium,
      provider,
      popular,
      recommended,
      sortBy = 'premium.annual',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };
    
    if (type) filter.type = type;
    if (provider) filter.provider = new RegExp(provider, 'i');
    if (popular === 'true') filter.popular = true;
    if (recommended === 'true') filter.recommended = true;
    
    if (minSumInsured || maxSumInsured) {
      filter.sumInsured = {};
      if (minSumInsured) filter.sumInsured.$gte = parseInt(minSumInsured);
      if (maxSumInsured) filter.sumInsured.$lte = parseInt(maxSumInsured);
    }
    
    if (minPremium || maxPremium) {
      filter['premium.annual'] = {};
      if (minPremium) filter['premium.annual'].$gte = parseInt(minPremium);
      if (maxPremium) filter['premium.annual'].$lte = parseInt(maxPremium);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const plans = await HealthInsurancePlan.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await HealthInsurancePlan.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        plans,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalPlans: total,
          hasNext: skip + plans.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching health insurance plans',
      error: error.message
    });
  }
};

// Get featured/popular plans for homepage
const getFeaturedPlans = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const plans = await HealthInsurancePlan.find({
      status: 'active',
      $or: [{ popular: true }, { recommended: true }]
    })
      .sort({ rating: -1, 'premium.annual': 1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured plans',
      error: error.message
    });
  }
};

// Get single health insurance plan by ID
const getHealthInsurancePlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await HealthInsurancePlan.findById(id).lean();

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Health insurance plan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching health insurance plan',
      error: error.message
    });
  }
};

// Get plan comparison data
const comparePlans = async (req, res) => {
  try {
    const { planIds } = req.body;

    if (!planIds || !Array.isArray(planIds) || planIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 2 plan IDs for comparison'
      });
    }

    if (planIds.length > 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 plans can be compared at once'
      });
    }

    const plans = await HealthInsurancePlan.find({
      _id: { $in: planIds },
      status: 'active'
    }).lean();

    if (plans.length !== planIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more plans not found'
      });
    }

    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error comparing plans',
      error: error.message
    });
  }
};

// Get plan statistics
const getPlanStatistics = async (req, res) => {
  try {
    const stats = await HealthInsurancePlan.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalPlans: { $sum: 1 },
          avgPremium: { $avg: '$premium.annual' },
          minPremium: { $min: '$premium.annual' },
          maxPremium: { $max: '$premium.annual' },
          avgSumInsured: { $avg: '$sumInsured' },
          avgRating: { $avg: '$rating' },
          popularPlans: { $sum: { $cond: ['$popular', 1, 0] } },
          recommendedPlans: { $sum: { $cond: ['$recommended', 1, 0] } }
        }
      }
    ]);

    const typeStats = await HealthInsurancePlan.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgPremium: { $avg: '$premium.annual' }
        }
      }
    ]);

    const providerStats = await HealthInsurancePlan.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$provider',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || {},
        byType: typeStats,
        byProvider: providerStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plan statistics',
      error: error.message
    });
  }
};

module.exports = {
  getHealthInsurancePlans,
  getFeaturedPlans,
  getHealthInsurancePlanById,
  comparePlans,
  getPlanStatistics
};