const cron = require('node-cron');
const NightCrawler = require('../services/NightCrawler');
const CrawlerConfig = require('../models/CrawlerConfig');
const cleanup = require('./cleanup');

/**
 * Scheduler for overnight crawling batches
 * Default schedule: 2:00 AM, 4:00 AM, 6:00 AM
 */

class CrawlerScheduler {
    constructor() {
        this.jobs = [];
        this.isInitialized = false;
    }

    /**
     * Initialize the scheduler with cron jobs
     */
    async init() {
        if (this.isInitialized) {
            console.log('⚠️ Scheduler: Already initialized');
            return;
        }

        console.log('⏰ Scheduler: Initializing cron jobs...');

        // Default schedules from .env or fallback
        const schedules = [
            process.env.SCHEDULE_1 || '0 2 * * *',   // 2:00 AM
            process.env.SCHEDULE_2 || '0 4 * * *',   // 4:00 AM
            process.env.SCHEDULE_3 || '0 6 * * *'    // 6:00 AM
        ];

        for (const schedule of schedules) {
            if (cron.validate(schedule)) {
                const job = cron.schedule(schedule, async () => {
                    await this.executeScheduledCrawl();
                }, {
                    scheduled: true,
                    timezone: 'Asia/Kolkata'  // Indian timezone
                });

                this.jobs.push({ schedule, job });
                console.log(`✅ Scheduler: Registered cron job for ${schedule}`);
            } else {
                console.error(`❌ Scheduler: Invalid cron expression: ${schedule}`);
            }
        }

        // Daily cleanup at midnight
        const cleanupSchedule = '0 0 * * *';
        const cleanupJob = cron.schedule(cleanupSchedule, async () => {
            console.log('\n🧹 ==========================================');
            console.log('🧹 DAILY MAINTENANCE TRIGGERED');
            console.log(`🧹 Time: ${new Date().toLocaleString()}`);
            console.log('🧹 ==========================================\n');
            try {
                await cleanup.purgeUnseen(7);   // Remove jobs not seen in 7 days
                await cleanup.purgeLogs(30);    // Remove logs older than 30 days
            } catch (error) {
                console.error('❌ Scheduler: Maintenance failed:', error.message);
            }
        }, {
            scheduled: true,
            timezone: 'Asia/Kolkata'
        });

        this.jobs.push({ schedule: cleanupSchedule, job: cleanupJob });
        console.log(`✅ Scheduler: Registered daily maintenance job for ${cleanupSchedule}`);

        this.isInitialized = true;
        console.log(`⏰ Scheduler: Initialized with ${this.jobs.length} cron jobs`);
    }

    /**
     * Execute a scheduled crawl batch
     */
    async executeScheduledCrawl() {
        console.log('\n🌙 ==========================================');
        console.log('🌙 SCHEDULED CRAWL TRIGGERED');
        console.log(`🌙 Time: ${new Date().toLocaleString()}`);
        console.log('🌙 ==========================================\n');

        try {
            // Check if hunt is active
            const config = await CrawlerConfig.getConfig();

            if (!config.isActive) {
                console.log('💤 Scheduler: Hunt not active, skipping scheduled crawl');
                return;
            }

            // Run the crawler
            const log = await NightCrawler.runBatch('scheduled');

            console.log('\n🌙 ==========================================');
            console.log('🌙 SCHEDULED CRAWL COMPLETED');
            console.log(`🌙 Jobs Found: ${log?.jobsFound || 0}`);
            console.log('🌙 ==========================================\n');

        } catch (error) {
            console.error('❌ Scheduler: Crawl failed:', error.message);
        }
    }

    /**
     * Manually trigger a crawl (for testing or API call)
     */
    async triggerManualCrawl() {
        console.log('\n🔧 Manual crawl triggered...');
        return await NightCrawler.runBatch('manual');
    }

    /**
     * Get status of all scheduled jobs
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            jobs: this.jobs.map(j => ({
                schedule: j.schedule,
                running: j.job.running
            })),
            crawlerStatus: NightCrawler.getStatus()
        };
    }

    /**
     * Stop all cron jobs
     */
    stop() {
        console.log('🛑 Scheduler: Stopping all cron jobs...');

        for (const { job, schedule } of this.jobs) {
            job.stop();
            console.log(`⏹️ Scheduler: Stopped job ${schedule}`);
        }

        this.isInitialized = false;
        console.log('🛑 Scheduler: All jobs stopped');
    }

    /**
     * Restart all cron jobs
     */
    start() {
        console.log('▶️ Scheduler: Starting all cron jobs...');

        for (const { job, schedule } of this.jobs) {
            job.start();
            console.log(`▶️ Scheduler: Started job ${schedule}`);
        }
    }
}

// Export singleton instance
module.exports = new CrawlerScheduler();
