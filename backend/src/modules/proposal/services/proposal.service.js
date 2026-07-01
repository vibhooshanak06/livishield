'use strict';
/**
 * proposal.service.js — business logic, no req/res, no direct DB.
 */
const { randomUUID } = require('crypto');
const path             = require('path');
const fs               = require('fs');
const repo             = require('../repositories/proposal.repository');
const DocumentAuditLog = require('../../../models/DocumentAuditLog');
const logger           = require('../../../utils/logger');
const mailer           = require('../../../utils/mailer');

const DOC_WINDOW_MS        = 48 * 60 * 60 * 1000;
const REACTIVATION_DAYS    = 7;

const parseJSON = (v, fb = null) => {
  if (v === null || v === undefined) return fb;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return fb; }
};

const auditLog = (entry) => {
  if (global.mongoAvailable === false) return;
  DocumentAuditLog.create(entry).catch(e =>
    logger.warn(`Audit log write failed (${entry.event}): ${e.message}`)
  );
};

const mapProposalRow = (r) => ({
  _id:               r.id,
  proposalNumber:    r.proposal_number,
  status:            r.status,
  payment_status:    r.payment_status || 'not_required',
  submittedAt:       r.submitted_at,
  updatedAt:         r.updated_at,
  planId: {
    name:       r.plan_name,
    provider:   r.plan_provider,
    type:       r.plan_type,
    sumInsured: r.plan_sum_insured,
  },
  premiumDetails:    parseJSON(r.premium_details, {}),
  requiredDocuments: parseJSON(r.required_documents, []),
  policyDetails:     parseJSON(r.policy_details, null),
  rejectionDetails:  parseJSON(r.rejection_details, null),
  statusHistory:     parseJSON(r.status_history, []),
});

