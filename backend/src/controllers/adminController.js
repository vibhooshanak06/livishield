/**
 * adminController.js
 * ─────────────────────────────────────────────
 * Pure MySQL — no MongoDB dependency.
 * Document verification state (verificationStatus, verifiedBy, verifiedAt,
 * rejectionReason) is stored directly inside the required_documents JSON
 * column alongside the upload metadata.
 *
 * Schema of each document object inside required_documents JSON array:
 * {
 *   type, name, required, uploaded,
 *   filePath, fileName, storedName, fileSize, mimeType, uploadedAt,
 *   verificationStatus: 'pending'|'verified'|'rejected'|'not_uploaded',
 *   verifiedBy, verifiedAt, rejectionReason
 * }
 */

const { getConnection } = require('../config/mysql');
const { randomUUID }    = require('crypto');
const logger            = require('../utils/logger');
const DocumentAuditLog  = require('../models/DocumentAuditLog');

const parseJSON = (val, fallback = null) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

/** Fire-and-forget MongoDB audit insert — never breaks the MySQL flow */
const auditLog = (entry) => {
  if (global.mongoAvailable === false) return;
  DocumentAuditLog.create(entry).catch(err =>
    logger.warn(`Admin audit log write failed (${entry.event}): ${err.message}`)
  );
};

