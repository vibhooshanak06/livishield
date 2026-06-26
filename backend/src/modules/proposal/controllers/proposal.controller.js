'use strict';
/**
 * proposal.controller.js — HTTP layer only, no SQL, no business logic.
 */
const service = require('../services/proposal.service');
const { upload } = require('../../../middleware/upload');

const submitProposal = async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const data   = await service.submitProposal({ ...req.body, userId });
    res.status(201).json({ success: true, message: 'Proposal submitted successfully', data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getUserProposals = async (req, res) => {
  try {
    const data = await service.getUserProposals(req.params.userId || req.user?.id, req.query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || req.query.userId;
    const data   = await service.getCustomerDashboard(userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getProposalById = async (req, res) => {
  try {
    const data = await service.getProposalById(req.params.id, req.user);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const updateProposalStatus = async (req, res) => {
  try {
    const updatedBy = req.user?.id || 'system';
    const data = await service.updateStatus(req.params.id, { ...req.body, updatedBy });
    res.status(200).json({ success: true, message: 'Proposal status updated successfully', data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getAllProposals = async (req, res) => {
  try {
    const data = await service.getAllProposals(req.query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const addCommunication = async (req, res) => {
  try {
    const sentBy = req.user?.id || 'system';
    await service.addCommunication(req.params.id, { ...req.body, sentBy });
    res.status(200).json({ success: true, message: 'Communication logged successfully' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const { docType } = req.body;
    if (!docType) { require('fs').unlink(req.file.path, () => {}); return res.status(400).json({ success: false, message: 'docType is required.' }); }
    const data = await service.uploadDocument(req.params.id, { docType, file: req.file, requestingUserId: req.user?.id });
    res.status(200).json({ success: true, message: 'Document uploaded successfully.', data });
  } catch (err) {
    if (req.file?.path) try { require('fs').unlinkSync(req.file.path); } catch {}
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    await service.deleteDocument(req.params.id, req.params.docType, req.user?.id);
    res.status(200).json({ success: true, message: 'Document removed successfully.' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const submitDocuments = async (req, res) => {
  try {
    const data = await service.submitDocuments(req.params.id, req.user?.id);
    res.status(200).json({ success: true, message: 'Documents submitted for review. Your proposal is now under review.', data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message, ...(err.data && { data: err.data }) });
  }
};

const reactivateProposal = async (req, res) => {
  try {
    const data = await service.reactivateProposal(req.params.id, req.user?.id);
    res.status(200).json({ success: true, message: 'Proposal reactivated. You have 48 hours to upload your documents.', data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message, ...(err.code && { code: err.code }) });
  }
};

module.exports = {
  submitProposal, getUserProposals, getCustomerDashboard, getProposalById,
  updateProposalStatus, getAllProposals, addCommunication,
  uploadDocument, deleteDocument, submitDocuments, reactivateProposal,
};
