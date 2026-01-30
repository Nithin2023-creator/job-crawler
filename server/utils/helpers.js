/**
 * Utility helper functions
 */

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Format duration in human readable format
 */
const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
};

/**
 * Validate URL format
 */
const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

/**
 * Clean and normalize URL
 */
const normalizeUrl = (url) => {
    try {
        const parsed = new URL(url);
        // Remove trailing slash
        return parsed.href.replace(/\/$/, '');
    } catch {
        return url;
    }
};

/**
 * Get time until next scheduled run
 */
const getTimeUntilNext = (cronExpression) => {
    // Simple calculation for common times (2AM, 4AM, 6AM)
    const now = new Date();
    const currentHour = now.getHours();

    const scheduledHours = [2, 4, 6];

    for (const hour of scheduledHours) {
        if (hour > currentHour) {
            const next = new Date(now);
            next.setHours(hour, 0, 0, 0);
            return next.getTime() - now.getTime();
        }
    }

    // Next day 2AM
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
};

module.exports = {
    sleep,
    formatDuration,
    isValidUrl,
    normalizeUrl,
    getTimeUntilNext
};
