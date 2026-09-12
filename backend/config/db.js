const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Validate MONGO_URI
    if (!process.env.MONGO_URI) {
      logger.warn('MONGO_URI environment variable is not set — MongoDB connection will not be established');
      return;
    }

    logger.info('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Connection event handlers
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err.message);
    });
    
  } catch (error) {
    // Log the error but do NOT exit
    // The /health endpoint will return 200 so ALB keeps the instance running
    // API routes that need DB will return 503 individually
    logger.error('Database connection failed:', error.message);
  }
};

module.exports = connectDB;
