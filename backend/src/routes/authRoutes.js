const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validate, userSchemas } = require('../utils/validation');
const authController = require('../controllers/authController');

const router = express.Router();

// Routes
router.post('/register', validate(userSchemas.register), authController.register);
router.post('/login', validate(userSchemas.login), authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;