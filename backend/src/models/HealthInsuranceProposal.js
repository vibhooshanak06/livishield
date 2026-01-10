const mongoose = require('mongoose');

const healthInsuranceProposalSchema = new mongoose.Schema({
  proposalNumber: {
    type: String,
    unique: true
    // Removed required: true to let the pre-save middleware handle it
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthInsurancePlan',
    required: true
  },
  userId: {
    type: String, // Will be linked to MySQL user ID
    required: true
  },
  
  // Personal Information
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    }
  },
  
  // Family Members (for family plans)
  familyMembers: [{
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true }
  }],
  
  // Medical Information
  medicalInfo: {
    preExistingConditions: [String],
    currentMedications: String,
    previousInsurance: Boolean,
    previousInsuranceDetails: String,
    preferredHospitals: String,
    additionalRequirements: String
  },
  
  // Selected Add-ons
  selectedAddOns: [{
    name: String,
    description: String,
    premium: Number
  }],
  
  // Premium Calculation
  premiumDetails: {
    basePremium: { type: Number, required: true },
    addOnPremium: { type: Number, default: 0 },
    familyPremium: { type: Number, default: 0 },
    totalAnnualPremium: { type: Number, required: true },
    totalMonthlyPremium: { type: Number, required: true }
  },
  
  // Application Status
  status: {
    type: String,
    enum: [
      'submitted',
      'under_review',
      'documents_required',
      'medical_checkup_required',
      'approved',
      'rejected',
      'policy_issued',
      'cancelled'
    ],
    default: 'submitted'
  },
  
  // Status History
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    comment: String,
    updatedBy: String
  }],
  
  // Required Documents
  requiredDocuments: [{
    type: {
      type: String,
      enum: [
        'identity_proof',
        'address_proof',
        'age_proof',
        'income_proof',
        'medical_reports',
        'previous_policy',
        'passport_photo',
        'other'
      ]
    },
    name: String,
    required: { type: Boolean, default: true },
    uploaded: { type: Boolean, default: false },
    uploadedAt: Date,
    filePath: String,
    fileSize: Number,
    mimeType: String
  }],
  
  // Medical Checkup
  medicalCheckup: {
    required: { type: Boolean, default: false },
    scheduled: { type: Boolean, default: false },
    scheduledDate: Date,
    completed: { type: Boolean, default: false },
    completedDate: Date,
    reportPath: String,
    remarks: String
  },
  
  // Agent Assignment
  assignedAgent: {
    agentId: String,
    agentName: String,
    agentEmail: String,
    agentPhone: String,
    assignedAt: Date
  },
  
  // Communication Log
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call', 'meeting', 'system']
    },
    subject: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    sentBy: String,
    sentTo: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    }
  }],
  
  // Payment Information
  paymentInfo: {
    paymentMode: {
      type: String,
      enum: ['annual', 'semi_annual', 'quarterly', 'monthly']
    },
    firstPremiumPaid: { type: Boolean, default: false },
    firstPremiumAmount: Number,
    firstPremiumDate: Date,
    paymentMethod: String,
    transactionId: String
  },
  
  // Policy Details (after approval)
  policyDetails: {
    policyNumber: String,
    policyStartDate: Date,
    policyEndDate: Date,
    policyDocumentPath: String,
    issuedAt: Date
  },
  
  // Rejection Details
  rejectionDetails: {
    reason: String,
    detailedReason: String,
    rejectedAt: Date,
    rejectedBy: String
  },
  
  // Internal Notes
  internalNotes: [{
    note: String,
    addedBy: String,
    addedAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: true }
  }],
  
  // Timestamps
  submittedAt: { type: Date, default: Date.now },
  lastUpdatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Generate unique proposal number
healthInsuranceProposalSchema.pre('save', async function(next) {
  if (this.isNew && !this.proposalNumber) {
    try {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      
      // Get the latest proposal number for this month to ensure uniqueness
      const latestProposal = await this.constructor.findOne({
        proposalNumber: new RegExp(`^HI${year}${month}`)
      }).sort({ proposalNumber: -1 });
      
      let nextNumber = 1;
      if (latestProposal && latestProposal.proposalNumber) {
        const lastNumber = parseInt(latestProposal.proposalNumber.slice(-4));
        nextNumber = lastNumber + 1;
      }
      
      this.proposalNumber = `HI${year}${month}${String(nextNumber).padStart(4, '0')}`;
      
      console.log('Generated proposal number:', this.proposalNumber);
    } catch (error) {
      console.error('Error generating proposal number:', error);
      // Fallback to timestamp-based number if count fails
      const timestamp = Date.now().toString().slice(-6);
      this.proposalNumber = `HI${new Date().getFullYear()}${timestamp}`;
      console.log('Fallback proposal number:', this.proposalNumber);
    }
  }
  
  this.lastUpdatedAt = new Date();
  next();
});

// Index for better query performance
healthInsuranceProposalSchema.index({ userId: 1, status: 1 });
healthInsuranceProposalSchema.index({ 'assignedAgent.agentId': 1 });
healthInsuranceProposalSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('HealthInsuranceProposal', healthInsuranceProposalSchema);