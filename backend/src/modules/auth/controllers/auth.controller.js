'use strict';
/**
 * auth.controller.js
 * HTTP layer only — parse request, call service, format response.
 */
const service = require('../services/auth.service');
const { successResponse, errorResponse } = require('../../../utils/helpers');
const { catchAsync } = require('../../../middleware/errorHandler');

const register = catchAsync(async (req, res) => {
  const result = await service.register(req.body);
  return successResponse(res, result, 'User registered successfully. Please login to continue.', 201);
});

const login = catchAsync(async (req, res) => {
  const { token, user } = await service.login(req.body);
  res.setHeader('Authorization', `Bearer ${token}`);
  return successResponse(res, { user }, 'Login successful');
});

const logout = catchAsync(async (req, res) => {
  // JWT is stateless — client discards token
  return successResponse(res, null, 'Logged out successfully');
});

const getCurrentUser = catchAsync(async (req, res) => {
  const user = await service.getProfile(req.user.id);
  return successResponse(res, user, 'User details retrieved successfully');
});

const updateProfile = catchAsync(async (req, res) => {
  const user = await service.updateProfile(req.user.id, req.body);
  return successResponse(res, user, 'Profile updated successfully');
});

const changePassword = catchAsync(async (req, res) => {
  await service.changePassword(req.user.id, req.body);
  return successResponse(res, null, 'Password changed successfully');
});

module.exports = { register, login, logout, getCurrentUser, updateProfile, changePassword };
