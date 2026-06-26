'use strict';
/**
 * admin.service.js — all admin business logic.
 * No req/res. No direct DB. Delegates to admin.repository.js.
 */
const { randomUUID } = require('crypto');
const repo   = require('../repositories/admin.repository');
const logger = require('../../../utils/logger');

const parseJSON = (v, fb = null) => {
  if (v === null || v === undefined) return fb;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return fb; }
};

const mapPlanRow = (r) => ({
  id: r.id, name: r.name, provider: r.provider, type: r.type,
  sumInsured: r.sum_insured,
  premium: { monthly: r.premium_monthly, annual: r.premium_annual },
  ageRange: { min: r.age_min, max: r.age_max },
  networkHospitals: r.network_hospitals, cashlessHospitals: r.cashless_hospitals,
  claimSettlementRatio: r.claim_settlement_ratio, renewalAge: r.renewal_age,
  rating: r.rating, popular: !!r.popular, recommended: !!r.recommended,
  status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
  features: parseJSON(r.features, []), coverage: parseJSON(r.coverage, {}),
  addOns: parseJSON(r.add_ons, []),
});

class AdminService {

  /* ── Stats ──────────────────────────────────────────────── */
  async getDashboardStats() {
    const { totals, recent } = await repo.getDashboardStats();
    return {
      total:          Number(totals.total),
      pendingReview:  Number(totals.under_review) + Number(totals.submitted),
      submitted:      Number(totals.submitted),
      underReview:    Number(totals.under_review),
      docsRequired:   Number(totals.documents_required),
      docsExpired:    Number(totals.documents_expired),
      medicalCheckup: Number(totals.medical_checkup),
      approved:       Number(totals.approved),
      rejected:       Number(totals.rejected),
      policyIssued:   Number(totals.policy_issued),
      cancelled:      Number(totals.cancelled),
      recentWeek:     Number(recent),
    };
  }

