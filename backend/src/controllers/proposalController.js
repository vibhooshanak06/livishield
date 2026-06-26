/**
 * proposalController.js
 * ─────────────────────────────────────────────────────────────
 * Dual-database architecture:
 *
 *  MySQL  = current state  (is doc uploaded? verified? what's the filePath?)
 *  MongoDB= audit log      (immutable record of every event — upload, delete, submit)
 *  Disk   = file bytes     (uploads/proposals/<proposalId>/<docType>_<ts>.<ext>)
 */

const { getConnection } = require('../config/mysql');
const { randomUUID }    = require('crypto');
const path              = require('path');
const fs                = require('fs');
const logger            = require('../utils/logger');
const DocumentAuditLog  = require('../models/DocumentAuditLog');

/* ── helpers ────────────────────────────────────────────────── */
const parseJSON = (val, fallback = null) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

/**
 * Fire-and-forget MongoDB audit insert.
 * Always graceful — a Mongo failure must never break the MySQL flow.
 */
const auditLog = (entry) => {
  if (global.mongoAvailable === false) return;
  DocumentAuditLog.create(entry).catch(err =>
    logger.warn(`Audit log write failed (${entry.event}): ${err.message}`)
  );
};

const DOC_UPLOAD_WINDOW_MS  = 48 * 60 * 60 * 1000; // 48 hours
const REACTIVATION_WINDOW_DAYS = 7;

const generateProposalNumber = () =>
  `PROP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const generateRequiredDocuments = (medicalInfo, plan) => {
  const docs = [
    { type: 'identity_proof',  name: 'Identity Proof (Aadhar/PAN/Passport)',       required: true },
    { type: 'address_proof',   name: 'Address Proof',                               required: true },
    { type: 'age_proof',       name: 'Age Proof (Birth Certificate/10th Certificate)', required: true },
    { type: 'passport_photo',  name: 'Passport Size Photograph',                   required: true },
  ];
  if (plan?.sum_insured > 500000)
    docs.push({ type: 'income_proof',   name: 'Income Proof (Salary Slip/ITR)',           required: true });
  if (medicalInfo?.preExistingConditions?.length > 0)
    docs.push({ type: 'medical_reports', name: 'Medical Reports for Pre-existing Conditions', required: true });
  if (medicalInfo?.previousInsurance)
    docs.push({ type: 'previous_policy', name: 'Previous Health Insurance Policy Copy',  required: true });
  return docs;
};

/* ── submitProposal ─────────────────────────────────────────── */
const submitProposal = async (req, res) => {
  try {
    const { planId, personalInfo, familyMembers, medicalInfo, selectedAddOns, premiumDetails } = req.body;
    const userId = req.user?.id || 'guest';
    const conn   = getConnection();

    const [plans] = await conn.query('SELECT * FROM health_insurance_plans WHERE id = ?', [planId]);
    if (!plans.length)
      return res.status(404).json({ success: false, message: 'Health insurance plan not found' });

    const plan             = plans[0];
    const proposalNumber   = generateProposalNumber();
    const id               = randomUUID();
    const requiredDocuments= generateRequiredDocuments(medicalInfo, plan);
    const statusHistory    = [{
      status:    'submitted',
      comment:   'Proposal submitted by customer',
      updatedBy: userId,
      timestamp: new Date(),
    }];

    await conn.query(
      `INSERT INTO health_insurance_proposals
         (id, proposal_number, plan_id, user_id,
          personal_info, family_members, medical_info, selected_add_ons,
          premium_details, required_documents, status_history)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, proposalNumber, planId, userId,
        JSON.stringify(personalInfo),
        JSON.stringify(familyMembers || []),
        JSON.stringify(medicalInfo),
        JSON.stringify(selectedAddOns || []),
        JSON.stringify(premiumDetails),
        JSON.stringify(requiredDocuments),
        JSON.stringify(statusHistory),
      ]
    );

    res.status(201).json({
      success:  true,
      message:  'Proposal submitted successfully',
      data:     { proposalNumber, proposalId: id, status: 'submitted', requiredDocuments, submittedAt: new Date().toISOString() },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting proposal', error: error.message });
  }
};

