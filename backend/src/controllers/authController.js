const { getConnection } = require('../config/mysql');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');
const { successResponse, errorResponse } = require('../utils/helpers');
const { catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Register new user
const register = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, phone, dateOfBirth, address } = req.body;

  try {
    logger.info('Registration attempt:', { email, firstName, lastName });
    
    const connection = getConnection();

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      logger.warn('Registration failed - user exists:', email);
      return errorResponse(res, 'User with this email already exists', 400);
    }

    // Hash password
    logger.info('Hashing password for user:', email);
    const hashedPassword = await hashPassword(password);

    // Insert new user
    logger.info('Inserting new user into database:', email);
    const [result] = await connection.execute(
      `INSERT INTO users (email, password, first_name, last_name, phone, date_of_birth, address, is_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, firstName, lastName, phone || null, dateOfBirth || null, address || null, true]
    );

    logger.info('User inserted successfully with ID:', result.insertId);

    // Get the created user (without password)
    const [newUser] = await connection.execute(
      'SELECT id, email, first_name, last_name, phone, date_of_birth, address, role, is_verified, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = newUser[0];

    // Generate JWT token
    logger.info('Generating JWT token for user:', user.id);
    const token = generateToken({ userId: user.id, email: user.email });

    // Set token in response header
    res.setHeader('Authorization', `Bearer ${token}`);

    // Log successful registration
    logger.info(`User registered successfully: ${email} with ID: ${user.id}`);

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
    }, 'User registered successfully', 201);

  } catch (error) {
    logger.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    
    // Handle specific MySQL errors
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 'User with this email already exists', 400);
    }
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return errorResponse(res, 'Database table not found. Please run database setup.', 500);
    }
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      return errorResponse(res, 'Database connection failed', 500);
    }
    
    return errorResponse(res, `Registration failed: ${error.message}`, 500);
  }
});

// Login user
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  try {
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

    // Log successful login
    logger.info(`User logged in successfully: ${email}`);

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

  } catch (error) {
    logger.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
});

// Logout user
const logout = catchAsync(async (req, res) => {
  // Since we're using JWT tokens, logout is handled on the client side
  // We could implement token blacklisting here if needed
  
  logger.info(`User logged out: ${req.user?.email || 'Unknown'}`);
  
  return successResponse(res, null, 'Logged out successfully');
});

// Get current user
const getCurrentUser = catchAsync(async (req, res) => {
  try {
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

  } catch (error) {
    logger.error('Get current user error:', error);
    return errorResponse(res, 'Failed to get user details', 500);
  }
});

// Forgot password (placeholder)
const forgotPassword = catchAsync(async (req, res) => {
  return errorResponse(res, 'Forgot password feature not implemented yet', 501);
});

// Reset password (placeholder)
const resetPassword = catchAsync(async (req, res) => {
  return errorResponse(res, 'Reset password feature not implemented yet', 501);
});

// Verify email (placeholder)
const verifyEmail = catchAsync(async (req, res) => {
  return errorResponse(res, 'Email verification feature not implemented yet', 501);
});

// Refresh token (placeholder)
const refreshToken = catchAsync(async (req, res) => {
  return errorResponse(res, 'Refresh token feature not implemented yet', 501);
});

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken
};