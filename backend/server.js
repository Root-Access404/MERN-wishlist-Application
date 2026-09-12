require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const wishlistRoutes = require('./routes/wishlistRoutes');
const logger = require('./utils/logger');

const app = express();

// Middleware
// CORS: Lock down to FRONTEND_URL in production (set via environment variable)
// For local dev, allow all origins — tighten in Phase 6 when CloudFront is deployed
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
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

// ─── Health check endpoint ───────────────────────────────────────────────────
// CRITICAL: This exact path is configured in the ALB Target Group (Phase 4)
// Must return HTTP 200 within 5 seconds
// Must NOT require database connectivity — if DB is down, ALB should still
// be able to route to the instance for other checks
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

// ─── Server startup ─────────────────────────────────────────────────────────
// Bind to 0.0.0.0 so ALB in EC2 VPC can reach the app on the internal IP
// (localhost only would make it unreachable from the ALB)
let server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    logger.info(`Health check: http://0.0.0.0:${PORT}/health`);
});

// ─── Graceful shutdown ──────────────────────────────────────────────────────
// WHAT:  Catches SIGTERM (sent by ALB/ASG when terminating an instance)
// WHY:   Without this, in-flight requests are dropped mid-response
//        With this, the server stops accepting new connections but finishes
//        existing ones before exiting — users never see a broken response
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
    
    // Force shutdown after 10 seconds if graceful shutdown hangs
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
