'use strict';
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const path        = require('path');
require('dotenv').config();

const { globalErrorHandler } = require('./middleware/errorHandler');

// ── Module routes (feature-based architecture) ────────────────
const authRoutes           = require('./modules/auth');
const healthInsuranceRoutes = require('./modules/health-insurance');
const proposalRoutes       = require('./modules/proposal');
const adminRoutes          = require('./modules/admin');

const app = express();

// ── Security ──────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS || 'https://yourdomain.com').split(',')
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  exposedHeaders: ['Authorization', 'Content-Type'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max:      process.env.RATE_LIMIT_MAX || 100,
  message:  'Too many requests from this IP, please try again later.',
}));

// ── Parsing & compression ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ── Static uploads ────────────────────────────────────────────
app.use('/uploads', express.static(
  path.join(__dirname, '..', process.env.UPLOAD_PATH || 'uploads')
));

// ── Health checks ─────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() })
);

app.get('/health/db', async (_req, res) => {
  try {
    const { getConnection } = require('./config/mysql');
    const conn = getConnection();
    await conn.execute('SELECT 1');
    const [tables] = await conn.execute("SHOW TABLES LIKE 'users'");
    res.json({ status: 'OK', mysql: 'Connected', usersTable: tables.length ? 'Exists' : 'Missing', timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ status: 'Error', mysql: 'Failed', error: e.message, timestamp: new Date().toISOString() });
  }
});

// ── API routes ────────────────────────────────────────────────
app.use('/api/auth',             authRoutes);
app.use('/api/health-insurance', healthInsuranceRoutes);
app.use('/api/proposals',        proposalRoutes);
app.use('/api/admin',            adminRoutes);

// ── 404 ───────────────────────────────────────────────────────
app.use('*', (_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

// ── Global error handler ──────────────────────────────────────
app.use(globalErrorHandler);

module.exports = app;