/* ── getUserProposals ───────────────────────────────────────── */
const getUserProposals = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || req.query.userId;
    const { page = 1, limit = 10, status } = req.query;
    const conn = getConnection();

    const conditions = ['p.user_id = ?'];
    const params     = [userId];
    if (status) { conditions.push('p.status = ?'); params.push(status); }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const [rows] = await conn.query(
      `SELECT p.*, pl.name AS plan_name, pl.provider AS plan_provider,
              pl.type AS plan_type, pl.sum_insured AS plan_sum_insured
       FROM health_insurance_proposals p
       LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.submitted_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await conn.query(
      `SELECT COUNT(*) AS total FROM health_insurance_proposals WHERE ${conditions.join(' AND ')}`,
      params
    );

    const proposals = rows.map(r => ({
      _id:            r.id,
      proposalNumber: r.proposal_number,
      status:         r.status,
      submittedAt:    r.submitted_at,
      planId: { name: r.plan_name, provider: r.plan_provider, type: r.plan_type, sumInsured: r.plan_sum_insured },
      premiumDetails:    parseJSON(r.premium_details, {}),
      requiredDocuments: parseJSON(r.required_documents, []),
      policyDetails:     parseJSON(r.policy_details, null),
      statusHistory:     parseJSON(r.status_history, []),
    }));

    res.status(200).json({
      success: true,
      data: {
        proposals,
        pagination: {
          currentPage:  parseInt(page),
          totalPages:   Math.ceil(total / limit),
          totalProposals: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching proposals', error: error.message });
  }
};

/* ── getCustomerDashboard ───────────────────────────────────── */
const getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || req.query.userId;
    if (!userId)
      return res.status(400).json({ success: false, message: 'User ID is required' });

    const conn = getConnection();
    const [rows] = await conn.query(
      `SELECT p.*, pl.name AS plan_name, pl.provider AS plan_provider,
              pl.type AS plan_type, pl.sum_insured AS plan_sum_insured
       FROM health_insurance_proposals p
       LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id
       WHERE p.user_id = ?
       ORDER BY p.submitted_at DESC`,
      [userId]
    );

    const proposals = rows.map(r => ({
      _id:              r.id,
      proposalNumber:   r.proposal_number,
      status:           r.status,
      submittedAt:      r.submitted_at,
      updatedAt:        r.updated_at,
      planId: { name: r.plan_name, provider: r.plan_provider, type: r.plan_type, sumInsured: r.plan_sum_insured },
      premiumDetails:    parseJSON(r.premium_details, {}),
      requiredDocuments: parseJSON(r.required_documents, []),
      policyDetails:    parseJSON(r.policy_details, null),
      rejectionDetails: parseJSON(r.rejection_details, null),
      statusHistory:    parseJSON(r.status_history, []),
    }));

    const stats = {
      totalProposals:   proposals.length,
      activeProposals:  proposals.filter(p => !['approved','rejected','cancelled','policy_issued'].includes(p.status)).length,
      approvedPolicies: proposals.filter(p => ['approved','policy_issued'].includes(p.status)).length,
      pendingDocuments: proposals.filter(p => ['submitted','documents_required','documents_expired'].includes(p.status)).length,
    };

    res.status(200).json({ success: true, data: { proposals, stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching dashboard data', error: error.message });
  }
};

/* ── getProposalById ────────────────────────────────────────── */
const getProposalById = async (req, res) => {
  try {
    const conn = getConnection();
    const [rows] = await conn.query(
      `SELECT p.*, pl.name AS plan_name, pl.provider AS plan_provider
       FROM health_insurance_proposals p
       LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Proposal not found' });

    const r = rows[0];
    if (req.user?.id && r.user_id !== String(req.user.id) && !req.user?.isAdmin)
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.status(200).json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching proposal', error: error.message });
  }
};

