const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT utilities
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Password utilities
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate random strings
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Policy number generation
const generatePolicyNumber = (planType = 'GEN') => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `${planType}${year}${month}${random}`;
};

// Transaction ID generation
const generateTransactionId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `TXN${timestamp}${random}`;
};

// Date utilities
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    default:
      return d.toISOString().split('T')[0];
  }
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const addYears = (date, years) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

// Calculate age
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Currency formatting
const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Pagination utilities
const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext,
    hasPrev
  };
};

// Response utilities
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim(); // Remove leading/trailing whitespace
};

// Generate file name
const generateFileName = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const extension = originalName.split('.').pop();
  const name = originalName.split('.').slice(0, -1).join('.');
  const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${prefix}${sanitizedName}_${timestamp}_${random}.${extension}`;
};

// Validate file type
const isValidFileType = (filename, allowedTypes) => {
  const extension = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};

// Convert bytes to human readable format
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Remove sensitive fields from object
const removeSensitiveFields = (obj, fields = ['password', 'token', 'secret']) => {
  const cloned = deepClone(obj);
  
  const removeSensitive = (item) => {
    if (Array.isArray(item)) {
      return item.map(removeSensitive);
    } else if (item && typeof item === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(item)) {
        if (!fields.includes(key.toLowerCase())) {
          cleaned[key] = removeSensitive(value);
        }
      }
      return cleaned;
    }
    return item;
  };
  
  return removeSensitive(cloned);
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateRandomString,
  generateOTP,
  generatePolicyNumber,
  generateTransactionId,
  formatDate,
  addDays,
  addMonths,
  addYears,
  calculateAge,
  formatCurrency,
  getPaginationParams,
  getPaginationMeta,
  successResponse,
  errorResponse,
  sanitizeInput,
  generateFileName,
  isValidFileType,
  formatBytes,
  deepClone,
  removeSensitiveFields
};