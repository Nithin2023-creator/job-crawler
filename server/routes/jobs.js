const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const CrawlerLog = require('../models/CrawlerLog');

/**
 * @route   GET /api/jobs/morning-brief
 * @desc    Get jobs found in the last 12 hours (morning brief)
 */
router.get('/morning-brief', async (req, res, next) => {
    try {
        const jobs = await Job.getMorningBrief();

        // Group by company for cleaner display
        const byCompany = jobs.reduce((acc, job) => {
            if (!acc[job.company]) {
                acc[job.company] = [];
            }
            acc[job.company].push(job);
            return acc;
        }, {});

        res.json({
            success: true,
            message: `☀️ Good morning! Found ${jobs.length} new jobs while you slept.`,
            data: {
                totalJobs: jobs.length,
                companies: Object.keys(byCompany).length,
                jobs,
                byCompany
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/jobs
 * @desc    Get all jobs with pagination
 */
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Filter options
        const filter = {};

        if (req.query.company) {
            // Support both ID and Name search
            if (req.query.company.match(/^[0-9a-fA-F]{24}$/)) {
                filter.companyId = req.query.company;
            } else {
                filter.company = { $regex: req.query.company, $options: 'i' };
            }
        }

        if (req.query.isFresh === 'true') {
            filter.isFresh = true;
        }

        if (req.query.keyword) {
            filter.keywords = { $in: [new RegExp(req.query.keyword, 'i')] };
        }

        const jobs = await Job.find(filter)
            .sort({ detectedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Job.countDocuments(filter);

        res.json({
            success: true,
            data: {
                jobs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get a single job by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        res.json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/jobs/:id/mark-viewed
 * @desc    Mark a job as viewed (isFresh = false)
 */
router.patch('/:id/mark-viewed', async (req, res, next) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { isFresh: false },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        res.json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/jobs/:id/star
 * @desc    Toggle star (favorite) status on a job
 */
router.patch('/:id/star', async (req, res, next) => {
    try {
        const { isStarred } = req.body;

        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { isStarred: isStarred },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        res.json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        res.json({
            success: true,
            message: 'Job deleted'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/logs
 * @desc    Get crawler execution logs
 */
router.get('/logs/all', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const logs = await CrawlerLog.find()
            .sort({ batchTime: -1 })
            .skip(skip)
            .limit(limit);

        const total = await CrawlerLog.countDocuments();

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/logs/today
 * @desc    Get today's crawler logs
 */
router.get('/logs/today', async (req, res, next) => {
    try {
        const logs = await CrawlerLog.getTodaysLogs();

        const summary = {
            totalBatches: logs.length,
            totalJobsFound: logs.reduce((sum, log) => sum + log.jobsFound, 0),
            totalErrors: logs.reduce((sum, log) => sum + log.crawlErrors.length, 0),
            totalUrlsScanned: logs.reduce((sum, log) => sum + log.urlsScanned, 0)
        };

        res.json({
            success: true,
            data: {
                summary,
                logs
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
