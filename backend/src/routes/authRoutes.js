const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validate, userSchemas } = require('../utils/validation');
const { catchAsync } = require('../middleware/errorHandler');
const authController = require('../controllers/authController');

const router = express.Router();

// Routes
router.post('/register', validate(userSchemas.register), authController.register);
router.post('/login', validate(userSchemas.login), authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;