/* ─────────────────────────────────────────────────────────────
   GET /admin/stats
───────────────────────────────────────────────────────────── */
const getDashboardStats = async (req, res) => {
  try {
    const conn = getConnection();

    const [[totals]] = await conn.query(`
      SELECT
        COUNT(*)                                           AS total,
        SUM(status = 'submitted')                          AS submitted,
        SUM(status = 'under_review')                       AS under_review,
        SUM(status = 'documents_required')                 AS documents_required,
        SUM(status = 'documents_expired')                  AS documents_expired,
        SUM(status = 'medical_checkup_required')           AS medical_checkup,
        SUM(status = 'approved')                           AS approved,
        SUM(status = 'rejected')                           AS rejected,
        SUM(status = 'policy_issued')                      AS policy_issued,
        SUM(status = 'cancelled')                          AS cancelled
      FROM health_insurance_proposals
    `);

    const [[{ recent }]] = await conn.query(`
      SELECT COUNT(*) AS recent FROM health_insurance_proposals
      WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    res.json({
      success: true,
      data: {
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
      },
    });
  } catch (err) {
    logger.error('getDashboardStats: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /admin/proposals  (paginated, filterable queue)
───────────────────────────────────────────────────────────── */
const getProposals = async (req, res) => {
  try {
    const {
      page = 1, limit = 15,
      status, search, dateFrom, dateTo,
      sortBy = 'submitted_at', sortOrder = 'desc',
    } = req.query;

    const conn = getConnection();
    const conditions = [];
    const params     = [];

    if (status)   { conditions.push('p.status = ?');              params.push(status); }
    if (dateFrom) { conditions.push('p.submitted_at >= ?');        params.push(dateFrom); }
    if (dateTo)   { conditions.push('p.submitted_at <= ?');        params.push(dateTo); }
    if (search)   {
      conditions.push(
        '(p.proposal_number LIKE ? OR JSON_EXTRACT(p.personal_info,"$.email") LIKE ? OR JSON_EXTRACT(p.personal_info,"$.firstName") LIKE ?)'
      );
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where     = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeSort  = ['submitted_at','updated_at','status'].includes(sortBy) ? sortBy : 'submitted_at';
    const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset    = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await conn.query(
      `SELECT p.id, p.proposal_number, p.status, p.submitted_at, p.updated_at,
              p.personal_info, p.premium_details, p.required_documents,
              pl.name AS plan_name, pl.provider AS plan_provider,
              pl.type AS plan_type, pl.sum_insured
       FROM health_insurance_proposals p
       LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id
       ${where}
       ORDER BY p.${safeSort} ${safeOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await conn.query(
      `SELECT COUNT(*) AS total FROM health_insurance_proposals p ${where}`,
      params
    );

    const proposals = rows.map(r => {
      const pi   = parseJSON(r.personal_info, {});
      const pd   = parseJSON(r.premium_details, {});
      const docs = parseJSON(r.required_documents, []);
      return {
        id:             r.id,
        proposalNumber: r.proposal_number,
        status:         r.status,
        submittedAt:    r.submitted_at,
        updatedAt:      r.updated_at,
        applicant: {
          name:  `${pi.firstName || ''} ${pi.lastName || ''}`.trim(),
          email: pi.email  || '',
          phone: pi.phone  || '',
        },
        plan: {
          name:       r.plan_name,
          provider:   r.plan_provider,
          type:       r.plan_type,
          sumInsured: r.sum_insured,
        },
        totalPremium:      pd.totalAnnualPremium || 0,
        docsUploaded:      docs.filter(d => d.uploaded).length,
        docsTotal:         docs.length,
        docsMandatory:     docs.filter(d => d.required).length,
        docsMandatoryDone: docs.filter(d => d.required && d.uploaded).length,
        docsVerified:      docs.filter(d => d.verificationStatus === 'verified').length,
      };
    });

    res.json({
      success: true,
      data: {
        proposals,
        pagination: {
          currentPage:    parseInt(page),
          totalPages:     Math.ceil(total / parseInt(limit)),
          totalProposals: Number(total),
          hasNext: offset + rows.length < Number(total),
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (err) {
    logger.error('getProposals: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /admin/proposals/:id  (full detail)
───────────────────────────────────────────────────────────── */
const getProposalDetail = async (req, res) => {
  try {
    const conn = getConnection();
    const [rows] = await conn.query(
      `SELECT p.*,
              pl.name AS plan_name, pl.provider AS plan_provider,
              pl.type AS plan_type, pl.sum_insured,
              pl.premium_annual, pl.network_hospitals, pl.claim_settlement_ratio
       FROM health_insurance_proposals p
       LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'Proposal not found' });
    const r = rows[0];

    // Enrich documents with verificationStatus default
    const rawDocs = parseJSON(r.required_documents, []);
    const documents = rawDocs.map(d => ({
      ...d,
      verificationStatus: d.verificationStatus || (d.uploaded ? 'pending' : 'not_uploaded'),
    }));

    res.json({
      success: true,
      data: {
        id:               r.id,
        proposalNumber:   r.proposal_number,
        status:           r.status,
        submittedAt:      r.submitted_at,
        updatedAt:        r.updated_at,
        personalInfo:     parseJSON(r.personal_info,     {}),
        familyMembers:    parseJSON(r.family_members,    []),
        medicalInfo:      parseJSON(r.medical_info,      {}),
        selectedAddOns:   parseJSON(r.selected_add_ons,  []),
        premiumDetails:   parseJSON(r.premium_details,   {}),
        documents,
        statusHistory:    parseJSON(r.status_history,    []),
        policyDetails:    parseJSON(r.policy_details,    null),
        rejectionDetails: parseJSON(r.rejection_details, null),
        assignedAgent:    parseJSON(r.assigned_agent,    null),
        communications:   parseJSON(r.communications,    []),
        plan: {
          name:                r.plan_name,
          provider:            r.plan_provider,
          type:                r.plan_type,
          sumInsured:          r.sum_insured,
          premiumAnnual:       r.premium_annual,
          networkHospitals:    r.network_hospitals,
          claimSettlementRatio: r.claim_settlement_ratio,
        },
      },
    });
  } catch (err) {
    logger.error('getProposalDetail: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /admin/proposals/:id/approve
───────────────────────────────────────────────────────────── */
const approveProposal = async (req, res) => {
  try {
    const { comment = 'Proposal approved by underwriting team.' } = req.body;
    const adminId = req.user.id;
    const conn    = getConnection();

    const [rows] = await conn.query(
      'SELECT id, proposal_number, status, status_history FROM health_insurance_proposals WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const p = rows[0];
    if (!['under_review', 'medical_checkup_required'].includes(p.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a proposal with status '${p.status}'.`,
      });
    }

    const policyNumber = `POL-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const policyStart  = new Date();
    const policyEnd    = new Date(policyStart);
    policyEnd.setFullYear(policyEnd.getFullYear() + 1);

    const history = [
      ...parseJSON(p.status_history, []),
      { status: 'approved', comment, updatedBy: adminId, timestamp: new Date() },
    ];

    await conn.query(
      `UPDATE health_insurance_proposals
       SET status = 'approved',
           status_history = ?,
           policy_details = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        JSON.stringify(history),
        JSON.stringify({
          policyNumber,
          policyStartDate: policyStart,
          policyEndDate:   policyEnd,
          issuedAt:        new Date(),
          issuedBy:        adminId,
        }),
        p.id,
      ]
    );

    logger.info(`Proposal ${p.proposal_number} approved → policy ${policyNumber}`);
    res.json({
      success: true,
      message: 'Proposal approved and policy generated.',
      data: { proposalNumber: p.proposal_number, policyNumber, status: 'approved' },
    });
  } catch (err) {
    logger.error('approveProposal: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /admin/proposals/:id/reject
───────────────────────────────────────────────────────────── */
const rejectProposal = async (req, res) => {
  try {
    const { reason, detailedReason, comment } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason is required.' });

    const adminId = req.user.id;
    const conn    = getConnection();

    const [rows] = await conn.query(
      'SELECT id, proposal_number, status, status_history FROM health_insurance_proposals WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const p = rows[0];
    if (['approved', 'rejected', 'policy_issued', 'cancelled'].includes(p.status)) {
      return res.status(400).json({ success: false, message: `Cannot reject proposal with status '${p.status}'.` });
    }

    const history = [
      ...parseJSON(p.status_history, []),
      { status: 'rejected', comment: comment || reason, updatedBy: adminId, timestamp: new Date() },
    ];

    await conn.query(
      `UPDATE health_insurance_proposals
       SET status = 'rejected',
           status_history = ?,
           rejection_details = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        JSON.stringify(history),
        JSON.stringify({ reason, detailedReason: detailedReason || null, rejectedAt: new Date(), rejectedBy: adminId }),
        p.id,
      ]
    );

    logger.info(`Proposal ${p.proposal_number} rejected by admin ${adminId}`);
    res.json({ success: true, message: 'Proposal rejected.', data: { proposalNumber: p.proposal_number, status: 'rejected' } });
  } catch (err) {
    logger.error('rejectProposal: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /admin/proposals/:id/request-documents
───────────────────────────────────────────────────────────── */
const requestDocuments = async (req, res) => {
  try {
    const { docTypes = [], comment = 'Additional documents required.' } = req.body;
    const adminId = req.user.id;
    const conn    = getConnection();

    const [rows] = await conn.query(
      'SELECT id, proposal_number, status, status_history, required_documents FROM health_insurance_proposals WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const p       = rows[0];
    const history = [...parseJSON(p.status_history, []), { status: 'documents_required', comment, updatedBy: adminId, timestamp: new Date() }];
    const docs    = parseJSON(p.required_documents, []);

    // Reset specified doc types so customer can re-upload
    if (docTypes.length) {
      docTypes.forEach(type => {
        const idx = docs.findIndex(d => d.type === type);
        if (idx !== -1) {
          docs[idx] = {
            type:               docs[idx].type,
            name:               docs[idx].name,
            required:           docs[idx].required,
            uploaded:           false,
            verificationStatus: 'not_uploaded',
          };
        }
      });
    }

    await conn.query(
      `UPDATE health_insurance_proposals
       SET status = 'documents_required', status_history = ?, required_documents = ?, updated_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(history), JSON.stringify(docs), p.id]
    );

    res.json({ success: true, message: 'Documents requested from customer.', data: { status: 'documents_required' } });
  } catch (err) {
    logger.error('requestDocuments: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /admin/proposals/:id/medical-checkup
───────────────────────────────────────────────────────────── */
const requireMedicalCheckup = async (req, res) => {
  try {
    const { comment = 'Medical checkup required before approval.' } = req.body;
    const adminId = req.user.id;
    const conn    = getConnection();

    const [rows] = await conn.query(
      'SELECT id, proposal_number, status, status_history FROM health_insurance_proposals WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const p       = rows[0];
    const history = [...parseJSON(p.status_history, []), { status: 'medical_checkup_required', comment, updatedBy: adminId, timestamp: new Date() }];

    await conn.query(
      `UPDATE health_insurance_proposals
       SET status = 'medical_checkup_required', status_history = ?, updated_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(history), p.id]
    );

    res.json({ success: true, message: 'Medical checkup status set.', data: { status: 'medical_checkup_required' } });
  } catch (err) {
    logger.error('requireMedicalCheckup: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /admin/proposals/:id/documents/:docType/verify
   Stores verificationStatus in the MySQL required_documents JSON
───────────────────────────────────────────────────────────── */
const verifyDocument = async (req, res) => {
  try {
    const { docType } = req.params;
    const adminId     = req.user.id;
    const conn        = getConnection();

    const [rows] = await conn.query(
      'SELECT id, required_documents FROM health_insurance_proposals WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const docs  = parseJSON(rows[0].required_documents, []);
    const idx   = docs.findIndex(d => d.type === docType);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Document type not found' });
    if (!docs[idx].uploaded) return res.status(400).json({ success: false, message: 'Document not yet uploaded' });

    docs[idx] = {
      ...docs[idx],
      verificationStatus: 'verified',
      verifiedBy:         String(adminId),
      verifiedAt:         new Date(),
      rejectionReason:    null,
    };

    await conn.query(
      'UPDATE health_insurance_proposals SET required_documents = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(docs), req.params.id]
    );

    // ── MongoDB: audit event ──
    const [pRows] = await conn.query(
      'SELECT proposal_number, user_id FROM health_insurance_proposals WHERE id = ?',
      [req.params.id]
    );
    if (pRows.length) {
      auditLog({
        proposalId:     req.params.id,
        proposalNumber: pRows[0].proposal_number,
        userId:         String(pRows[0].user_id),
        docType,
        docName:        docs[idx].name,
        event:          'verified',
        actorId:        String(adminId),
        actorRole:      'admin',
      });
    }

    logger.info(`Document '${docType}' verified on proposal ${req.params.id} by admin ${adminId}`);
    res.json({ success: true, message: `Document '${docType}' verified.` });
  } catch (err) {
    logger.error('verifyDocument: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /admin/proposals/:id/documents/:docType/reject
───────────────────────────────────────────────────────────── */
const rejectDocument = async (req, res) => {
  try {
    const { docType } = req.params;
    const { reason }  = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason required.' });

    const conn = getConnection();
    const [rows] = await conn.query(
      'SELECT id, required_documents FROM health_insurance_proposals WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const docs = parseJSON(rows[0].required_documents, []);
    const idx  = docs.findIndex(d => d.type === docType);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Document type not found' });

    docs[idx] = {
      ...docs[idx],
      verificationStatus: 'rejected',
      rejectionReason:    reason,
      verifiedBy:         null,
      verifiedAt:         null,
    };

    await conn.query(
      'UPDATE health_insurance_proposals SET required_documents = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(docs), req.params.id]
    );

    // ── MongoDB: audit event ──
    const [pRows] = await conn.query(
      'SELECT proposal_number, user_id FROM health_insurance_proposals WHERE id = ?',
      [req.params.id]
    );
    if (pRows.length) {
      auditLog({
        proposalId:     req.params.id,
        proposalNumber: pRows[0].proposal_number,
        userId:         String(pRows[0].user_id),
        docType,
        docName:        docs[idx].name,
        event:          'rejected',
        actorId:        String(req.user.id),
        actorRole:      'admin',
        rejectionReason: reason,
      });
    }

    logger.info(`Document '${docType}' rejected on proposal ${req.params.id}. Reason: ${reason}`);
    res.json({ success: true, message: `Document '${docType}' rejected.` });
  } catch (err) {
    logger.error('rejectDocument: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /admin/proposals/:id/assign
───────────────────────────────────────────────────────────── */
const assignAgent = async (req, res) => {
  try {
    const { agentId, agentName, agentEmail, agentPhone } = req.body;
    if (!agentId) return res.status(400).json({ success: false, message: 'agentId is required.' });

    const conn = getConnection();
    await conn.query(
      `UPDATE health_insurance_proposals
       SET assigned_agent = ?, updated_at = NOW()
       WHERE id = ?`,
      [JSON.stringify({ agentId, agentName, agentEmail, agentPhone, assignedAt: new Date() }), req.params.id]
    );

    res.json({ success: true, message: 'Agent assigned.' });
  } catch (err) {
    logger.error('assignAgent: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /admin/proposals/:id/audit-log
   Full MongoDB audit trail for all documents on this proposal
───────────────────────────────────────────────────────────── */
const getAuditLog = async (req, res) => {
  try {
    if (global.mongoAvailable === false) {
      return res.json({ success: true, data: [], message: 'Audit logging is offline (MongoDB unavailable).' });
    }

    const events = await DocumentAuditLog
      .find({ proposalId: req.params.id })
      .sort({ timestamp: -1 })
      .lean();

    res.json({ success: true, data: events });
  } catch (err) {
    logger.error('getAuditLog: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /admin/proposals/:id/under-review
   Move a 'submitted' proposal into 'under_review'
───────────────────────────────────────────────────────────── */
const moveToUnderReview = async (req, res) => {
  try {
    const { comment = 'Proposal picked up for underwriting review.' } = req.body;
    const adminId = req.user.id;
    const conn    = getConnection();

    const [rows] = await conn.query(
      'SELECT id, proposal_number, status, status_history FROM health_insurance_proposals WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const p = rows[0];
    if (p.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: `Cannot move to under_review — current status is '${p.status}'.`,
      });
    }

    const history = [
      ...parseJSON(p.status_history, []),
      { status: 'under_review', comment, updatedBy: adminId, timestamp: new Date() },
    ];

    await conn.query(
      `UPDATE health_insurance_proposals
       SET status = 'under_review', status_history = ?, updated_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(history), p.id]
    );

    logger.info(`Proposal ${p.proposal_number} moved to under_review by admin ${adminId}`);
    res.json({ success: true, message: 'Proposal moved to Under Review.', data: { status: 'under_review' } });
  } catch (err) {
    logger.error('moveToUnderReview: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /admin/users  — paginated user list
───────────────────────────────────────────────────────────── */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const conn = getConnection();
    const conditions = [];
    const params     = [];

    if (role)   { conditions.push('role = ?'); params.push(role); }
    if (search) {
      conditions.push('(email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await conn.query(
      `SELECT id, email, first_name, last_name, phone, role, is_verified, created_at
       FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await conn.query(
      `SELECT COUNT(*) AS total FROM users ${where}`, params
    );

    // Enrich with proposal count
    const userIds = rows.map(r => r.id);
    let proposalCounts = {};
    if (userIds.length) {
      const placeholders = userIds.map(() => '?').join(',');
      const [pc] = await conn.query(
        `SELECT user_id, COUNT(*) AS cnt FROM health_insurance_proposals
         WHERE user_id IN (${placeholders}) GROUP BY user_id`,
        userIds.map(String)
      );
      pc.forEach(r => { proposalCounts[r.user_id] = Number(r.cnt); });
    }

    const users = rows.map(r => ({
      id:           r.id,
      email:        r.email,
      firstName:    r.first_name,
      lastName:     r.last_name,
      phone:        r.phone,
      role:         r.role,
      isVerified:   !!r.is_verified,
      createdAt:    r.created_at,
      proposalCount: proposalCounts[String(r.id)] || 0,
    }));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage:  parseInt(page),
          totalPages:   Math.ceil(total / parseInt(limit)),
          totalUsers:   Number(total),
          hasNext: offset + rows.length < Number(total),
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (err) {
    logger.error('getUsers: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   PATCH /admin/users/:id/role  — change user role
───────────────────────────────────────────────────────────── */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'admin', 'agent'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    const conn = getConnection();
    const [r] = await conn.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: `User role updated to '${role}'.` });
  } catch (err) {
    logger.error('updateUserRole: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET  /admin/plans         — list all plans
   POST /admin/plans         — create plan
   PUT  /admin/plans/:id     — update plan
   DELETE /admin/plans/:id   — soft delete (set status=discontinued)
───────────────────────────────────────────────────────────── */
const getPlans = async (req, res) => {
  try {
    const conn = getConnection();
    const { status } = req.query;
    const [rows] = await conn.query(
      `SELECT * FROM health_insurance_plans ${status ? 'WHERE status = ?' : ''} ORDER BY created_at DESC`,
      status ? [status] : []
    );
    const plans = rows.map(r => ({
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
    }));
    res.json({ success: true, data: plans });
  } catch (err) {
    logger.error('getPlans: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const createPlan = async (req, res) => {
  try {
    const conn = getConnection();
    const d = req.body;
    await conn.query(
      `INSERT INTO health_insurance_plans
        (name,provider,type,sum_insured,premium_monthly,premium_annual,age_min,age_max,
         network_hospitals,cashless_hospitals,claim_settlement_ratio,renewal_age,rating,
         popular,recommended,status,features,coverage,waiting_periods,copayment,
         sub_limits,add_ons,benefits,exclusions)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        d.name, d.provider, d.type, d.sumInsured,
        d.premium?.monthly || 0, d.premium?.annual || 0,
        d.ageRange?.min || 18, d.ageRange?.max || 65,
        d.networkHospitals || 0, d.cashlessHospitals || 0,
        d.claimSettlementRatio || 90, d.renewalAge || 75,
        d.rating || 4.0, d.popular ? 1 : 0, d.recommended ? 1 : 0,
        d.status || 'active',
        JSON.stringify(d.features || []), JSON.stringify(d.coverage || {}),
        JSON.stringify(d.waitingPeriods || {}), JSON.stringify(d.coPayment || {}),
        JSON.stringify(d.subLimits || []), JSON.stringify(d.addOns || []),
        JSON.stringify(d.benefits || []), JSON.stringify(d.exclusions || []),
      ]
    );
    res.status(201).json({ success: true, message: 'Plan created.' });
  } catch (err) {
    logger.error('createPlan: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updatePlan = async (req, res) => {
  try {
    const conn = getConnection();
    const d = req.body;
    const [r] = await conn.query(
      `UPDATE health_insurance_plans SET
        name=?, provider=?, type=?, sum_insured=?, premium_monthly=?, premium_annual=?,
        age_min=?, age_max=?, network_hospitals=?, cashless_hospitals=?,
        claim_settlement_ratio=?, renewal_age=?, rating=?, popular=?, recommended=?,
        status=?, features=?, coverage=?, waiting_periods=?, copayment=?,
        sub_limits=?, add_ons=?, benefits=?, exclusions=?, updated_at=NOW()
       WHERE id = ?`,
      [
        d.name, d.provider, d.type, d.sumInsured,
        d.premium?.monthly || 0, d.premium?.annual || 0,
        d.ageRange?.min || 18, d.ageRange?.max || 65,
        d.networkHospitals || 0, d.cashlessHospitals || 0,
        d.claimSettlementRatio || 90, d.renewalAge || 75,
        d.rating || 4.0, d.popular ? 1 : 0, d.recommended ? 1 : 0,
        d.status || 'active',
        JSON.stringify(d.features || []), JSON.stringify(d.coverage || {}),
        JSON.stringify(d.waitingPeriods || {}), JSON.stringify(d.coPayment || {}),
        JSON.stringify(d.subLimits || []), JSON.stringify(d.addOns || []),
        JSON.stringify(d.benefits || []), JSON.stringify(d.exclusions || []),
        req.params.id,
      ]
    );
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Plan not found.' });
    res.json({ success: true, message: 'Plan updated.' });
  } catch (err) {
    logger.error('updatePlan: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deletePlan = async (req, res) => {
  try {
    const conn = getConnection();
    const [r] = await conn.query(
      `UPDATE health_insurance_plans SET status = 'discontinued', updated_at = NOW() WHERE id = ?`,
      [req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Plan not found.' });
    res.json({ success: true, message: 'Plan discontinued.' });
  } catch (err) {
    logger.error('deletePlan: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getProposals,
  getProposalDetail,
  approveProposal,
  rejectProposal,
  requestDocuments,
  requireMedicalCheckup,
  moveToUnderReview,
  verifyDocument,
  rejectDocument,
  assignAgent,
  getAuditLog,
  getUsers,
  updateUserRole,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
};
