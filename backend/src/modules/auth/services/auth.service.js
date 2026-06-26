'use strict';
/**
 * auth.service.js
 * Business logic — registration, login, profile, password change.
 * No req/res, no direct DB access.
 */
const repo    = require('../repositories/auth.repository');
const helpers = require('../../../utils/helpers');

const mapUser = (u) => ({
  id:          u.id,
  email:       u.email,
  firstName:   u.first_name,
  lastName:    u.last_name,
  phone:       u.phone,
  dateOfBirth: u.date_of_birth,
  address:     u.address,
  role:        u.role,
  isVerified:  !!u.is_verified,
  createdAt:   u.created_at,
});

class AuthService {
  async register({ email, password, firstName, lastName, phone, dateOfBirth, address }) {
    if (await repo.existsByEmail(email)) {
      throw Object.assign(new Error('User with this email already exists'), { statusCode: 400 });
    }
    const hashedPassword = await helpers.hashPassword(password);
    const user = await repo.create({ email, hashedPassword, firstName, lastName, phone, dateOfBirth, address });
    return { user: mapUser(user) };
  }

  async login({ email, password }) {
    const user = await repo.findByEmail(email);
    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }
    const valid = await helpers.comparePassword(password, user.password);
    if (!valid) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }
    if (!user.is_verified) {
      throw Object.assign(new Error('Please verify your email address'), { statusCode: 401 });
    }
    const token = helpers.generateToken({ userId: user.id, email: user.email });
    return { token, user: mapUser(user) };
  }

  async getProfile(id) {
    const user = await repo.findById(id);
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return mapUser(user);
  }

  async updateProfile(id, { firstName, lastName, phone, dateOfBirth, address }) {
    if (!firstName || !lastName) {
      throw Object.assign(new Error('First name and last name are required'), { statusCode: 400 });
    }
    const updated = await repo.updateProfile(id, { firstName, lastName, phone, dateOfBirth, address });
    return mapUser(updated);
  }

  async changePassword(id, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw Object.assign(new Error('Current password and new password are required'), { statusCode: 400 });
    }
    if (newPassword.length < 8) {
      throw Object.assign(new Error('New password must be at least 8 characters'), { statusCode: 400 });
    }
    const row = await repo.findPasswordById(id);
    if (!row) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    const valid = await helpers.comparePassword(currentPassword, row.password);
    if (!valid) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 401 });
    const hashed = await helpers.hashPassword(newPassword);
    await repo.updatePassword(id, hashed);
  }
}

module.exports = new AuthService();
