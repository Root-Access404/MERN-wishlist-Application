require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const wishlistRoutes = require('./routes/wishlistRoutes');
const logger = require('./utils/logger');

const app = express();

// Comma-separated origins are supported for local and deployed frontends.
// In production, FRONTEND_URL must be set to the CloudFront frontend origin.
const configuredOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = configuredOrigins.length > 0
    ? configuredOrigins
    : ['http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests such as ALB health checks.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ALB health check endpoint. This intentionally does not require MongoDB.
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
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

const PORT = process.env.PORT || 3000;

// Bind to all interfaces so an internet-facing ALB can reach private instances.
const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    logger.info(`Health check: http://0.0.0.0:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    server.close(() => {
        logger.info('HTTP server closed');

        const mongoose = require('mongoose');
        mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed');
            process.exit(0);
        });
    });

    setTimeout(() => {
        logger.error('Forced shutdown after 10s timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
