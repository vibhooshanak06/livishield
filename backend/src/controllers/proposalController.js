const HealthInsuranceProposal = require('../models/HealthInsuranceProposal');
const HealthInsurancePlan = require('../models/HealthInsurancePlan');
const { validationResult } = require('express-validator');

// Submit a new proposal
const submitProposal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { planId, personalInfo, familyMembers, medicalInfo, selectedAddOns, premiumDetails } = req.body;
    const userId = req.user?.id || 'guest'; // Get from auth middleware

    // Verify plan exists
    const plan = await HealthInsurancePlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Health insurance plan not found'
      });
    }

    // Generate proposal number manually as backup
    const generateProposalNumber = async () => {
      try {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        
        // Get the latest proposal number for this month to ensure uniqueness
        const latestProposal = await HealthInsuranceProposal.findOne({
          proposalNumber: new RegExp(`^HI${year}${month}`)
        }).sort({ proposalNumber: -1 });
        
        let nextNumber = 1;
        if (latestProposal && latestProposal.proposalNumber) {
          const lastNumber = parseInt(latestProposal.proposalNumber.slice(-4));
          nextNumber = lastNumber + 1;
        }
        
        return `HI${year}${month}${String(nextNumber).padStart(4, '0')}`;
      } catch (error) {
        console.error('Error generating proposal number:', error);
        // Fallback to timestamp-based number
        const timestamp = Date.now().toString().slice(-6);
        return `HI${new Date().getFullYear()}${timestamp}`;
      }
    };

    // Create proposal with generated proposal number
    const proposalNumber = await generateProposalNumber();
    
    const proposal = new HealthInsuranceProposal({
      proposalNumber,
      planId,
      userId,
      personalInfo,
      familyMembers: familyMembers || [],
      medicalInfo,
      selectedAddOns: selectedAddOns || [],
      premiumDetails,
      statusHistory: [{
        status: 'submitted',
        comment: 'Proposal submitted by customer',
        updatedBy: userId
      }]
    });

    // Add required documents based on plan type and conditions
    proposal.requiredDocuments = generateRequiredDocuments(personalInfo, medicalInfo, plan);

    console.log('Saving proposal with number:', proposal.proposalNumber);
    await proposal.save();
    console.log('Proposal saved successfully:', proposal.proposalNumber);

    // Send confirmation email (implement email service)
    // await sendProposalConfirmationEmail(proposal);

    res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully',
      data: {
        proposalNumber: proposal.proposalNumber,
        proposalId: proposal._id,
        status: proposal.status,
        requiredDocuments: proposal.requiredDocuments
      }
    });
  } catch (error) {
    console.error('Error submitting proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting proposal',
      error: error.message
    });
  }
};

// Get user's proposals
const getUserProposals = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const proposals = await HealthInsuranceProposal.find(filter)
      .populate('planId', 'name provider type sumInsured')
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await HealthInsuranceProposal.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        proposals,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProposals: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user proposals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching proposals',
      error: error.message
    });
  }
};

// Get customer dashboard data
const getCustomerDashboard = async (req, res) => {
  try {
    console.log('Dashboard endpoint called with params:', req.params);
    console.log('Dashboard endpoint called with query:', req.query);
    
    const userId = req.params.userId || req.user?.id || req.query.userId;
    
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log('Fetching proposals for userId:', userId);

    // Get all proposals for the user
    const proposals = await HealthInsuranceProposal.find({ userId })
      .populate('planId', 'name provider type sumInsured')
      .sort({ submittedAt: -1 })
      .lean();

    console.log(`Found ${proposals.length} proposals for user ${userId}`);

    // Calculate statistics
    const stats = {
      totalProposals: proposals.length,
      activeProposals: proposals.filter(p => !['approved', 'rejected', 'cancelled'].includes(p.status)).length,
      approvedPolicies: proposals.filter(p => p.status === 'approved' || p.policyDetails?.policyNumber).length,
      pendingDocuments: proposals.filter(p => p.status === 'documents_required').length
    };

    console.log('Calculated stats:', stats);

    // Format proposals for frontend
    const formattedProposals = proposals.map(proposal => ({
      _id: proposal._id,
      proposalNumber: proposal.proposalNumber,
      planId: {
        name: proposal.planId?.name || 'Unknown Plan',
        provider: proposal.planId?.provider || 'Unknown Provider',
        type: proposal.planId?.type || 'Unknown Type'
      },
      status: proposal.status,
      submittedAt: proposal.submittedAt,
      premiumDetails: proposal.premiumDetails,
      requiredDocuments: proposal.requiredDocuments || [],
      policyDetails: proposal.policyDetails || null,
      statusHistory: proposal.statusHistory || []
    }));

    console.log('Sending response with formatted proposals');

    res.status(200).json({
      success: true,
      data: {
        proposals: formattedProposals,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching customer dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Get proposal by ID
const getProposalById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const proposal = await HealthInsuranceProposal.findById(id)
      .populate('planId')
      .lean();

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    // Check if user owns this proposal (skip for admin users)
    if (userId && proposal.userId !== userId && !req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching proposal',
      error: error.message
    });
  }
};

// Update proposal status (Admin only)
const updateProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, assignedAgent, rejectionDetails } = req.body;
    const updatedBy = req.user?.id || 'system';

    const proposal = await HealthInsuranceProposal.findById(id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    // Update status
    proposal.status = status;
    
    // Add to status history
    proposal.statusHistory.push({
      status,
      comment,
      updatedBy
    });

    // Handle specific status updates
    if (status === 'approved') {
      // Generate policy details
      proposal.policyDetails = {
        policyStartDate: new Date(),
        policyEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      };
    } else if (status === 'rejected' && rejectionDetails) {
      proposal.rejectionDetails = {
        ...rejectionDetails,
        rejectedAt: new Date(),
        rejectedBy: updatedBy
      };
    }

    // Assign agent if provided
    if (assignedAgent) {
      proposal.assignedAgent = {
        ...assignedAgent,
        assignedAt: new Date()
      };
    }

    await proposal.save();

    // Send notification email to customer
    // await sendStatusUpdateEmail(proposal);

    res.status(200).json({
      success: true,
      message: 'Proposal status updated successfully',
      data: {
        proposalNumber: proposal.proposalNumber,
        status: proposal.status
      }
    });
  } catch (error) {
    console.error('Error updating proposal status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating proposal status',
      error: error.message
    });
  }
};

