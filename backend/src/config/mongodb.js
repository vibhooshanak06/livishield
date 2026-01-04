const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/livishield_docs';
    
    await mongoose.connect(mongoURI);

    logger.info('✅ MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnected');
    });

    return mongoose.connection;
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

module.exports = connectMongoDB;