/* ── updateProposalStatus ───────────────────────────────────── */
const updateProposalStatus = async (req, res) => {
  try {
    const { status, comment, assignedAgent, rejectionDetails } = req.body;
    const updatedBy = req.user?.id || 'system';
    const conn      = getConnection();

    const [rows] = await conn.query(
      'SELECT * FROM health_insurance_proposals WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Proposal not found' });

    const proposal      = rows[0];
    const statusHistory = [...parseJSON(proposal.status_history, []), { status, comment, updatedBy, timestamp: new Date() }];
    const updates       = { status, status_history: JSON.stringify(statusHistory) };

    if (status === 'approved') {
      updates.policy_details = JSON.stringify({
        policyStartDate: new Date(),
        policyEndDate:   new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
    }
    if (status === 'rejected' && rejectionDetails) {
      updates.rejection_details = JSON.stringify({ ...rejectionDetails, rejectedAt: new Date(), rejectedBy: updatedBy });
    }
    if (assignedAgent) {
      updates.assigned_agent = JSON.stringify({ ...assignedAgent, assignedAt: new Date() });
    }

    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await conn.query(
      `UPDATE health_insurance_proposals SET ${fields} WHERE id = ?`,
      [...Object.values(updates), req.params.id]
    );

    res.status(200).json({ success: true, message: 'Proposal status updated successfully', data: { proposalNumber: proposal.proposal_number, status } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating proposal status', error: error.message });
  }
};

/* ── getAllProposals ─────────────────────────────────────────── */
const getAllProposals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, dateFrom, dateTo, search } = req.query;
    const conn       = getConnection();
    const conditions = [];
    const params     = [];

    if (status)   { conditions.push('p.status = ?');            params.push(status); }
    if (dateFrom) { conditions.push('p.submitted_at >= ?');      params.push(dateFrom); }
    if (dateTo)   { conditions.push('p.submitted_at <= ?');      params.push(dateTo); }
    if (search)   { conditions.push('p.proposal_number LIKE ?'); params.push(`%${search}%`); }

    const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await conn.query(
      `SELECT p.*, pl.name AS plan_name, pl.provider AS plan_provider, pl.type AS plan_type
       FROM health_insurance_proposals p
       LEFT JOIN health_insurance_plans pl ON p.plan_id = pl.id
       ${where}
       ORDER BY p.submitted_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await conn.query(
      `SELECT COUNT(*) AS total FROM health_insurance_proposals p ${where}`, params
    );

    res.status(200).json({ success: true, data: { proposals: rows, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalProposals: total } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching proposals', error: error.message });
  }
};

/* ── addCommunication ───────────────────────────────────────── */
const addCommunication = async (req, res) => {
  try {
    const { type, subject, message, sentTo } = req.body;
    const sentBy = req.user?.id || 'system';
    const conn   = getConnection();

    const [rows] = await conn.query(
      'SELECT communications FROM health_insurance_proposals WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Proposal not found' });

    const existing       = parseJSON(rows[0].communications, []);
    const communications = [...existing, { type, subject, message, sentBy, sentTo, timestamp: new Date() }];
    await conn.query(
      'UPDATE health_insurance_proposals SET communications = ? WHERE id = ?',
      [JSON.stringify(communications), req.params.id]
    );

    res.status(200).json({ success: true, message: 'Communication logged successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding communication', error: error.message });
  }
};

/* ── uploadDocument ─────────────────────────────────────────── */
/**
 * POST /proposals/:id/documents
 *
 * MySQL  → updates required_documents JSON (current state)
 * MongoDB→ appends an audit event (uploaded | re_uploaded)
 * Disk   → saves the file bytes, then renames to <docType>_<ts>.<ext>
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded.' });

    const { docType } = req.body;
    if (!docType) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: 'docType is required.' });
    }

    const conn = getConnection();
    const [rows] = await conn.query(
      'SELECT id, proposal_number, user_id, status, required_documents FROM health_insurance_proposals WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    const proposal = rows[0];

    if (req.user?.id && String(proposal.user_id) !== String(req.user.id)) {
      fs.unlink(req.file.path, () => {});
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const lockedStatuses = ['under_review','approved','rejected','policy_issued','cancelled','documents_expired'];
    if (lockedStatuses.includes(proposal.status)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: `Documents cannot be changed once the proposal is '${proposal.status}'.` });
    }

    const docs     = parseJSON(proposal.required_documents, []);
    const docIndex = docs.findIndex(d => d.type === docType);
    if (docIndex === -1) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: `Unknown document type: ${docType}` });
    }

    // Rename temp file to <docType>_<ts>.<ext>
    const ext         = path.extname(req.file.originalname).toLowerCase();
    const newFilename = `${docType}_${Date.now()}${ext}`;
    const newFilePath = path.join(path.dirname(req.file.path), newFilename);
    try { fs.renameSync(req.file.path, newFilePath); }
    catch (e) { logger.warn('File rename failed: ' + e.message); }

    const finalPath = fs.existsSync(newFilePath) ? newFilePath : req.file.path;
    const finalName = fs.existsSync(newFilePath) ? newFilename : req.file.filename;

    // Capture previous state for audit
    const previousState = docs[docIndex].uploaded ? {
      fileName:           docs[docIndex].fileName,
      filePath:           docs[docIndex].filePath,
      verificationStatus: docs[docIndex].verificationStatus,
    } : null;

    // Delete old file if replacing
    if (docs[docIndex].filePath && docs[docIndex].filePath !== finalPath) {
      try { fs.unlinkSync(docs[docIndex].filePath); } catch { /* gone */ }
    }

    const fileEntry = {
      ...docs[docIndex],
      uploaded:           true,
      uploadedAt:         new Date(),
      filePath:           finalPath,
      fileName:           req.file.originalname,
      storedName:         finalName,
      fileSize:           req.file.size,
      mimeType:           req.file.mimetype,
      verificationStatus: 'pending',  // reset on re-upload
      verifiedBy:         null,
      verifiedAt:         null,
      rejectionReason:    null,
    };
    docs[docIndex] = fileEntry;

    // ── MySQL: current state ──
    await conn.query(
      'UPDATE health_insurance_proposals SET required_documents = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(docs), proposal.id]
    );

    // ── MongoDB: audit event ──
    auditLog({
      proposalId:     proposal.id,
      proposalNumber: proposal.proposal_number,
      userId:         String(proposal.user_id),
      docType,
      docName:        docs[docIndex].name,
      event:          previousState ? 're_uploaded' : 'uploaded',
      actorId:        String(req.user?.id || proposal.user_id),
      actorRole:      'customer',
      fileDetails: {
        fileName:   req.file.originalname,
        storedName: finalName,
        filePath:   finalPath,
        fileSize:   req.file.size,
        mimeType:   req.file.mimetype,
      },
      ...(previousState && { previousState }),
    });

    logger.info(`Document '${docType}' uploaded for proposal ${proposal.id} (${finalName})`);

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully.',
      data: {
        docType,
        fileName:            req.file.originalname,
        fileSize:            req.file.size,
        allMandatoryUploaded: docs.filter(d => d.required).every(d => d.uploaded),
        uploadedCount:       docs.filter(d => d.uploaded).length,
        totalDocs:           docs.length,
        proposalStatus:      proposal.status,
      },
    });
  } catch (error) {
    if (req.file?.path) { try { fs.unlinkSync(req.file.path); } catch { /* ignore */ } }
    logger.error('uploadDocument error: ' + error.message);
    res.status(500).json({ success: false, message: 'Error uploading document.', error: error.message });
  }
};

/* ── deleteDocument ─────────────────────────────────────────── */
const deleteDocument = async (req, res) => {
  try {
    const { docType } = req.params;
    const conn = getConnection();
    const [rows] = await conn.query(
      'SELECT id, proposal_number, user_id, status, required_documents FROM health_insurance_proposals WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Proposal not found.' });

    const proposal = rows[0];
    if (req.user?.id && String(proposal.user_id) !== String(req.user.id))
      return res.status(403).json({ success: false, message: 'Access denied.' });

    const lockedStatuses = ['under_review','approved','rejected','policy_issued','cancelled'];
    if (lockedStatuses.includes(proposal.status))
      return res.status(400).json({ success: false, message: 'Cannot remove documents at this stage.' });

    const docs     = parseJSON(proposal.required_documents, []);
    const docIndex = docs.findIndex(d => d.type === docType);
    if (docIndex === -1)
      return res.status(404).json({ success: false, message: 'Document type not found.' });
    if (!docs[docIndex].uploaded)
      return res.status(400).json({ success: false, message: 'No file uploaded for this document type.' });

    const previousState = {
      fileName:           docs[docIndex].fileName,
      filePath:           docs[docIndex].filePath,
      verificationStatus: docs[docIndex].verificationStatus,
    };

    // Delete file from disk
    if (docs[docIndex].filePath) {
      try { fs.unlinkSync(docs[docIndex].filePath); } catch { /* gone */ }
    }

    docs[docIndex] = { type: docs[docIndex].type, name: docs[docIndex].name, required: docs[docIndex].required, uploaded: false };

    // ── MySQL ──
    await conn.query(
      'UPDATE health_insurance_proposals SET required_documents = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(docs), proposal.id]
    );

    // ── MongoDB: audit event ──
    auditLog({
      proposalId:     proposal.id,
      proposalNumber: proposal.proposal_number,
      userId:         String(proposal.user_id),
      docType,
      docName:        docs[docIndex].name,
      event:          'deleted',
      actorId:        String(req.user?.id || proposal.user_id),
      actorRole:      'customer',
      previousState,
    });

    res.status(200).json({ success: true, message: 'Document removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing document.', error: error.message });
  }
};

/* ── submitDocuments ────────────────────────────────────────── */
/**
 * Customer clicks "Submit All Documents for Review".
 * MySQL: status → under_review (locks doc uploads)
 * MongoDB: audit event for each uploaded doc
 */
const submitDocuments = async (req, res) => {
  try {
    const conn = getConnection();
    const [rows] = await conn.query(
      'SELECT id, proposal_number, user_id, status, required_documents, status_history FROM health_insurance_proposals WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Proposal not found.' });

    const proposal = rows[0];
    if (req.user?.id && String(proposal.user_id) !== String(req.user.id))
      return res.status(403).json({ success: false, message: 'Access denied.' });

    const allowedStatuses = ['submitted','documents_required'];
    if (!allowedStatuses.includes(proposal.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot submit documents for a proposal with status '${proposal.status}'.`,
      });
    }

    const docs             = parseJSON(proposal.required_documents, []);
    const missingMandatory = docs.filter(d => d.required && !d.uploaded);
    if (missingMandatory.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please upload all mandatory documents before submitting. Missing: ${missingMandatory.map(d => d.name).join(', ')}`,
        data:    { missingDocs: missingMandatory.map(d => ({ type: d.type, name: d.name })) },
      });
    }

    const history = parseJSON(proposal.status_history, []);
    history.push({
      status:    'under_review',
      comment:   'All mandatory documents submitted by customer. Proposal sent for review.',
      updatedBy: req.user?.id || 'customer',
      timestamp: new Date(),
    });

    // ── MySQL ──
    await conn.query(
      `UPDATE health_insurance_proposals SET status = 'under_review', status_history = ?, updated_at = NOW() WHERE id = ?`,
      [JSON.stringify(history), proposal.id]
    );

    // ── MongoDB: one audit event per uploaded doc ──
    const actorId = String(req.user?.id || proposal.user_id);
    for (const doc of docs.filter(d => d.uploaded)) {
      auditLog({
        proposalId:     proposal.id,
        proposalNumber: proposal.proposal_number,
        userId:         String(proposal.user_id),
        docType:        doc.type,
        docName:        doc.name,
        event:          'submitted',
        actorId,
        actorRole:      'customer',
        fileDetails: {
          fileName:   doc.fileName,
          storedName: doc.storedName,
          filePath:   doc.filePath,
          fileSize:   doc.fileSize,
          mimeType:   doc.mimeType,
        },
      });
    }

    logger.info(`Proposal ${proposal.proposal_number} — documents submitted for review`);

    res.status(200).json({
      success: true,
      message: 'Documents submitted for review. Your proposal is now under review.',
      data:    { proposalNumber: proposal.proposal_number, status: 'under_review' },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting documents.', error: error.message });
  }
};

/* ── expireStaleProposals ───────────────────────────────────── */
const expireStaleProposals = async () => {
  try {
    const conn   = getConnection();
    const cutoff = new Date(Date.now() - DOC_UPLOAD_WINDOW_MS);

    const [rows] = await conn.query(
      `SELECT id, proposal_number, user_id, status_history, required_documents
       FROM health_insurance_proposals
       WHERE status = 'submitted' AND submitted_at < ?`,
      [cutoff]
    );

    let expired = 0;
    for (const row of rows) {
      const docs        = parseJSON(row.required_documents, []);
      const anyUploaded = docs.some(d => d.uploaded);
      if (anyUploaded) continue;

      const history = parseJSON(row.status_history, []);
      history.push({
        status:    'documents_expired',
        comment:   'Proposal expired: required documents were not uploaded within 48 hours.',
        updatedBy: 'system',
        timestamp: new Date(),
      });

      await conn.query(
        `UPDATE health_insurance_proposals SET status = 'documents_expired', status_history = ?, updated_at = NOW() WHERE id = ?`,
        [JSON.stringify(history), row.id]
      );
      expired++;
      logger.info(`Proposal ${row.proposal_number} expired (no documents uploaded)`);
    }

    if (expired > 0) logger.info(`Expiry job: ${expired} proposal(s) marked as documents_expired`);
    return expired;
  } catch (error) {
    logger.error('expireStaleProposals error: ' + error.message);
    throw error;
  }
};

/* ── reactivateProposal ─────────────────────────────────────── */
const reactivateProposal = async (req, res) => {
  try {
    const conn = getConnection();
    const [rows] = await conn.query(
      'SELECT * FROM health_insurance_proposals WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Proposal not found' });

    const proposal = rows[0];
    if (req.user?.id && String(proposal.user_id) !== String(req.user.id))
      return res.status(403).json({ success: false, message: 'Access denied' });

    if (proposal.status !== 'documents_expired')
      return res.status(400).json({ success: false, message: `Cannot reactivate a proposal with status '${proposal.status}'` });

    const expiredEntry = parseJSON(proposal.status_history, [])
      .slice().reverse()
      .find(h => h.status === 'documents_expired');

    if (expiredEntry) {
      const windowEnd = new Date(new Date(expiredEntry.timestamp).getTime() + REACTIVATION_WINDOW_DAYS * 24 * 60 * 60 * 1000);
      if (new Date() > windowEnd) {
        return res.status(400).json({
          success: false,
          message: 'Reactivation window has closed. Please submit a new proposal.',
          code:    'REACTIVATION_WINDOW_CLOSED',
        });
      }
    }

    const history = parseJSON(proposal.status_history, []);
    history.push({
      status:    'submitted',
      comment:   'Proposal reactivated by customer. New 48-hour document upload window started.',
      updatedBy: req.user?.id || 'customer',
      timestamp: new Date(),
    });

    await conn.query(
      `UPDATE health_insurance_proposals SET status = 'submitted', status_history = ?, submitted_at = NOW(), updated_at = NOW() WHERE id = ?`,
      [JSON.stringify(history), proposal.id]
    );

    res.status(200).json({
      success: true,
      message: 'Proposal reactivated. You have 48 hours to upload your documents.',
      data:    { proposalNumber: proposal.proposal_number, status: 'submitted' },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error reactivating proposal', error: error.message });
  }
};

module.exports = {
  submitProposal,
  getUserProposals,
  getCustomerDashboard,
  getProposalById,
  updateProposalStatus,
  getAllProposals,
  addCommunication,
  expireStaleProposals,
  reactivateProposal,
  uploadDocument,
  deleteDocument,
  submitDocuments,
};
