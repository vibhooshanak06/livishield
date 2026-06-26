'use strict';
/**
 * admin.controller.js — HTTP layer only. Zero SQL / business logic.
 */
const service = require('../services/admin.service');

const ok  = (res, data, msg, status=200) => res.status(status).json({ success: true, ...(msg && { message: msg }), data });
const err = (res, e) => res.status(e.statusCode || 500).json({ success: false, message: e.message });

/* ── Stats ── */
const getDashboardStats = async (req, res) => {
  try { ok(res, await service.getDashboardStats()); } catch (e) { err(res, e); }
};

/* ── Proposals ── */
const getProposals = async (req, res) => {
  try { ok(res, await service.getProposals(req.query)); } catch (e) { err(res, e); }
};

const getProposalDetail = async (req, res) => {
  try { ok(res, await service.getProposalDetail(req.params.id)); } catch (e) { err(res, e); }
};

const approveProposal = async (req, res) => {
  try {
    const data = await service.approveProposal(req.params.id, { ...req.body, adminId: req.user.id });
    ok(res, data, 'Proposal approved and policy generated.');
  } catch (e) { err(res, e); }
};

const rejectProposal = async (req, res) => {
  try {
    const data = await service.rejectProposal(req.params.id, { ...req.body, adminId: req.user.id });
    ok(res, data, 'Proposal rejected.');
  } catch (e) { err(res, e); }
};

const requestDocuments = async (req, res) => {
  try {
    const data = await service.requestDocuments(req.params.id, { ...req.body, adminId: req.user.id });
    ok(res, data, 'Documents requested from customer.');
  } catch (e) { err(res, e); }
};

const requireMedicalCheckup = async (req, res) => {
  try {
    const data = await service.requireMedicalCheckup(req.params.id, { ...req.body, adminId: req.user.id });
    ok(res, data, 'Medical checkup status set.');
  } catch (e) { err(res, e); }
};

const moveToUnderReview = async (req, res) => {
  try {
    const data = await service.moveToUnderReview(req.params.id, { ...req.body, adminId: req.user.id });
    ok(res, data, 'Proposal moved to Under Review.');
  } catch (e) { err(res, e); }
};

const assignAgent = async (req, res) => {
  try {
    await service.assignAgent(req.params.id, req.body);
    ok(res, null, 'Agent assigned.');
  } catch (e) { err(res, e); }
};

/* ── Documents ── */
const verifyDocument = async (req, res) => {
  try {
    await service.verifyDocument(req.params.id, req.params.docType, req.user.id);
    ok(res, null, `Document '${req.params.docType}' verified.`);
  } catch (e) { err(res, e); }
};

const rejectDocument = async (req, res) => {
  try {
    await service.rejectDocument(req.params.id, req.params.docType, { reason: req.body.reason, adminId: req.user.id });
    ok(res, null, `Document '${req.params.docType}' rejected.`);
  } catch (e) { err(res, e); }
};

/* ── Audit log ── */
const getAuditLog = async (req, res) => {
  try {
    const { data, offline } = await service.getAuditLog(req.params.id);
    res.json({ success: true, data, ...(offline && { message: 'Audit logging is offline (MongoDB unavailable).' }) });
  } catch (e) { err(res, e); }
};

/* ── Users ── */
const getUsers = async (req, res) => {
  try { ok(res, await service.getUsers(req.query)); } catch (e) { err(res, e); }
};

const updateUserRole = async (req, res) => {
  try {
    await service.updateUserRole(req.params.id, req.body.role);
    ok(res, null, `User role updated to '${req.body.role}'.`);
  } catch (e) { err(res, e); }
};

/* ── Plans ── */
const getPlans = async (req, res) => {
  try { ok(res, await service.getPlans(req.query.status)); } catch (e) { err(res, e); }
};

const createPlan = async (req, res) => {
  try { await service.createPlan(req.body); ok(res, null, 'Plan created.', 201); } catch (e) { err(res, e); }
};

const updatePlan = async (req, res) => {
  try { await service.updatePlan(req.params.id, req.body); ok(res, null, 'Plan updated.'); } catch (e) { err(res, e); }
};

const deletePlan = async (req, res) => {
  try { await service.deletePlan(req.params.id); ok(res, null, 'Plan discontinued.'); } catch (e) { err(res, e); }
};

module.exports = {
  getDashboardStats,
  getProposals, getProposalDetail,
  approveProposal, rejectProposal, requestDocuments,
  requireMedicalCheckup, moveToUnderReview, assignAgent,
  verifyDocument, rejectDocument, getAuditLog,
  getUsers, updateUserRole,
  getPlans, createPlan, updatePlan, deletePlan,
};