  /* ── Proposals queue ────────────────────────────────────── */
  async getProposals({ page=1, limit=15, status, search, dateFrom, dateTo, sortBy='submitted_at', sortOrder='desc' }) {
    const conditions = [], params = [];
    if (status)   { conditions.push('p.status = ?');   params.push(status); }
    if (dateFrom) { conditions.push('p.submitted_at >= ?'); params.push(dateFrom); }
    if (dateTo)   { conditions.push('p.submitted_at <= ?'); params.push(dateTo); }
    if (search) {
      conditions.push('(p.proposal_number LIKE ? OR JSON_EXTRACT(p.personal_info,"$.email") LIKE ? OR JSON_EXTRACT(p.personal_info,"$.firstName") LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const where     = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeSort  = ['submitted_at','updated_at','status'].includes(sortBy) ? sortBy : 'submitted_at';
    const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const pageInt   = parseInt(page), limitInt = parseInt(limit);
    const offset    = (pageInt - 1) * limitInt;

    const { rows, total } = await repo.findProposals({ where, params, safeSort, safeOrder, limit: limitInt, offset });

    const proposals = rows.map(r => {
      const pi   = parseJSON(r.personal_info, {});
      const pd   = parseJSON(r.premium_details, {});
      const docs = parseJSON(r.required_documents, []);
      return {
        id: r.id, proposalNumber: r.proposal_number, status: r.status,
        submittedAt: r.submitted_at, updatedAt: r.updated_at,
        applicant: { name: `${pi.firstName||''} ${pi.lastName||''}`.trim(), email: pi.email||'', phone: pi.phone||'' },
        plan: { name: r.plan_name, provider: r.plan_provider, type: r.plan_type, sumInsured: r.sum_insured },
        totalPremium:      pd.totalAnnualPremium || 0,
        docsUploaded:      docs.filter(d => d.uploaded).length,
        docsTotal:         docs.length,
        docsMandatory:     docs.filter(d => d.required).length,
        docsMandatoryDone: docs.filter(d => d.required && d.uploaded).length,
        docsVerified:      docs.filter(d => d.verificationStatus === 'verified').length,
      };
    });

    return { proposals, pagination: { currentPage: pageInt, totalPages: Math.ceil(total / limitInt), totalProposals: Number(total), hasNext: offset + rows.length < Number(total), hasPrev: pageInt > 1 } };
  }

  /* ── Single proposal detail ─────────────────────────────── */
  async getProposalDetail(id) {
    const r = await repo.findProposalDetail(id);
    if (!r) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
    const rawDocs = parseJSON(r.required_documents, []);
    const documents = rawDocs.map(d => ({ ...d, verificationStatus: d.verificationStatus || (d.uploaded ? 'pending' : 'not_uploaded') }));
    return {
      id: r.id, proposalNumber: r.proposal_number, status: r.status,
      submittedAt: r.submitted_at, updatedAt: r.updated_at,
      personalInfo:     parseJSON(r.personal_info, {}),
      familyMembers:    parseJSON(r.family_members, []),
      medicalInfo:      parseJSON(r.medical_info, {}),
      selectedAddOns:   parseJSON(r.selected_add_ons, []),
      premiumDetails:   parseJSON(r.premium_details, {}),
      documents,
      statusHistory:    parseJSON(r.status_history, []),
      policyDetails:    parseJSON(r.policy_details, null),
      rejectionDetails: parseJSON(r.rejection_details, null),
      assignedAgent:    parseJSON(r.assigned_agent, null),
      communications:   parseJSON(r.communications, []),
      plan: { name: r.plan_name, provider: r.plan_provider, type: r.plan_type, sumInsured: r.sum_insured, premiumAnnual: r.premium_annual, networkHospitals: r.network_hospitals, claimSettlementRatio: r.claim_settlement_ratio },
    };
  }

  /* ── Approve ────────────────────────────────────────────── */
  async approveProposal(id, { comment='Proposal approved by underwriting team.', adminId }) {
    const p = await repo.findProposalMin(id);
    if (!p) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
    if (!['under_review','medical_checkup_required'].includes(p.status))
      throw Object.assign(new Error(`Cannot approve a proposal with status '${p.status}'.`), { statusCode: 400 });

    const policyNumber = `POL-${new Date().getFullYear()}-${randomUUID().slice(0,8).toUpperCase()}`;
    const policyStart  = new Date();
    const policyEnd    = new Date(policyStart); policyEnd.setFullYear(policyEnd.getFullYear() + 1);
    const history      = [...parseJSON(p.status_history, []), { status:'approved', comment, updatedBy: adminId, timestamp: new Date() }];

    await repo.updateProposal(id, {
      status: 'approved',
      status_history: JSON.stringify(history),
      policy_details: JSON.stringify({ policyNumber, policyStartDate: policyStart, policyEndDate: policyEnd, issuedAt: new Date(), issuedBy: adminId }),
    });
    logger.info(`Proposal ${p.proposal_number} approved → policy ${policyNumber}`);
    return { proposalNumber: p.proposal_number, policyNumber, status: 'approved' };
  }

  /* ── Reject ─────────────────────────────────────────────── */
  async rejectProposal(id, { reason, detailedReason, comment, adminId }) {
    if (!reason) throw Object.assign(new Error('Rejection reason is required.'), { statusCode: 400 });
    const p = await repo.findProposalMin(id);
    if (!p) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
    if (['approved','rejected','policy_issued','cancelled'].includes(p.status))
      throw Object.assign(new Error(`Cannot reject proposal with status '${p.status}'.`), { statusCode: 400 });

    const history = [...parseJSON(p.status_history, []), { status:'rejected', comment: comment||reason, updatedBy: adminId, timestamp: new Date() }];
    await repo.updateProposal(id, {
      status: 'rejected',
      status_history: JSON.stringify(history),
      rejection_details: JSON.stringify({ reason, detailedReason: detailedReason||null, rejectedAt: new Date(), rejectedBy: adminId }),
    });
    logger.info(`Proposal ${p.proposal_number} rejected by admin ${adminId}`);
    return { proposalNumber: p.proposal_number, status: 'rejected' };
  }

  /* ── Request documents ──────────────────────────────────── */
  async requestDocuments(id, { docTypes=[], comment='Additional documents required.', adminId }) {
    const p = await repo.findProposalMin(id);
    if (!p) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
    const history = [...parseJSON(p.status_history, []), { status:'documents_required', comment, updatedBy: adminId, timestamp: new Date() }];
    const docs    = parseJSON(p.required_documents, []);
    if (docTypes.length) {
      docTypes.forEach(type => {
        const idx = docs.findIndex(d => d.type === type);
        if (idx !== -1) docs[idx] = { type: docs[idx].type, name: docs[idx].name, required: docs[idx].required, uploaded: false, verificationStatus: 'not_uploaded' };
      });
    }
    await repo.updateProposal(id, { status: 'documents_required', status_history: JSON.stringify(history), required_documents: JSON.stringify(docs) });
    return { status: 'documents_required' };
  }

  /* ── Require medical checkup ────────────────────────────── */
  async requireMedicalCheckup(id, { comment='Medical checkup required before approval.', adminId }) {
    const p = await repo.findProposalMin(id);
    if (!p) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
    const history = [...parseJSON(p.status_history, []), { status:'medical_checkup_required', comment, updatedBy: adminId, timestamp: new Date() }];
    await repo.updateProposal(id, { status: 'medical_checkup_required', status_history: JSON.stringify(history) });
    return { status: 'medical_checkup_required' };
  }

  /* ── Move to under review ───────────────────────────────── */
  async moveToUnderReview(id, { comment='Proposal picked up for underwriting review.', adminId }) {
    const p = await repo.findProposalMin(id);
    if (!p) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
    if (p.status !== 'submitted')
      throw Object.assign(new Error(`Cannot move to under_review — current status is '${p.status}'.`), { statusCode: 400 });
    const history = [...parseJSON(p.status_history, []), { status:'under_review', comment, updatedBy: adminId, timestamp: new Date() }];
    await repo.updateProposal(id, { status: 'under_review', status_history: JSON.stringify(history) });
    logger.info(`Proposal ${p.proposal_number} moved to under_review by admin ${adminId}`);
    return { status: 'under_review' };
  }

  /* ── Assign agent ───────────────────────────────────────── */
  async assignAgent(id, { agentId, agentName, agentEmail, agentPhone }) {
    if (!agentId) throw Object.assign(new Error('agentId is required.'), { statusCode: 400 });
    await repo.updateProposal(id, { assigned_agent: JSON.stringify({ agentId, agentName, agentEmail, agentPhone, assignedAt: new Date() }) });
  }

  /* ── Verify document ────────────────────────────────────── */
  async verifyDocument(proposalId, docType, adminId) {
    const p = await repo.findProposalMin(proposalId);
    if (!p) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
    const docs = parseJSON(p.required_documents, []);
    const idx  = docs.findIndex(d => d.type === docType);
    if (idx === -1) throw Object.assign(new Error('Document type not found'), { statusCode: 404 });
    if (!docs[idx].uploaded) throw Object.assign(new Error('Document not yet uploaded'), { statusCode: 400 });

    docs[idx] = { ...docs[idx], verificationStatus: 'verified', verifiedBy: String(adminId), verifiedAt: new Date(), rejectionReason: null };
    await repo.updateProposal(proposalId, { required_documents: JSON.stringify(docs) });

    const meta = await repo.findProposalMeta(proposalId);
    if (meta) repo.writeAuditLog({ proposalId, proposalNumber: meta.proposal_number, userId: String(meta.user_id), docType, docName: docs[idx].name, event: 'verified', actorId: String(adminId), actorRole: 'admin' });
    logger.info(`Document '${docType}' verified on proposal ${proposalId} by admin ${adminId}`);
  }

  /* ── Reject document ────────────────────────────────────── */
  async rejectDocument(proposalId, docType, { reason, adminId }) {
    if (!reason) throw Object.assign(new Error('Rejection reason required.'), { statusCode: 400 });
    const p = await repo.findProposalMin(proposalId);
    if (!p) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
    const docs = parseJSON(p.required_documents, []);
    const idx  = docs.findIndex(d => d.type === docType);
    if (idx === -1) throw Object.assign(new Error('Document type not found'), { statusCode: 404 });

    docs[idx] = { ...docs[idx], verificationStatus: 'rejected', rejectionReason: reason, verifiedBy: null, verifiedAt: null };
    await repo.updateProposal(proposalId, { required_documents: JSON.stringify(docs) });

    const meta = await repo.findProposalMeta(proposalId);
    if (meta) repo.writeAuditLog({ proposalId, proposalNumber: meta.proposal_number, userId: String(meta.user_id), docType, docName: docs[idx].name, event: 'rejected', actorId: String(adminId), actorRole: 'admin', rejectionReason: reason });
    logger.info(`Document '${docType}' rejected on proposal ${proposalId}. Reason: ${reason}`);
  }

  /* ── Audit log ──────────────────────────────────────────── */
  async getAuditLog(proposalId) {
    if (global.mongoAvailable === false) return { data: [], offline: true };
    const events = await repo.getAuditLog(proposalId);
    return { data: events, offline: false };
  }

  /* ── Users ──────────────────────────────────────────────── */
  async getUsers({ page=1, limit=20, search, role }) {
    const conditions = [], params = [];
    if (role)   { conditions.push('role = ?'); params.push(role); }
    if (search) { conditions.push('(email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    const where    = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const pageInt  = parseInt(page), limitInt = parseInt(limit);
    const offset   = (pageInt - 1) * limitInt;

    const { rows, total } = await repo.findUsers({ where, params, limit: limitInt, offset });
    const counts = await repo.getUserProposalCounts(rows.map(r => r.id));

    const users = rows.map(r => ({
      id: r.id, email: r.email, firstName: r.first_name, lastName: r.last_name,
      phone: r.phone, role: r.role, isVerified: !!r.is_verified, createdAt: r.created_at,
      proposalCount: counts[String(r.id)] || 0,
    }));
    return { users, pagination: { currentPage: pageInt, totalPages: Math.ceil(total / limitInt), totalUsers: Number(total), hasNext: offset + rows.length < Number(total), hasPrev: pageInt > 1 } };
  }

  async updateUserRole(id, role) {
    if (!['customer','admin','agent'].includes(role))
      throw Object.assign(new Error('Invalid role.'), { statusCode: 400 });
    const affected = await repo.updateUserRole(id, role);
    if (!affected) throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  /* ── Plans ──────────────────────────────────────────────── */
  async getPlans(status) {
    const rows = await repo.findPlans(status);
    return rows.map(mapPlanRow);
  }

  async createPlan(data) {
    await repo.createPlan(data);
  }

  async updatePlan(id, data) {
    const affected = await repo.updatePlan(id, data);
    if (!affected) throw Object.assign(new Error('Plan not found.'), { statusCode: 404 });
  }

  async deletePlan(id) {
    const affected = await repo.discontinuePlan(id);
    if (!affected) throw Object.assign(new Error('Plan not found.'), { statusCode: 404 });
  }
}

module.exports = new AdminService();
