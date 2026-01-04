const { verifyToken } = require('../utils/helpers');
const { getConnection } = require('../config/mysql');
const logger = require('../utils/logger');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = verifyToken(token);
    
    // Get user from database
    const connection = getConnection();
    const [users] = await connection.execute(
      'SELECT id, email, first_name, last_name, role, is_verified FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    const user = users[0];

    // Check if user is verified
    if (!user.is_verified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address'
      });
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isVerified: user.is_verified
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.message === 'Invalid token' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Authorization middleware - check user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    const connection = getConnection();
    const [users] = await connection.execute(
      'SELECT id, email, first_name, last_name, role, is_verified FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length > 0 && users[0].is_verified) {
      const user = users[0];
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: user.is_verified
      };
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Check if user owns resource
const checkOwnership = (resourceIdParam = 'id', userIdField = 'user_id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin can access all resources
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[resourceIdParam];
      
      // This is a generic ownership check - specific implementations
      // should be done in individual route handlers
      req.checkOwnership = {
        userId: req.user.id,
        resourceId,
        userIdField
      };

      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (userRequests.has(userId)) {
      const requests = userRequests.get(userId).filter(time => time > windowStart);
      userRequests.set(userId, requests);
    } else {
      userRequests.set(userId, []);
    }

    const requests = userRequests.get(userId);

    if (requests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    requests.push(now);
    userRequests.set(userId, requests);

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  checkOwnership,
  userRateLimit
};