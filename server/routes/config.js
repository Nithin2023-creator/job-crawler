const express = require('express');
const router = express.Router();
const CrawlerConfig = require('../models/CrawlerConfig');
const { isValidUrl, normalizeUrl } = require('../utils/helpers');

/**
 * @route   GET /api/config
 * @desc    Get current crawler configuration
 */
router.get('/', async (req, res, next) => {
    try {
        const config = await CrawlerConfig.getConfig();

        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/config
 * @desc    Save/update crawler configuration
 * @body    { urls: [], targetRoles: [], location: string }
 */
router.post('/', async (req, res, next) => {
    try {
        const { urls, targetRoles, location, scheduleTimes } = req.body;

        // Validate URLs
        if (urls) {
            if (!Array.isArray(urls)) {
                return res.status(400).json({
                    success: false,
                    error: 'URLs must be an array'
                });
            }

            // Validate each URL
            for (const url of urls) {
                if (!isValidUrl(url)) {
                    return res.status(400).json({
                        success: false,
                        error: `Invalid URL: ${url}`
                    });
                }
            }
        }

        // Normalize URLs
        const normalizedUrls = urls ? urls.map(normalizeUrl) : undefined;

        // Build update object
        const updates = {};
        if (normalizedUrls) updates.urls = normalizedUrls;
        if (targetRoles) updates.targetRoles = targetRoles;
        if (location !== undefined) updates.location = location;
        if (scheduleTimes) updates.scheduleTimes = scheduleTimes;

        const config = await CrawlerConfig.updateConfig(updates);

        res.json({
            success: true,
            message: 'Configuration updated successfully',
            data: config
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/config/urls/:index
 * @desc    Remove a URL from the configuration
 */
router.delete('/urls/:index', async (req, res, next) => {
    try {
        const index = parseInt(req.params.index);
        const config = await CrawlerConfig.getConfig();

        if (index < 0 || index >= config.urls.length) {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL index'
            });
        }

        config.urls.splice(index, 1);
        config.updatedAt = new Date();
        await config.save();

        res.json({
            success: true,
            message: 'URL removed successfully',
            data: config
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
