require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const wishlistRoutes = require('./routes/wishlistRoutes');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// Database connection
connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/wishlist', wishlistRoutes);

// Home endpoint
app.get('/', (req, res) => {
    res.send('Wishlist API Running');
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`, err.stack);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal Server Error' 
            : err.message
    });
});

const PORT = process.env.PORT || 5000;

// Server instance
let server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}, starting graceful shutdown...`);
    
    server.close(() => {
        logger.info('HTTP server closed');
        
        // Close database connection
        const mongoose = require('mongoose');
        mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed');
            process.exit(0);
        });
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
        logger.error('Forced shutdown after 10s timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
