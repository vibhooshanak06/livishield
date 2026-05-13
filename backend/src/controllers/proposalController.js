const { getConnection } = require('../config/mysql');
const { randomUUID } = require('crypto');

const generateProposalNumber = () => `PROP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const generateRequiredDocuments = (medicalInfo, plan) => {
  const docs = [
    { type: 'identity_proof', name: 'Identity Proof (Aadhar/PAN/Passport)', required: true },
    { type: 'address_proof', name: 'Address Proof', required: true },
    { type: 'age_proof', name: 'Age Proof (Birth Certificate/10th Certificate)', required: true },
    { type: 'passport_photo', name: 'Passport Size Photograph', required: true }
  ];
  if (plan && plan.sum_insured > 500000) {
    docs.push({ type: 'income_proof', name: 'Income Proof (Salary Slip/ITR)', required: true });
  }
  if (medicalInfo?.preExistingConditions?.length > 0) {
    docs.push({ type: 'medical_reports', name: 'Medical Reports for Pre-existing Conditions', required: true });
  }
  if (medicalInfo?.previousInsurance) {
    docs.push({ type: 'previous_policy', name: 'Previous Health Insurance Policy Copy', required: true });
  }
  return docs;
};

const submitProposal = async (req, res) => {
  try {
    const { planId, personalInfo, familyMembers, medicalInfo, selectedAddOns, premiumDetails } = req.body;
    const userId = req.user?.id || 'guest';
    const conn = getConnection();

    const [plans] = await conn.query('SELECT * FROM health_insurance_plans WHERE id = ?', [planId]);
    if (!plans.length) return res.status(404).json({ success: false, message: 'Health insurance plan not found' });

    const plan = plans[0];
    const proposalNumber = generateProposalNumber();
    const id = randomUUID();
    const requiredDocuments = generateRequiredDocuments(medicalInfo, plan);
    const statusHistory = [{ status: 'submitted', comment: 'Proposal submitted by customer', updatedBy: userId, timestamp: new Date() }];

    await conn.query(
      `INSERT INTO health_insurance_proposals (id, proposal_number, plan_id, user_id, personal_info, family_members, medical_info, selected_add_ons, premium_details, required_documents, status_history)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [id, proposalNumber, planId, userId, JSON.stringify(personalInfo), JSON.stringify(familyMembers || []),
       JSON.stringify(medicalInfo), JSON.stringify(selectedAddOns || []), JSON.stringify(premiumDetails),
       JSON.stringify(requiredDocuments), JSON.stringify(statusHistory)]
    );

    res.status(201).json({ success: true, message: 'Proposal submitted successfully', data: { proposalNumber, proposalId: id, status: 'submitted', requiredDocuments } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting proposal', error: error.message });
  }
};

const getUserProposals = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { page = 1, limit = 10, status } = req.query;
    const conn = getConnection();

    const conditions = ['p.user_id = ?'];
    const params = [userId];
    if (status) { conditions.push('p.status = ?'); params.push(status); }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const [rows] = await conn.query(
      `SELECT p.*, pl.name as plan_name, pl.provider as plan_provider, pl.type as plan_type, pl.sum_insured as plan_sum_insured
       FROM health_insurance_proposals p LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id
       WHERE ${conditions.join(' AND ')} ORDER BY p.submitted_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await conn.query(`SELECT COUNT(*) as total FROM health_insurance_proposals WHERE ${conditions.join(' AND ')}`, params);

    const proposals = rows.map(r => ({
      _id: r.id, proposalNumber: r.proposal_number, status: r.status, submittedAt: r.submitted_at,
      planId: { name: r.plan_name, provider: r.plan_provider, type: r.plan_type, sumInsured: r.plan_sum_insured },
      premiumDetails: r.premium_details, requiredDocuments: r.required_documents || [],
      policyDetails: r.policy_details || null, statusHistory: r.status_history || []
    }));

    res.status(200).json({ success: true, data: { proposals, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalProposals: total, hasNext: page * limit < total, hasPrev: page > 1 } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching proposals', error: error.message });
  }
};

const getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || req.query.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID is required' });

    const conn = getConnection();
    const [rows] = await conn.query(
      `SELECT p.*, pl.name as plan_name, pl.provider as plan_provider, pl.type as plan_type, pl.sum_insured as plan_sum_insured
       FROM health_insurance_proposals p LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id
       WHERE p.user_id = ? ORDER BY p.submitted_at DESC`,
      [userId]
    );

    const proposals = rows.map(r => ({
      _id: r.id, proposalNumber: r.proposal_number, status: r.status, submittedAt: r.submitted_at,
      planId: { name: r.plan_name, provider: r.plan_provider, type: r.plan_type },
      premiumDetails: r.premium_details, requiredDocuments: r.required_documents || [],
      policyDetails: r.policy_details || null, statusHistory: r.status_history || []
    }));

    const stats = {
      totalProposals: proposals.length,
      activeProposals: proposals.filter(p => !['approved','rejected','cancelled'].includes(p.status)).length,
      approvedPolicies: proposals.filter(p => p.status === 'approved').length,
      pendingDocuments: proposals.filter(p => p.status === 'documents_required').length
    };

    res.status(200).json({ success: true, data: { proposals, stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching dashboard data', error: error.message });
  }
};

const getProposalById = async (req, res) => {
  try {
    const conn = getConnection();
    const [rows] = await conn.query(
      `SELECT p.*, pl.name as plan_name, pl.provider as plan_provider FROM health_insurance_proposals p LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Proposal not found' });
    const r = rows[0];
    if (req.user?.id && r.user_id !== String(req.user.id) && !req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.status(200).json({ success: true, data: r });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching proposal', error: error.message });
  }
};

