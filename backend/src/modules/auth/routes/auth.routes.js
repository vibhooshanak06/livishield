'use strict';
const express = require('express');
const { authenticate }       = require('../../../middleware/auth');
const { validate, userSchemas } = require('../../../utils/validation');
const ctrl = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register',         validate(userSchemas.register), ctrl.register);
router.post('/login',            validate(userSchemas.login),    ctrl.login);
router.post('/logout',           authenticate,                   ctrl.logout);
router.get('/me',                authenticate,                   ctrl.getCurrentUser);
router.put('/profile',           authenticate,                   ctrl.updateProfile);
router.put('/change-password',   authenticate,                   ctrl.changePassword);

module.exports = router;