const generateProposalNumber = () =>
  `PROP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const generateRequiredDocuments = (medicalInfo, plan) => {
  const docs = [
    { type: 'identity_proof',  name: 'Identity Proof (Aadhar/PAN/Passport)', required: true },
    { type: 'address_proof',   name: 'Address Proof',                          required: true },
    { type: 'age_proof',       name: 'Age Proof (Birth Certificate/10th Certificate)', required: true },
    { type: 'passport_photo',  name: 'Passport Size Photograph',              required: true },
  ];
  if (plan?.sum_insured > 500000)
    docs.push({ type: 'income_proof', name: 'Income Proof (Salary Slip/ITR)', required: true });
  if (medicalInfo?.preExistingConditions?.length > 0)
    docs.push({ type: 'medical_reports', name: 'Medical Reports for Pre-existing Conditions', required: true });
  if (medicalInfo?.previousInsurance)
    docs.push({ type: 'previous_policy', name: 'Previous Health Insurance Policy Copy', required: true });
  return docs;
};

class ProposalService {
  /* ── submit ──────────────────────────────────────────────── */
  async submitProposal({ planId, personalInfo, familyMembers, medicalInfo, selectedAddOns, premiumDetails, userId }) {
    const plan = await repo.findPlanById(planId);
    if (!plan) throw Object.assign(new Error('Health insurance plan not found'), { statusCode: 404 });

    const id               = randomUUID();
    const proposalNumber   = generateProposalNumber();
    const requiredDocuments= generateRequiredDocuments(medicalInfo, plan);
    const statusHistory    = [{ status: 'submitted', comment: 'Proposal submitted by customer', updatedBy: userId, timestamp: new Date() }];

    await repo.create({ id, proposalNumber, planId, userId, personalInfo,
      familyMembers: familyMembers || [], medicalInfo,
      selectedAddOns: selectedAddOns || [], premiumDetails,
      requiredDocuments, statusHistory });

    // Fire-and-forget: send proposal submitted email
    mailer.sendProposalSubmittedEmail({
      to:                personalInfo.email,
      firstName:         personalInfo.firstName,
      planName:          plan.name,
      proposalNumber,
      requiredDocuments,
    });

    return { proposalNumber, proposalId: id, status: 'submitted', requiredDocuments, submittedAt: new Date().toISOString() };
  }

  /* ── list (user) ─────────────────────────────────────────── */
  async getUserProposals(userId, { page = 1, limit = 10, status } = {}) {
    const conditions = ['p.user_id = ?'];
    const params     = [userId];
    if (status) { conditions.push('p.status = ?'); params.push(status); }
    const pageInt  = parseInt(page);
    const limitInt = parseInt(limit);
    const offset   = (pageInt - 1) * limitInt;

    const { rows, total } = await repo.findByUserId(userId, { conditions, params, limit: limitInt, offset });
    return {
      proposals: rows.map(mapProposalRow),
      pagination: {
        currentPage: pageInt, totalPages: Math.ceil(total / limitInt),
        totalProposals: total, hasNext: pageInt * limitInt < total, hasPrev: pageInt > 1,
      },
    };
  }

  /* ── dashboard ───────────────────────────────────────────── */
  async getCustomerDashboard(userId) {
    if (!userId) throw Object.assign(new Error('User ID is required'), { statusCode: 400 });
    const rows     = await repo.findDashboardByUserId(userId);
    const proposals = rows.map(mapProposalRow);
    const stats = {
      totalProposals:   proposals.length,
      activeProposals:  proposals.filter(p => !['approved','rejected','cancelled','policy_issued'].includes(p.status)).length,
      approvedPolicies: proposals.filter(p => ['approved','policy_issued'].includes(p.status)).length,
      pendingDocuments: proposals.filter(p => ['submitted','documents_required','documents_expired'].includes(p.status)).length,
    };
    return { proposals, stats };
  }

  /* ── get single ──────────────────────────────────────────── */
  async getProposalById(id, requestingUser) {
    const r = await repo.findById(id);
    if (!r) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
    if (requestingUser?.id && r.user_id !== String(requestingUser.id) && requestingUser.role !== 'admin')
      throw Object.assign(new Error('Access denied'), { statusCode: 403 });
    return {
      ...r,
      personal_info:      parseJSON(r.personal_info, {}),
      family_members:     parseJSON(r.family_members, []),
      medical_info:       parseJSON(r.medical_info, {}),
      selected_add_ons:   parseJSON(r.selected_add_ons, []),
      premium_details:    parseJSON(r.premium_details, {}),
      required_documents: parseJSON(r.required_documents, []),
      policy_details:     parseJSON(r.policy_details, null),
      rejection_details:  parseJSON(r.rejection_details, null),
      assigned_agent:     parseJSON(r.assigned_agent, null),
      status_history:     parseJSON(r.status_history, []),
      communications:     parseJSON(r.communications, []),
    };
  }

  /* ── update status (admin shortcut) ─────────────────────── */
  async updateStatus(id, { status, comment, assignedAgent, rejectionDetails, updatedBy }) {
    const p = await repo.findRawById(id);
    if (!p) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
    const statusHistory = [...parseJSON(p.status_history, []), { status, comment, updatedBy, timestamp: new Date() }];
    const extra = {};
    if (status === 'approved') {
      extra.policy_details = { policyStartDate: new Date(), policyEndDate: new Date(Date.now() + 365*24*60*60*1000) };
    }
    if (status === 'rejected' && rejectionDetails) {
      extra.rejection_details = { ...rejectionDetails, rejectedAt: new Date(), rejectedBy: updatedBy };
    }
    if (assignedAgent) {
      extra.assigned_agent = { ...assignedAgent, assignedAt: new Date() };
    }
    await repo.updateStatus(id, { status, statusHistory, extra });
    return { proposalNumber: p.proposal_number, status };
  }

  /* ── all proposals (admin) ───────────────────────────────── */
  async getAllProposals({ page = 1, limit = 20, status, dateFrom, dateTo, search }) {
    const conditions = [], params = [];
    if (status)   { conditions.push('p.status = ?');            params.push(status); }
    if (dateFrom) { conditions.push('p.submitted_at >= ?');      params.push(dateFrom); }
    if (dateTo)   { conditions.push('p.submitted_at <= ?');      params.push(dateTo); }
    if (search)   { conditions.push('p.proposal_number LIKE ?'); params.push(`%${search}%`); }
    const where    = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitInt = parseInt(limit);
    const offset   = (parseInt(page) - 1) * limitInt;
    const { rows, total } = await repo.findAllAdmin({ where, params, limit: limitInt, offset });
    return { proposals: rows, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limitInt), totalProposals: total } };
  }

  /* ── communication ───────────────────────────────────────── */
  async addCommunication(id, { type, subject, message, sentTo, sentBy }) {
    const row = await repo.findCommunicationsById(id);
    if (!row) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
    const communications = [...parseJSON(row.communications, []), { type, subject, message, sentBy, sentTo, timestamp: new Date() }];
    await repo.updateCommunications(id, communications);
  }

  /* ── document upload ─────────────────────────────────────── */
  async uploadDocument(proposalId, { docType, file, requestingUserId }) {
    const p = await repo.findMinById(proposalId);
    if (!p) { fs.unlink(file.path, () => {}); throw Object.assign(new Error('Proposal not found.'), { statusCode: 404 }); }

    if (requestingUserId && String(p.user_id) !== String(requestingUserId)) {
      fs.unlink(file.path, () => {}); throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
    }

    const locked = ['under_review','approved','rejected','policy_issued','cancelled','documents_expired'];
    if (locked.includes(p.status)) {
      fs.unlink(file.path, () => {}); throw Object.assign(new Error(`Documents cannot be changed when proposal is '${p.status}'.`), { statusCode: 400 });
    }

    const docs = parseJSON(p.required_documents, []);
    const idx  = docs.findIndex(d => d.type === docType);
    if (idx === -1) { fs.unlink(file.path, () => {}); throw Object.assign(new Error(`Unknown document type: ${docType}`), { statusCode: 400 }); }

    const ext         = path.extname(file.originalname).toLowerCase();
    const newFilename = `${docType}_${Date.now()}${ext}`;
    const newFilePath = path.join(path.dirname(file.path), newFilename);
    try { fs.renameSync(file.path, newFilePath); } catch (e) { logger.warn('File rename: ' + e.message); }

    const finalPath  = fs.existsSync(newFilePath) ? newFilePath : file.path;
    const finalName  = fs.existsSync(newFilePath) ? newFilename : file.filename;
    const prevState  = docs[idx].uploaded ? { fileName: docs[idx].fileName, filePath: docs[idx].filePath, verificationStatus: docs[idx].verificationStatus } : null;

    if (docs[idx].filePath && docs[idx].filePath !== finalPath)
      try { fs.unlinkSync(docs[idx].filePath); } catch {}

    docs[idx] = { ...docs[idx], uploaded: true, uploadedAt: new Date(), filePath: finalPath, fileName: file.originalname, storedName: finalName, fileSize: file.size, mimeType: file.mimetype, verificationStatus: 'pending', verifiedBy: null, verifiedAt: null, rejectionReason: null };

    await repo.updateRequiredDocuments(proposalId, docs);

    auditLog({ proposalId, proposalNumber: p.proposal_number, userId: String(p.user_id), docType, docName: docs[idx].name, event: prevState ? 're_uploaded' : 'uploaded', actorId: String(requestingUserId || p.user_id), actorRole: 'customer', fileDetails: { fileName: file.originalname, storedName: finalName, filePath: finalPath, fileSize: file.size, mimeType: file.mimetype }, ...(prevState && { previousState: prevState }) });
    logger.info(`Document '${docType}' uploaded for proposal ${proposalId}`);

    return { docType, fileName: file.originalname, fileSize: file.size, allMandatoryUploaded: docs.filter(d => d.required).every(d => d.uploaded), uploadedCount: docs.filter(d => d.uploaded).length, totalDocs: docs.length, proposalStatus: p.status };
  }

  /* ── document delete ─────────────────────────────────────── */
  async deleteDocument(proposalId, docType, requestingUserId) {
    const p = await repo.findMinById(proposalId);
    if (!p) throw Object.assign(new Error('Proposal not found.'), { statusCode: 404 });
    if (requestingUserId && String(p.user_id) !== String(requestingUserId))
      throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
    const locked = ['under_review','approved','rejected','policy_issued','cancelled'];
    if (locked.includes(p.status)) throw Object.assign(new Error('Cannot remove documents at this stage.'), { statusCode: 400 });
    const docs = parseJSON(p.required_documents, []);
    const idx  = docs.findIndex(d => d.type === docType);
    if (idx === -1) throw Object.assign(new Error('Document type not found.'), { statusCode: 404 });
    if (!docs[idx].uploaded) throw Object.assign(new Error('No file uploaded for this document type.'), { statusCode: 400 });

    const prevState = { fileName: docs[idx].fileName, filePath: docs[idx].filePath, verificationStatus: docs[idx].verificationStatus };
    if (docs[idx].filePath) try { fs.unlinkSync(docs[idx].filePath); } catch {}
    docs[idx] = { type: docs[idx].type, name: docs[idx].name, required: docs[idx].required, uploaded: false };

    await repo.updateRequiredDocuments(proposalId, docs);
    auditLog({ proposalId, proposalNumber: p.proposal_number, userId: String(p.user_id), docType, docName: docs[idx].name, event: 'deleted', actorId: String(requestingUserId || p.user_id), actorRole: 'customer', previousState: prevState });
  }

  /* ── submit documents → under_review ────────────────────── */
  async submitDocuments(proposalId, requestingUserId) {
    const p = await repo.findMinById(proposalId);
    if (!p) throw Object.assign(new Error('Proposal not found.'), { statusCode: 404 });
    if (requestingUserId && String(p.user_id) !== String(requestingUserId))
      throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
    if (!['submitted','documents_required'].includes(p.status))
      throw Object.assign(new Error(`Cannot submit documents for a proposal with status '${p.status}'.`), { statusCode: 400 });

    const docs    = parseJSON(p.required_documents, []);
    const missing = docs.filter(d => d.required && !d.uploaded);
    if (missing.length > 0) throw Object.assign(new Error(`Please upload all mandatory documents. Missing: ${missing.map(d => d.name).join(', ')}`), { statusCode: 400, data: { missingDocs: missing.map(d => ({ type: d.type, name: d.name })) } });

    const history = [...parseJSON(p.status_history, []), { status: 'under_review', comment: 'All mandatory documents submitted by customer. Proposal sent for review.', updatedBy: requestingUserId || 'customer', timestamp: new Date() }];
    await repo.updateStatus(proposalId, { status: 'under_review', statusHistory: history });

    const actorId = String(requestingUserId || p.user_id);
    for (const doc of docs.filter(d => d.uploaded)) {
      auditLog({ proposalId, proposalNumber: p.proposal_number, userId: String(p.user_id), docType: doc.type, docName: doc.name, event: 'submitted', actorId, actorRole: 'customer', fileDetails: { fileName: doc.fileName, storedName: doc.storedName, filePath: doc.filePath, fileSize: doc.fileSize, mimeType: doc.mimeType } });
    }
    logger.info(`Proposal ${p.proposal_number} — documents submitted for review`);
    return { proposalNumber: p.proposal_number, status: 'under_review' };
  }

  /* ── reactivate ──────────────────────────────────────────── */
  async reactivateProposal(proposalId, requestingUserId) {
    const p = await repo.findRawById(proposalId);
    if (!p) throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
    if (requestingUserId && String(p.user_id) !== String(requestingUserId))
      throw Object.assign(new Error('Access denied'), { statusCode: 403 });
    if (p.status !== 'documents_expired')
      throw Object.assign(new Error(`Cannot reactivate a proposal with status '${p.status}'`), { statusCode: 400 });

    const expiredEntry = parseJSON(p.status_history, []).slice().reverse().find(h => h.status === 'documents_expired');
    if (expiredEntry) {
      const windowEnd = new Date(new Date(expiredEntry.timestamp).getTime() + REACTIVATION_DAYS * 24 * 60 * 60 * 1000);
      if (new Date() > windowEnd)
        throw Object.assign(new Error('Reactivation window has closed. Please submit a new proposal.'), { statusCode: 400, code: 'REACTIVATION_WINDOW_CLOSED' });
    }

    const history = [...parseJSON(p.status_history, []), { status: 'submitted', comment: 'Proposal reactivated by customer. New 48-hour document upload window started.', updatedBy: requestingUserId || 'customer', timestamp: new Date() }];
    await repo.reactivate(proposalId, history);
    return { proposalNumber: p.proposal_number, status: 'submitted' };
  }

  /* ── expiry cron ─────────────────────────────────────────── */
  async expireStaleProposals() {
    const cutoff = new Date(Date.now() - DOC_WINDOW_MS);
    const rows   = await repo.findExpired(cutoff);
    let expired  = 0;
    for (const row of rows) {
      const docs = parseJSON(row.required_documents, []);
      if (docs.some(d => d.uploaded)) continue;
      const history = [...parseJSON(row.status_history, []), { status: 'documents_expired', comment: 'Proposal expired: required documents were not uploaded within 48 hours.', updatedBy: 'system', timestamp: new Date() }];
      await repo.updateStatus(row.id, { status: 'documents_expired', statusHistory: history });
      expired++;
      logger.info(`Proposal ${row.proposal_number} expired (no documents uploaded)`);
    }
    if (expired > 0) logger.info(`Expiry job: ${expired} proposal(s) marked as documents_expired`);
    return expired;
  }
}

module.exports = new ProposalService();
