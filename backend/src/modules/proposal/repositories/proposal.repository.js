'use strict';
/**
 * proposal.repository.js — all MySQL queries for health_insurance_proposals.
 */
const { getConnection } = require('../../../config/mysql');

const PLAN_JOIN = `
  LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id`;

const PLAN_COLS = `
  pl.name AS plan_name, pl.provider AS plan_provider,
  pl.type AS plan_type, pl.sum_insured AS plan_sum_insured`;

class ProposalRepository {
  async findPlanById(planId) {
    const [rows] = await getConnection().query(
      'SELECT * FROM health_insurance_plans WHERE id = ?', [planId]
    );
    return rows[0] || null;
  }

  async create({ id, proposalNumber, planId, userId, personalInfo, familyMembers,
    medicalInfo, selectedAddOns, premiumDetails, requiredDocuments, statusHistory }) {
    await getConnection().query(
      `INSERT INTO health_insurance_proposals
         (id, proposal_number, plan_id, user_id,
          personal_info, family_members, medical_info, selected_add_ons,
          premium_details, required_documents, status_history)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [id, proposalNumber, planId, userId,
        JSON.stringify(personalInfo), JSON.stringify(familyMembers),
        JSON.stringify(medicalInfo), JSON.stringify(selectedAddOns),
        JSON.stringify(premiumDetails), JSON.stringify(requiredDocuments),
        JSON.stringify(statusHistory)]
    );
  }

  async findByUserId(userId, { conditions, params, limit, offset }) {
    const where = conditions.join(' AND ');
    const [rows] = await getConnection().query(
      `SELECT p.*, ${PLAN_COLS} FROM health_insurance_proposals p ${PLAN_JOIN}
       WHERE ${where} ORDER BY p.submitted_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await getConnection().query(
      `SELECT COUNT(*) AS total FROM health_insurance_proposals WHERE ${conditions.join(' AND ')}`,
      params
    );
    return { rows, total };
  }

  async findDashboardByUserId(userId) {
    const [rows] = await getConnection().query(
      `SELECT p.*, ${PLAN_COLS} FROM health_insurance_proposals p ${PLAN_JOIN}
       WHERE p.user_id = ? ORDER BY p.submitted_at DESC`,
      [userId]
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await getConnection().query(
      `SELECT p.*, pl.name AS plan_name, pl.provider AS plan_provider
       FROM health_insurance_proposals p ${PLAN_JOIN} WHERE p.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async findRawById(id) {
    const [rows] = await getConnection().query(
      'SELECT * FROM health_insurance_proposals WHERE id = ?', [id]
    );
    return rows[0] || null;
  }

  async findMinById(id) {
    const [rows] = await getConnection().query(
      'SELECT id, proposal_number, user_id, status, required_documents, status_history, submitted_at FROM health_insurance_proposals WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async findCommunicationsById(id) {
    const [rows] = await getConnection().query(
      'SELECT communications FROM health_insurance_proposals WHERE id = ?', [id]
    );
    return rows[0] || null;
  }

  async updateStatus(id, { status, statusHistory, extra = {} }) {
    const set = [`status = ?`, `status_history = ?`, `updated_at = NOW()`];
    const vals = [status, JSON.stringify(statusHistory)];
    for (const [col, val] of Object.entries(extra)) {
      set.push(`${col} = ?`);
      vals.push(typeof val === 'object' ? JSON.stringify(val) : val);
    }
    await getConnection().query(
      `UPDATE health_insurance_proposals SET ${set.join(', ')} WHERE id = ?`,
      [...vals, id]
    );
  }

  async updateRequiredDocuments(id, docs) {
    await getConnection().query(
      'UPDATE health_insurance_proposals SET required_documents = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(docs), id]
    );
  }

  async updateCommunications(id, communications) {
    await getConnection().query(
      'UPDATE health_insurance_proposals SET communications = ? WHERE id = ?',
      [JSON.stringify(communications), id]
    );
  }

  async updateMany(id, fields) {
    const set = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    await getConnection().query(
      `UPDATE health_insurance_proposals SET ${set} WHERE id = ?`,
      [...Object.values(fields), id]
    );
  }

  async findAllAdmin({ where, params, limit, offset }) {
    const [rows] = await getConnection().query(
      `SELECT p.*, pl.name AS plan_name, pl.provider AS plan_provider, pl.type AS plan_type
       FROM health_insurance_proposals p ${PLAN_JOIN}
       ${where} ORDER BY p.submitted_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await getConnection().query(
      `SELECT COUNT(*) AS total FROM health_insurance_proposals p ${where}`, params
    );
    return { rows, total };
  }

  async findExpired(cutoff) {
    const [rows] = await getConnection().query(
      `SELECT id, proposal_number, user_id, status_history, required_documents
       FROM health_insurance_proposals
       WHERE status = 'submitted' AND submitted_at < ?`,
      [cutoff]
    );
    return rows;
  }

  async reactivate(id, statusHistory) {
    await getConnection().query(
      `UPDATE health_insurance_proposals
       SET status = 'submitted', status_history = ?, submitted_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(statusHistory), id]
    );
  }
}

module.exports = new ProposalRepository();