const updateProposalStatus = async (req, res) => {
  try {
    const { status, comment, assignedAgent, rejectionDetails } = req.body;
    const updatedBy = req.user?.id || 'system';
    const conn = getConnection();

    const [rows] = await conn.query('SELECT * FROM health_insurance_proposals WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const proposal = rows[0];
    const statusHistory = [...(proposal.status_history || []), { status, comment, updatedBy, timestamp: new Date() }];
    const updates = { status, status_history: JSON.stringify(statusHistory) };

    if (status === 'approved') {
      updates.policy_details = JSON.stringify({ policyStartDate: new Date(), policyEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
    }
    if (status === 'rejected' && rejectionDetails) {
      updates.rejection_details = JSON.stringify({ ...rejectionDetails, rejectedAt: new Date(), rejectedBy: updatedBy });
    }
    if (assignedAgent) {
      updates.assigned_agent = JSON.stringify({ ...assignedAgent, assignedAt: new Date() });
    }

    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await conn.query(`UPDATE health_insurance_proposals SET ${fields} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    res.status(200).json({ success: true, message: 'Proposal status updated successfully', data: { proposalNumber: proposal.proposal_number, status } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating proposal status', error: error.message });
  }
};

const getAllProposals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, dateFrom, dateTo, search } = req.query;
    const conn = getConnection();
    const conditions = [];
    const params = [];

    if (status) { conditions.push('p.status = ?'); params.push(status); }
    if (dateFrom) { conditions.push('p.submitted_at >= ?'); params.push(dateFrom); }
    if (dateTo) { conditions.push('p.submitted_at <= ?'); params.push(dateTo); }
    if (search) { conditions.push('p.proposal_number LIKE ?'); params.push(`%${search}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await conn.query(`SELECT p.*, pl.name as plan_name, pl.provider as plan_provider, pl.type as plan_type FROM health_insurance_proposals p LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id ${where} ORDER BY p.submitted_at DESC LIMIT ? OFFSET ?`, [...params, parseInt(limit), offset]);
    const [[{ total }]] = await conn.query(`SELECT COUNT(*) as total FROM health_insurance_proposals p ${where}`, params);

    res.status(200).json({ success: true, data: { proposals: rows, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalProposals: total } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching proposals', error: error.message });
  }
};

const addCommunication = async (req, res) => {
  try {
    const { type, subject, message, sentTo } = req.body;
    const sentBy = req.user?.id || 'system';
    const conn = getConnection();

    const [rows] = await conn.query('SELECT communications FROM health_insurance_proposals WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const communications = [...(rows[0].communications || []), { type, subject, message, sentBy, sentTo, timestamp: new Date() }];
    await conn.query('UPDATE health_insurance_proposals SET communications = ? WHERE id = ?', [JSON.stringify(communications), req.params.id]);

    res.status(200).json({ success: true, message: 'Communication logged successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding communication', error: error.message });
  }
};

module.exports = { submitProposal, getUserProposals, getCustomerDashboard, getProposalById, updateProposalStatus, getAllProposals, addCommunication };
