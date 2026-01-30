const express = require('express');
const router = express.Router();
const CrawlerConfig = require('../models/CrawlerConfig');
const scheduler = require('../utils/scheduler');
const NightCrawler = require('../services/NightCrawler');
const { getTimeUntilNext, formatDuration } = require('../utils/helpers');

/**
 * @route   POST /api/hunt/start
 * @desc    Activate overnight hunting
 */
router.post('/start', async (req, res, next) => {
    try {
        const config = await CrawlerConfig.setActiveStatus(true);

        // Get time until next scheduled run
        const nextRunMs = getTimeUntilNext();

        res.json({
            success: true,
            message: '🌙 Night Hunt activated! The crawler will run at 2AM, 4AM, and 6AM.',
            data: {
                isActive: config.isActive,
                urls: config.urls.length,
                targetRoles: config.targetRoles,
                nextRunIn: formatDuration(nextRunMs)
            }
        });

        console.log('🌙 Hunt activated by user');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/hunt/stop
 * @desc    Deactivate hunting
 */
router.post('/stop', async (req, res, next) => {
    try {
        const config = await CrawlerConfig.setActiveStatus(false);

        res.json({
            success: true,
            message: '💤 Night Hunt deactivated. The crawler will not run overnight.',
            data: {
                isActive: config.isActive
            }
        });

        console.log('💤 Hunt deactivated by user');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/hunt/status
 * @desc    Get current hunt status
 */
router.get('/status', async (req, res, next) => {
    try {
        const config = await CrawlerConfig.getConfig();
        const schedulerStatus = scheduler.getStatus();
        const crawlerStatus = NightCrawler.getStatus();

        // Get time until next scheduled run
        const nextRunMs = getTimeUntilNext();

        res.json({
            success: true,
            data: {
                isActive: config.isActive,
                isCurrentlyRunning: crawlerStatus.isRunning,
                lastRunAt: config.lastRunAt,
                urlsConfigured: config.urls.length,
                targetRoles: config.targetRoles,
                location: config.location,
                nextRunIn: config.isActive ? formatDuration(nextRunMs) : 'N/A (hunt not active)',
                scheduler: schedulerStatus
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/hunt/trigger
 * @desc    Manually trigger a crawl (for testing)
 */
router.post('/trigger', async (req, res, next) => {
    try {
        const crawlerStatus = NightCrawler.getStatus();

        if (crawlerStatus.isRunning) {
            return res.status(400).json({
                success: false,
                error: 'Crawler is already running'
            });
        }

        // Don't await - let it run in background
        scheduler.triggerManualCrawl().catch(err => {
            console.error('Manual crawl error:', err.message);
        });

        res.json({
            success: true,
            message: '🚀 Manual crawl triggered! Check logs for progress.'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
