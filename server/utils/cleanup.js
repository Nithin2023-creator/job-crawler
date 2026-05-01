const Job = require('../models/Job');
const CrawlerLog = require('../models/CrawlerLog');

/**
 * Cleanup utility for database maintenance
 */
const cleanup = {
    /**
     * Delete jobs not seen in the last N days (safety net)
     * @param {number} days - Max age in days (default: 7)
     */
    async purgeUnseen(days = 7) {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const result = await Job.deleteMany({
            lastSeenAt: { $lt: cutoff }
        });
        console.log(`🧹 Cleanup: Purged ${result.deletedCount} jobs not seen in ${days} days`);
        return result.deletedCount;
    },

    /**
     * Delete crawler logs older than N days
     * @param {number} days - Max age in days (default: 30)
     */
    async purgeLogs(days = 30) {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const result = await CrawlerLog.deleteMany({
            batchTime: { $lt: cutoff }
        });
        console.log(`🧹 Cleanup: Purged ${result.deletedCount} old crawler logs`);
        return result.deletedCount;
    }
};

module.exports = cleanup;
