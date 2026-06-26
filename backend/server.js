/**
 * LiviShield Backend — Entry Point
 * ─────────────────────────────────────────────
 * Database architecture:
 *
 *  MySQL (PRIMARY — ACID, relational)
 *  ├── users              — auth, profiles
 *  ├── health_insurance_plans
 *  └── health_insurance_proposals
 *      └── required_documents (JSON column)
 *          └── current state: uploaded?, verified?, filePath
 *
 *  MongoDB (SECONDARY — append-only audit log)
 *  └── documentauditlogs  — every upload/verify/reject event
 *      (immutable, compliance audit trail, rich querying)
 *
 *  Disk  (file bytes)
 *  └── uploads/proposals/<proposalId>/<docType>_<ts>.<ext>
 *
 *  Startup strategy:
 *  • MySQL failure → hard stop (can't serve any request)
 *  • MongoDB failure → soft warn, continue (audit log is
 *    best-effort; core functionality still works)
 */

require('dotenv').config();
const app             = require('./src/app');
const connectMongoDB  = require('./src/config/mongodb');
const { connectMySQL }= require('./src/config/mysql');
const logger          = require('./src/utils/logger');
const { expireStaleProposals } = require('./src/modules/proposal/services/proposal.service');

const PORT = process.env.PORT || 5001;
const EXPIRY_JOB_INTERVAL_MS = 60 * 60 * 1000; // hourly

const startServer = async () => {
  // ── MySQL: mandatory ──
  try {
    await connectMySQL();
    logger.info('✓ MySQL connected (primary database)');
  } catch (err) {
    logger.error('✗ MySQL connection failed — cannot start: ' + err.message);
    process.exit(1);
  }

  // ── MongoDB: optional (audit log) ──
  try {
    await connectMongoDB();
    logger.info('✓ MongoDB connected (audit log database)');
  } catch (err) {
    logger.warn('⚠ MongoDB unavailable — audit logging disabled: ' + err.message);
    // Set a global flag so controllers know to skip MongoDB writes gracefully
    global.mongoAvailable = false;
  }

  // ── HTTP server ──
  const server = app.listen(PORT, () => {
    logger.info(`✓ LiviShield backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  // ── Proposal expiry cron ──
  expireStaleProposals().catch(err => logger.error('Initial expiry job failed: ' + err.message));
  setInterval(() => {
    expireStaleProposals().catch(err => logger.error('Expiry job failed: ' + err.message));
  }, EXPIRY_JOB_INTERVAL_MS);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use. Kill the existing process and retry.`);
    } else {
      logger.error('Server error: ' + err.message);
    }
    process.exit(1);
  });

  // ── Graceful shutdown ──
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
};

startServer();
