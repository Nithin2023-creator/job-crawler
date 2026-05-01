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
// CORS - Allow frontend to connect
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://job-crawler-8zem.vercel.app',
     // Your deployment
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('❌ Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
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

// Root Route
app.get('/', (req, res) => {
    res.send('🌙 Night Crawler Server is Running! 🚀');
});

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

            // Render Keep-Alive Ping (Self-ping every 14 minutes)
            const SELF_URL = process.env.RENDER_EXTERNAL_URL;
            if (SELF_URL) {
                console.log(`💓 Keep-alive: Pinging ${SELF_URL} every 14 mins`);
                setInterval(async () => {
                    try {
                        const response = await fetch(`${SELF_URL}/api/health`);
                        if (response.ok) {
                            console.log('💓 Keep-alive: Ping successful');
                        }
                    } catch (err) {
                        console.error('💓 Keep-alive: Ping failed', err.message);
                    }
                }, 14 * 60 * 1000); 
            }
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
