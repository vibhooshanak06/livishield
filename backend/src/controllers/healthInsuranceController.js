const { getConnection } = require('../config/mysql');

// Helper to map DB row to API shape
const mapPlan = (row) => ({
  _id: row.id,
  name: row.name,
  provider: row.provider,
  type: row.type,
  sumInsured: row.sum_insured,
  premium: { monthly: row.premium_monthly, annual: row.premium_annual },
  ageRange: { min: row.age_min, max: row.age_max },
  networkHospitals: row.network_hospitals,
  cashlessHospitals: row.cashless_hospitals,
  claimSettlementRatio: parseFloat(row.claim_settlement_ratio),
  renewalAge: row.renewal_age,
  rating: parseFloat(row.rating),
  popular: !!row.popular,
  recommended: !!row.recommended,
  status: row.status,
  features: row.features || [],
  coverage: row.coverage || {},
  waitingPeriods: row.waiting_periods || {},
  coPayment: row.copayment || {},
  subLimits: row.sub_limits || [],
  addOns: row.add_ons || [],
  benefits: row.benefits || [],
  exclusions: row.exclusions || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getHealthInsurancePlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, minSumInsured, maxSumInsured, minPremium, maxPremium, provider, popular, recommended, sortBy = 'premium_annual', sortOrder = 'asc' } = req.query;

    const conditions = ["status = 'active'"];
    const params = [];

    if (type) { conditions.push('type = ?'); params.push(type); }
    if (provider) { conditions.push('provider LIKE ?'); params.push(`%${provider}%`); }
    if (popular === 'true') { conditions.push('popular = 1'); }
    if (recommended === 'true') { conditions.push('recommended = 1'); }
    if (minSumInsured) { conditions.push('sum_insured >= ?'); params.push(parseInt(minSumInsured)); }
    if (maxSumInsured) { conditions.push('sum_insured <= ?'); params.push(parseInt(maxSumInsured)); }
    if (minPremium) { conditions.push('premium_annual >= ?'); params.push(parseInt(minPremium)); }
    if (maxPremium) { conditions.push('premium_annual <= ?'); params.push(parseInt(maxPremium)); }

    const allowedSort = ['premium_annual', 'premium_monthly', 'sum_insured', 'rating', 'claim_settlement_ratio'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'premium_annual';
    const safeOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';
    const where = conditions.join(' AND ');
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conn = getConnection();
    const [rows] = await conn.query(`SELECT * FROM health_insurance_plans WHERE ${where} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`, [...params, parseInt(limit), offset]);
    const [[{ total }]] = await conn.query(`SELECT COUNT(*) as total FROM health_insurance_plans WHERE ${where}`, params);

    res.status(200).json({
      success: true,
      data: {
        plans: rows.map(mapPlan),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalPlans: total,
          hasNext: offset + rows.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching health insurance plans', error: error.message });
  }
};

const getFeaturedPlans = async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const conn = getConnection();
    const [rows] = await conn.query(
      `SELECT * FROM health_insurance_plans WHERE status = 'active' AND (popular = 1 OR recommended = 1) ORDER BY rating DESC, premium_annual ASC LIMIT ?`,
      [parseInt(limit)]
    );
    res.status(200).json({ success: true, data: rows.map(mapPlan) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching featured plans', error: error.message });
  }
};

const getHealthInsurancePlanById = async (req, res) => {
  try {
    const conn = getConnection();
    const [rows] = await conn.query('SELECT * FROM health_insurance_plans WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Health insurance plan not found' });
    res.status(200).json({ success: true, data: mapPlan(rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching health insurance plan', error: error.message });
  }
};

const comparePlans = async (req, res) => {
  try {
    const { planIds } = req.body;
    if (!planIds || !Array.isArray(planIds) || planIds.length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide at least 2 plan IDs for comparison' });
    }
    if (planIds.length > 4) {
      return res.status(400).json({ success: false, message: 'Maximum 4 plans can be compared at once' });
    }
    const conn = getConnection();
    const placeholders = planIds.map(() => '?').join(',');
    const [rows] = await conn.query(`SELECT * FROM health_insurance_plans WHERE id IN (${placeholders}) AND status = 'active'`, planIds);
    if (rows.length !== planIds.length) {
      return res.status(404).json({ success: false, message: 'One or more plans not found' });
    }
    res.status(200).json({ success: true, data: rows.map(mapPlan) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error comparing plans', error: error.message });
  }
};

const getPlanStatistics = async (req, res) => {
  try {
    const conn = getConnection();
    const [[overall]] = await conn.query(`SELECT COUNT(*) as totalPlans, AVG(premium_annual) as avgPremium, MIN(premium_annual) as minPremium, MAX(premium_annual) as maxPremium, AVG(sum_insured) as avgSumInsured, AVG(rating) as avgRating, SUM(popular) as popularPlans, SUM(recommended) as recommendedPlans FROM health_insurance_plans WHERE status = 'active'`);
    const [byType] = await conn.query(`SELECT type as _id, COUNT(*) as count, AVG(premium_annual) as avgPremium FROM health_insurance_plans WHERE status = 'active' GROUP BY type`);
    const [byProvider] = await conn.query(`SELECT provider as _id, COUNT(*) as count, AVG(rating) as avgRating FROM health_insurance_plans WHERE status = 'active' GROUP BY provider ORDER BY count DESC LIMIT 10`);
    res.status(200).json({ success: true, data: { overall, byType, byProvider } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching plan statistics', error: error.message });
  }
};

module.exports = { getHealthInsurancePlans, getFeaturedPlans, getHealthInsurancePlanById, comparePlans, getPlanStatistics };