// Get all proposals (Admin only)
const getAllProposals = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      agentId, 
      dateFrom, 
      dateTo,
      search 
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (agentId) filter['assignedAgent.agentId'] = agentId;
    if (dateFrom || dateTo) {
      filter.submittedAt = {};
      if (dateFrom) filter.submittedAt.$gte = new Date(dateFrom);
      if (dateTo) filter.submittedAt.$lte = new Date(dateTo);
    }
    if (search) {
      filter.$or = [
        { proposalNumber: new RegExp(search, 'i') },
        { 'personalInfo.firstName': new RegExp(search, 'i') },
        { 'personalInfo.lastName': new RegExp(search, 'i') },
        { 'personalInfo.email': new RegExp(search, 'i') }
      ];
    }

    const proposals = await HealthInsuranceProposal.find(filter)
      .populate('planId', 'name provider type')
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await HealthInsuranceProposal.countDocuments(filter);

    // Get status statistics
    const statusStats = await HealthInsuranceProposal.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        proposals,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProposals: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        statistics: {
          statusBreakdown: statusStats,
          totalProposals: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all proposals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching proposals',
      error: error.message
    });
  }
};

// Add communication log
const addCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, subject, message, sentTo } = req.body;
    const sentBy = req.user?.id || 'system';

    const proposal = await HealthInsuranceProposal.findById(id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    proposal.communications.push({
      type,
      subject,
      message,
      sentBy,
      sentTo
    });

    await proposal.save();

    res.status(200).json({
      success: true,
      message: 'Communication logged successfully'
    });
  } catch (error) {
    console.error('Error adding communication:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding communication',
      error: error.message
    });
  }
};

// Helper function to generate required documents
const generateRequiredDocuments = (personalInfo, medicalInfo, plan) => {
  const documents = [
    { type: 'identity_proof', name: 'Identity Proof (Aadhar/PAN/Passport)', required: true },
    { type: 'address_proof', name: 'Address Proof', required: true },
    { type: 'age_proof', name: 'Age Proof (Birth Certificate/10th Certificate)', required: true },
    { type: 'passport_photo', name: 'Passport Size Photograph', required: true }
  ];

  // Add income proof for high sum insured
  if (plan.sumInsured > 500000) {
    documents.push({
      type: 'income_proof',
      name: 'Income Proof (Salary Slip/ITR)',
      required: true
    });
  }

  // Add medical reports if pre-existing conditions
  if (medicalInfo.preExistingConditions && medicalInfo.preExistingConditions.length > 0) {
    documents.push({
      type: 'medical_reports',
      name: 'Medical Reports for Pre-existing Conditions',
      required: true
    });
  }

  // Add previous policy if mentioned
  if (medicalInfo.previousInsurance) {
    documents.push({
      type: 'previous_policy',
      name: 'Previous Health Insurance Policy Copy',
      required: true
    });
  }

  return documents;
};

module.exports = {
  submitProposal,
  getUserProposals,
  getCustomerDashboard,
  getProposalById,
  updateProposalStatus,
  getAllProposals,
  addCommunication
};