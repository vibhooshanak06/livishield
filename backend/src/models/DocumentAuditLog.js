/**
 * DocumentAuditLog — MongoDB collection
 * ─────────────────────────────────────────────────────────────
 * PURPOSE: Immutable, append-only audit trail for every document
 * event in the insurance underwriting lifecycle.
 *
 * WHY MONGODB (not MySQL):
 *  • Each event has a different shape (upload vs verify vs reject vs
 *    re-upload) — no fixed schema needed.
 *  • Append-only log — never updated, only inserted. Mongo handles
 *    high-write, time-series style logs extremely well.
 *  • Compliance requirement: regulators (IRDAI) require a full
 *    tamper-evident audit trail of every document action. Storing
 *    this separately from the mutable MySQL state ensures the audit
 *    record cannot be accidentally overwritten.
 *  • Rich querying: "show all docs rejected by admin X this week"
 *    across thousands of proposals is a simple Mongo aggregation.
 *
 * WHY NOT MYSQL for this:
 *  • Schema changes every time we add a new event type — ALTER TABLE
 *    on a high-volume audit table is expensive.
 *  • JSON columns in MySQL work, but complex nested audit data
 *    (metadata diff, previous vs new state) is clunky to query.
 *
 * RELATIONSHIP TO MYSQL:
 *  • proposalId + docType = foreign key back to MySQL row
 *  • MySQL required_documents JSON = CURRENT STATE (is it uploaded? verified?)
 *  • This collection = HISTORY (every event that led to current state)
 */

const mongoose = require('mongoose');

const documentAuditLogSchema = new mongoose.Schema({
  // References back to MySQL
  proposalId:     { type: String, required: true, index: true },
  proposalNumber: { type: String, required: true },
  userId:         { type: String, required: true },

  docType: {
    type: String,
    enum: ['identity_proof','address_proof','age_proof','income_proof',
           'medical_reports','previous_policy','passport_photo','other'],
    required: true,
  },
  docName: { type: String, required: true }, // human-readable label

  // The event type
  event: {
    type: String,
    enum: [
      'uploaded',        // customer uploaded a file
      're_uploaded',     // customer replaced a previously uploaded file
      'deleted',         // customer deleted the file before submission
      'submitted',       // customer clicked "Submit All Documents"
      'verified',        // admin verified the document
      'rejected',        // admin rejected the document
      'reset',           // admin requested re-upload (clears the doc)
    ],
    required: true,
    index: true,
  },

  // Who performed the action
  actorId:   { type: String, required: true },  // userId or adminId
  actorRole: { type: String, enum: ['customer','admin','system'], required: true },

  // File details (present on upload/re_upload events)
  fileDetails: {
    fileName:   String,
    storedName: String,
    filePath:   String,
    fileSize:   Number,  // bytes
    mimeType:   String,
  },

  // Previous state snapshot (present on re_upload/deleted/reset)
  previousState: {
    fileName:           String,
    filePath:           String,
    verificationStatus: String,
  },

  // Admin notes (present on verified/rejected/reset events)
  comment: String,
  rejectionReason: String,

  // Immutable timestamp — do NOT use Date.now() so it survives clock skew
  timestamp: { type: Date, default: Date.now, immutable: true, index: true },

}, {
  // Never update documents — only insert new ones
  timestamps: false,
  // TTL: optionally expire after 7 years for compliance
  // (IRDAI requires 5 years minimum for insurance records)
});

// Compound index: fast lookup of all events for a proposal
documentAuditLogSchema.index({ proposalId: 1, timestamp: -1 });

// Compound index: all events for a specific doc on a proposal
documentAuditLogSchema.index({ proposalId: 1, docType: 1, timestamp: -1 });

// Audit queries: "all rejections by admin X"
documentAuditLogSchema.index({ actorId: 1, event: 1, timestamp: -1 });

module.exports = mongoose.model('DocumentAuditLog', documentAuditLogSchema);
