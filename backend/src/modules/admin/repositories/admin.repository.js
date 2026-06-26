'use strict';
/**
 * admin.repository.js — all MySQL / MongoDB queries used by admin features.
 */
const { getConnection }  = require('../../../config/mysql');
const DocumentAuditLog   = require('../../../models/DocumentAuditLog');

const parseJSON = (v, fb = null) => {
  if (v === null || v === undefined) return fb;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return fb; }
};

class AdminRepository {
  /* ── Proposal stats ── */
  async getDashboardStats() {
    const conn = getConnection();
    const [[totals]] = await conn.query(`
      SELECT COUNT(*) AS total,
        SUM(status='submitted') AS submitted, SUM(status='under_review') AS under_review,
        SUM(status='documents_required') AS documents_required,
        SUM(status='documents_expired') AS documents_expired,
        SUM(status='medical_checkup_required') AS medical_checkup,
        SUM(status='approved') AS approved, SUM(status='rejected') AS rejected,
        SUM(status='policy_issued') AS policy_issued, SUM(status='cancelled') AS cancelled
      FROM health_insurance_proposals`);
    const [[{ recent }]] = await conn.query(`
      SELECT COUNT(*) AS recent FROM health_insurance_proposals
      WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
    return { totals, recent };
  }

  /* ── Proposal queue ── */
  async findProposals({ where, params, safeSort, safeOrder, limit, offset }) {
    const conn = getConnection();
    const [rows] = await conn.query(
      `SELECT p.id, p.proposal_number, p.status, p.submitted_at, p.updated_at,
              p.personal_info, p.premium_details, p.required_documents,
              pl.name AS plan_name, pl.provider AS plan_provider,
              pl.type AS plan_type, pl.sum_insured
       FROM health_insurance_proposals p
       LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id
       ${where} ORDER BY p.${safeSort} ${safeOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await conn.query(
      `SELECT COUNT(*) AS total FROM health_insurance_proposals p ${where}`, params
    );
    return { rows, total };
  }

  /* ── Single proposal (full detail) ── */
  async findProposalDetail(id) {
    const conn = getConnection();
    const [rows] = await conn.query(
      `SELECT p.*, pl.name AS plan_name, pl.provider AS plan_provider,
              pl.type AS plan_type, pl.sum_insured,
              pl.premium_annual, pl.network_hospitals, pl.claim_settlement_ratio
       FROM health_insurance_proposals p
       LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  /* ── Find proposal (min fields) ── */
  async findProposalMin(id) {
    const conn = getConnection();
    const [rows] = await conn.query(
      'SELECT id, proposal_number, user_id, status, status_history, required_documents FROM health_insurance_proposals WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /* ── Update proposal ── */
  async updateProposal(id, fields) {
    const conn = getConnection();
    const set = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    await conn.query(
      `UPDATE health_insurance_proposals SET ${set}, updated_at = NOW() WHERE id = ?`,
      [...Object.values(fields), id]
    );
  }

  /* ── Get proposal meta for audit ── */
  async findProposalMeta(id) {
    const conn = getConnection();
    const [rows] = await conn.query(
      'SELECT proposal_number, user_id FROM health_insurance_proposals WHERE id = ?', [id]
    );
    return rows[0] || null;
  }

  /* ── Users ── */
  async findUsers({ where, params, limit, offset }) {
    const conn = getConnection();
    const [rows] = await conn.query(
      `SELECT id, email, first_name, last_name, phone, role, is_verified, created_at
       FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await conn.query(`SELECT COUNT(*) AS total FROM users ${where}`, params);
    return { rows, total };
  }

  async getUserProposalCounts(userIds) {
    if (!userIds.length) return {};
    const conn = getConnection();
    const ph   = userIds.map(() => '?').join(',');
    const [pc] = await conn.query(
      `SELECT user_id, COUNT(*) AS cnt FROM health_insurance_proposals WHERE user_id IN (${ph}) GROUP BY user_id`,
      userIds.map(String)
    );
    const map = {};
    pc.forEach(r => { map[r.user_id] = Number(r.cnt); });
    return map;
  }

  async updateUserRole(id, role) {
    const conn = getConnection();
    const [r] = await conn.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return r.affectedRows;
  }

  /* ── Plans ── */
  async findPlans(status) {
    const conn = getConnection();
    const [rows] = await conn.query(
      `SELECT * FROM health_insurance_plans ${status ? 'WHERE status = ?' : ''} ORDER BY created_at DESC`,
      status ? [status] : []
    );
    return rows;
  }

  async createPlan(d) {
    const conn = getConnection();
    await conn.query(
      `INSERT INTO health_insurance_plans
        (name,provider,type,sum_insured,premium_monthly,premium_annual,age_min,age_max,
         network_hospitals,cashless_hospitals,claim_settlement_ratio,renewal_age,rating,
         popular,recommended,status,features,coverage,waiting_periods,copayment,
         sub_limits,add_ons,benefits,exclusions)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.name,d.provider,d.type,d.sumInsured,d.premium?.monthly||0,d.premium?.annual||0,
       d.ageRange?.min||18,d.ageRange?.max||65,d.networkHospitals||0,d.cashlessHospitals||0,
       d.claimSettlementRatio||90,d.renewalAge||75,d.rating||4.0,d.popular?1:0,d.recommended?1:0,
       d.status||'active',JSON.stringify(d.features||[]),JSON.stringify(d.coverage||{}),
       JSON.stringify(d.waitingPeriods||{}),JSON.stringify(d.coPayment||{}),
       JSON.stringify(d.subLimits||[]),JSON.stringify(d.addOns||[]),
       JSON.stringify(d.benefits||[]),JSON.stringify(d.exclusions||[])]
    );
  }

  async updatePlan(id, d) {
    const conn = getConnection();
    const [r] = await conn.query(
      `UPDATE health_insurance_plans SET
        name=?,provider=?,type=?,sum_insured=?,premium_monthly=?,premium_annual=?,
        age_min=?,age_max=?,network_hospitals=?,cashless_hospitals=?,
        claim_settlement_ratio=?,renewal_age=?,rating=?,popular=?,recommended=?,
        status=?,features=?,coverage=?,waiting_periods=?,copayment=?,
        sub_limits=?,add_ons=?,benefits=?,exclusions=?,updated_at=NOW()
       WHERE id=?`,
      [d.name,d.provider,d.type,d.sumInsured,d.premium?.monthly||0,d.premium?.annual||0,
       d.ageRange?.min||18,d.ageRange?.max||65,d.networkHospitals||0,d.cashlessHospitals||0,
       d.claimSettlementRatio||90,d.renewalAge||75,d.rating||4.0,d.popular?1:0,d.recommended?1:0,
       d.status||'active',JSON.stringify(d.features||[]),JSON.stringify(d.coverage||{}),
       JSON.stringify(d.waitingPeriods||{}),JSON.stringify(d.coPayment||{}),
       JSON.stringify(d.subLimits||[]),JSON.stringify(d.addOns||[]),
       JSON.stringify(d.benefits||[]),JSON.stringify(d.exclusions||[]),id]
    );
    return r.affectedRows;
  }

  async discontinuePlan(id) {
    const conn = getConnection();
    const [r] = await conn.query(
      `UPDATE health_insurance_plans SET status='discontinued', updated_at=NOW() WHERE id=?`, [id]
    );
    return r.affectedRows;
  }

  /* ── MongoDB audit log ── */
  async getAuditLog(proposalId) {
    return DocumentAuditLog.find({ proposalId }).sort({ timestamp: -1 }).lean();
  }

  async writeAuditLog(entry) {
    if (global.mongoAvailable === false) return;
    DocumentAuditLog.create(entry).catch(() => {});
  }
}

module.exports = new AdminRepository();
