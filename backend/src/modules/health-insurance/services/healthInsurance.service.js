'use strict';
/**
 * healthInsurance.service.js
 * Business logic layer — no req/res, no direct DB access.
 * All data access goes through the repository.
 */
const repo = require('../repositories/healthInsurance.repository');

// ── Pure helper ──────────────────────────────────────────────────────────────
const parseJSON = (val, fallback) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

const mapPlan = (row) => ({
  _id:                  row.id,
  name:                 row.name,
  provider:             row.provider,
  type:                 row.type,
  sumInsured:           row.sum_insured,
  premium:              { monthly: row.premium_monthly, annual: row.premium_annual },
  ageRange:             { min: row.age_min, max: row.age_max },
  networkHospitals:     row.network_hospitals,
  cashlessHospitals:    row.cashless_hospitals,
  claimSettlementRatio: parseFloat(row.claim_settlement_ratio),
  renewalAge:           row.renewal_age,
  rating:               parseFloat(row.rating),
  popular:              !!row.popular,
  recommended:          !!row.recommended,
  status:               row.status,
  features:             parseJSON(row.features,       []),
  coverage:             parseJSON(row.coverage,       {}),
  waitingPeriods:       parseJSON(row.waiting_periods, {}),
  coPayment:            parseJSON(row.copayment,       {}),
  subLimits:            parseJSON(row.sub_limits,      []),
  addOns:               parseJSON(row.add_ons,         []),
  benefits:             parseJSON(row.benefits,        []),
  exclusions:           parseJSON(row.exclusions,      []),
  createdAt:            row.created_at,
  updatedAt:            row.updated_at,
});

// ── Service methods ──────────────────────────────────────────────────────────
class HealthInsuranceService {

  async getPlans(query) {
    const {
      page = 1, limit = 10,
      type, minSumInsured, maxSumInsured,
      minPremium, maxPremium, provider,
      popular, recommended,
      sortBy = 'premium_annual', sortOrder = 'asc',
    } = query;

    const conditions = ["status = 'active'"];
    const params     = [];

    if (type)        { conditions.push('type = ?');          params.push(type); }
    if (provider)    { conditions.push('provider LIKE ?');   params.push(`%${provider}%`); }
    if (popular === 'true')     conditions.push('popular = 1');
    if (recommended === 'true') conditions.push('recommended = 1');
    if (minSumInsured) { conditions.push('sum_insured >= ?');    params.push(parseInt(minSumInsured)); }
    if (maxSumInsured) { conditions.push('sum_insured <= ?');    params.push(parseInt(maxSumInsured)); }
    if (minPremium)    { conditions.push('premium_annual >= ?'); params.push(parseInt(minPremium)); }
    if (maxPremium)    { conditions.push('premium_annual <= ?'); params.push(parseInt(maxPremium)); }

    const allowed   = ['premium_annual', 'premium_monthly', 'sum_insured', 'rating', 'claim_settlement_ratio'];
    const safeSort  = allowed.includes(sortBy) ? sortBy : 'premium_annual';
    const safeOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';
    const pageInt   = parseInt(page);
    const limitInt  = parseInt(limit);
    const offset    = (pageInt - 1) * limitInt;

    const { rows, total } = await repo.findAll({ conditions, params, safeSort, safeOrder, limit: limitInt, offset });

    return {
      plans: rows.map(mapPlan),
      pagination: {
        currentPage: pageInt,
        totalPages:  Math.ceil(total / limitInt),
        totalPlans:  total,
        hasNext:     offset + rows.length < total,
        hasPrev:     pageInt > 1,
      },
    };
  }

  async getFeaturedPlans(limit = 3) {
    const rows = await repo.findFeatured(parseInt(limit));
    return rows.map(mapPlan);
  }

  async getPlanById(id) {
    const row = await repo.findById(id);
    if (!row) return null;
    return mapPlan(row);
  }

  async comparePlans(planIds) {
    if (!Array.isArray(planIds) || planIds.length < 2) {
      throw Object.assign(new Error('Provide at least 2 plan IDs for comparison'), { statusCode: 400 });
    }
    if (planIds.length > 4) {
      throw Object.assign(new Error('Maximum 4 plans can be compared at once'), { statusCode: 400 });
    }
    const rows = await repo.findByIds(planIds);
    if (rows.length !== planIds.length) {
      throw Object.assign(new Error('One or more plans not found'), { statusCode: 404 });
    }
    return rows.map(mapPlan);
  }

  async getStatistics() {
    return repo.getStatistics();
  }
}

module.exports = new HealthInsuranceService();
