'use strict';
/**
 * healthInsurance.repository.js
 * All MySQL queries for the health_insurance_plans table.
 * No business logic — only data access.
 */
const { getConnection } = require('../../../config/mysql');

class HealthInsuranceRepository {
  /**
   * Fetch paginated, filtered plans.
   * @param {object} filters - validated query params
   * @returns {{ rows: object[], total: number }}
   */
  async findAll({ conditions, params, safeSort, safeOrder, limit, offset }) {
    const conn  = getConnection();
    const where = conditions.join(' AND ');
    const [rows] = await conn.query(
      `SELECT * FROM health_insurance_plans WHERE ${where} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await conn.query(
      `SELECT COUNT(*) AS total FROM health_insurance_plans WHERE ${where}`,
      params
    );
    return { rows, total };
  }

  /**
   * Fetch featured plans (popular OR recommended), sorted by rating.
   */
  async findFeatured(limit) {
    const conn = getConnection();
    const [rows] = await conn.query(
      `SELECT * FROM health_insurance_plans
       WHERE status = 'active' AND (popular = 1 OR recommended = 1)
       ORDER BY rating DESC, premium_annual ASC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  /**
   * Fetch a single plan by primary key.
   */
  async findById(id) {
    const conn = getConnection();
    const [rows] = await conn.query(
      'SELECT * FROM health_insurance_plans WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Fetch multiple plans by an array of IDs (for compare).
   */
  async findByIds(ids) {
    const conn = getConnection();
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await conn.query(
      `SELECT * FROM health_insurance_plans WHERE id IN (${placeholders}) AND status = 'active'`,
      ids
    );
    return rows;
  }

  /**
   * Aggregate statistics across all active plans.
   */
  async getStatistics() {
    const conn = getConnection();
    const [[overall]] = await conn.query(
      `SELECT
         COUNT(*)                      AS totalPlans,
         AVG(premium_annual)           AS avgPremium,
         MIN(premium_annual)           AS minPremium,
         MAX(premium_annual)           AS maxPremium,
         AVG(sum_insured)              AS avgSumInsured,
         AVG(rating)                   AS avgRating,
         SUM(popular)                  AS popularPlans,
         SUM(recommended)              AS recommendedPlans
       FROM health_insurance_plans WHERE status = 'active'`
    );
    const [byType] = await conn.query(
      `SELECT type AS _id, COUNT(*) AS count, AVG(premium_annual) AS avgPremium
       FROM health_insurance_plans WHERE status = 'active' GROUP BY type`
    );
    const [byProvider] = await conn.query(
      `SELECT provider AS _id, COUNT(*) AS count, AVG(rating) AS avgRating
       FROM health_insurance_plans WHERE status = 'active'
       GROUP BY provider ORDER BY count DESC LIMIT 10`
    );
    return { overall, byType, byProvider };
  }
}

module.exports = new HealthInsuranceRepository();
