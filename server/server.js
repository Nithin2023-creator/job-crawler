require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const scheduler = require('./utils/scheduler');

// Import routes
const configRoutes = require('./routes/config');
const huntRoutes = require('./routes/hunt');
const jobsRoutes = require('./routes/jobs');
const companiesRoutes = require('./routes/companies');
const settingsRoutes = require('./routes/settings');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS - Allow frontend to connect
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '🌙 Night Crawler API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/config', configRoutes);
app.use('/api/hunt', huntRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Initialize scheduler
        await scheduler.init();

        // Start Express server
        app.listen(PORT, () => {
            console.log('\n============================================');
            console.log('🌙 NIGHT CRAWLER SERVER STARTED');
            console.log('============================================');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🔗 API URL: http://localhost:${PORT}/api`);
            console.log(`📊 Health: http://localhost:${PORT}/api/health`);
            console.log('============================================');
            console.log('📅 Scheduled crawl times: 2:00 AM, 4:00 AM, 6:00 AM');
            console.log('============================================\n');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    scheduler.stop();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    scheduler.stop();
    process.exit(0);
});

// Start the server
startServer();
