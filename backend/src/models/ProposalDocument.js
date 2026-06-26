const mongoose = require('mongoose');

/**
 * ProposalDocument — stores uploaded document metadata in MongoDB.
 * The actual file lives on disk (path stored in MySQL required_documents JSON).
 * MongoDB holds the rich metadata + audit trail.
 */
const proposalDocumentSchema = new mongoose.Schema({
  proposalId:    { type: String, required: true, index: true },
  proposalNumber:{ type: String, required: true },
  userId:        { type: String, required: true },

  docType: {
    type: String,
    enum: ['identity_proof','address_proof','age_proof','income_proof','medical_reports','previous_policy','passport_photo','other'],
    required: true
  },
  docName:    { type: String, required: true },  // human-readable label
  fileName:   { type: String, required: true },  // original filename
  storedName: { type: String, required: true },  // name on disk
  filePath:   { type: String, required: true },  // relative path on server
  fileSize:   { type: Number, required: true },  // bytes
  mimeType:   { type: String, required: true },

  // Verification lifecycle
  status: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  verifiedBy:  String,
  verifiedAt:  Date,

  // Submission lock — set when customer clicks "Submit All Documents"
  submittedForReview:   { type: Boolean, default: false },
  submittedForReviewAt: Date,

  uploadedAt: { type: Date, default: Date.now },
  updatedAt:  { type: Date, default: Date.now }
}, { timestamps: true });

// One document per type per proposal (upsert on re-upload)
proposalDocumentSchema.index({ proposalId: 1, docType: 1 }, { unique: true });

module.exports = mongoose.model('ProposalDocument', proposalDocumentSchema);
