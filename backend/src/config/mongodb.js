const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/livishield_docs';
    
    await mongoose.connect(mongoURI);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      // MongoDB connection error
    });

    mongoose.connection.on('disconnected', () => {
      // MongoDB disconnected
    });

    return mongoose.connection;
  } catch (error) {
    throw error;
  }
};

module.exports = connectMongoDB;