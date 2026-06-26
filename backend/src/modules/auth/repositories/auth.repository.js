'use strict';
/**
 * auth.repository.js
 * All MySQL queries for the users table.
 */
const { getConnection } = require('../../../config/mysql');

const USER_SAFE_COLS = 'id, email, first_name, last_name, phone, date_of_birth, address, role, is_verified, created_at';

class AuthRepository {
  async findByEmail(email) {
    const conn = getConnection();
    const [rows] = await conn.execute(
      `SELECT id, email, password, first_name, last_name, phone, date_of_birth, address, role, is_verified FROM users WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const conn = getConnection();
    const [rows] = await conn.execute(
      `SELECT ${USER_SAFE_COLS} FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async findPasswordById(id) {
    const conn = getConnection();
    const [rows] = await conn.execute('SELECT id, password FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async existsByEmail(email) {
    const conn = getConnection();
    const [rows] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
    return rows.length > 0;
  }

  async create({ email, hashedPassword, firstName, lastName, phone, dateOfBirth, address }) {
    const conn = getConnection();
    const [result] = await conn.execute(
      `INSERT INTO users (email, password, first_name, last_name, phone, date_of_birth, address, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, firstName, lastName, phone || null, dateOfBirth || null, address || null, true]
    );
    const [rows] = await conn.execute(
      `SELECT ${USER_SAFE_COLS} FROM users WHERE id = ?`,
      [result.insertId]
    );
    return rows[0];
  }

  async updateProfile(id, { firstName, lastName, phone, dateOfBirth, address }) {
    const conn = getConnection();
    await conn.execute(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, address = ? WHERE id = ?`,
      [firstName, lastName, phone || null, dateOfBirth || null, address || null, id]
    );
    return this.findById(id);
  }

  async updatePassword(id, hashedPassword) {
    const conn = getConnection();
    await conn.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
  }
}

module.exports = new AuthRepository();
