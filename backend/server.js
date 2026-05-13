require('dotenv').config();
const app = require('./src/app');
const connectMongoDB = require('./src/config/mongodb');
const { connectMySQL } = require('./src/config/mysql');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectMongoDB();
    logger.info('MongoDB connected');
  } catch (mongoError) {
    logger.warn('MongoDB unavailable: ' + mongoError.message);
  }

  try {
    await connectMySQL();
    logger.info('MySQL connected');
  } catch (mysqlError) {
    logger.warn('MySQL unavailable: ' + mysqlError.message);
  }

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use. Kill the existing process and retry.`);
    } else {
      logger.error('Server error: ' + err.message);
    }
    process.exit(1);
  });
};

startServer();
