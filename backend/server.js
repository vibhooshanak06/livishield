const app = require('./src/app');
const connectMongoDB = require('./src/config/mongodb');
const { connectMySQL } = require('./src/config/mysql');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to databases
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    logger.info('MongoDB connected successfully');

    // Try to connect to MySQL (optional for development)
    try {
      await connectMySQL();
      logger.info('MySQL connected successfully');
    } catch (mysqlError) {
      logger.warn('MySQL connection failed, continuing without MySQL:', mysqlError.message);
      logger.warn('Some features requiring MySQL will not work');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 LiviShield Backend running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();