const { getConnection } = require('../config/mysql');
const { hashPassword, comparePassword, generateToken, successResponse, errorResponse } = require('../utils/helpers');
const { catchAsync } = require('../middleware/errorHandler');

// Register new user
const register = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, phone, dateOfBirth, address } = req.body;

  const connection = getConnection();

  // Check if user already exists
  const [existingUsers] = await connection.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUsers.length > 0) {
    return errorResponse(res, 'User with this email already exists', 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Insert new user
  const [result] = await connection.execute(
    `INSERT INTO users (email, password, first_name, last_name, phone, date_of_birth, address, is_verified) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [email, hashedPassword, firstName, lastName, phone || null, dateOfBirth || null, address || null, true]
  );

  // Get the created user (without password)
  const [newUser] = await connection.execute(
    'SELECT id, email, first_name, last_name, phone, date_of_birth, address, role, is_verified, created_at FROM users WHERE id = ?',
    [result.insertId]
  );

  const user = newUser[0];

  // Don't generate token for registration - user will login separately
  // This provides better security and clearer user flow

  return successResponse(res, {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      dateOfBirth: user.date_of_birth,
      address: user.address,
      role: user.role,
      isVerified: user.is_verified
    }
  }, 'User registered successfully. Please login to continue.', 201);
});

// Login user
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const connection = getConnection();

  // Find user by email
  const [users] = await connection.execute(
    'SELECT id, email, password, first_name, last_name, phone, date_of_birth, address, role, is_verified FROM users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  const user = users[0];

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  // Check if user is verified
  if (!user.is_verified) {
    return errorResponse(res, 'Please verify your email address', 401);
  }

  // Generate JWT token
  const token = generateToken({ userId: user.id, email: user.email });

  // Set token in response header
  res.setHeader('Authorization', `Bearer ${token}`);

  return successResponse(res, {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      dateOfBirth: user.date_of_birth,
      address: user.address,
      role: user.role,
      isVerified: user.is_verified
    }
  }, 'Login successful');
});

// Logout user
const logout = catchAsync(async (req, res) => {
  // Since we're using JWT tokens, logout is handled on the client side
  // We could implement token blacklisting here if needed
  
  return successResponse(res, null, 'Logged out successfully');
});

// Get current user
const getCurrentUser = catchAsync(async (req, res) => {
  const connection = getConnection();

  // Get user details (user is already attached by auth middleware)
  const [users] = await connection.execute(
    'SELECT id, email, first_name, last_name, phone, date_of_birth, address, role, is_verified, created_at FROM users WHERE id = ?',
    [req.user.id]
  );

  if (users.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const user = users[0];

  return successResponse(res, {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    dateOfBirth: user.date_of_birth,
    address: user.address,
    role: user.role,
    isVerified: user.is_verified,
    createdAt: user.created_at
  }, 'User details retrieved successfully');
});

// Update profile
const updateProfile = catchAsync(async (req, res) => {
  const { firstName, lastName, phone, dateOfBirth, address } = req.body;
  const connection = getConnection();

  if (!firstName || !lastName) {
    return errorResponse(res, 'First name and last name are required', 400);
  }

  await connection.execute(
    `UPDATE users SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, address = ?
     WHERE id = ?`,
    [firstName, lastName, phone || null, dateOfBirth || null, address || null, req.user.id]
  );

  const [users] = await connection.execute(
    'SELECT id, email, first_name, last_name, phone, date_of_birth, address, role, is_verified, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  const u = users[0];

  return successResponse(res, {
    id: u.id, email: u.email,
    firstName: u.first_name, lastName: u.last_name,
    phone: u.phone, dateOfBirth: u.date_of_birth,
    address: u.address, role: u.role,
    isVerified: u.is_verified, createdAt: u.created_at,
  }, 'Profile updated successfully');
});

// Change password
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return errorResponse(res, 'Current password and new password are required', 400);
  }
  if (newPassword.length < 8) {
    return errorResponse(res, 'New password must be at least 8 characters', 400);
  }

  const connection = getConnection();
  const [users] = await connection.execute(
    'SELECT id, password FROM users WHERE id = ?', [req.user.id]
  );
  if (!users.length) return errorResponse(res, 'User not found', 404);

  const valid = await comparePassword(currentPassword, users[0].password);
  if (!valid) return errorResponse(res, 'Current password is incorrect', 401);

  const hashed = await hashPassword(newPassword);
  await connection.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

  return successResponse(res, null, 'Password changed successfully');
});

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
};