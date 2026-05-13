const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/livishield_docs';
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    return mongoose.connection;
  } catch (error) {
    throw error;
  }
};

module.exports = connectMongoDB;