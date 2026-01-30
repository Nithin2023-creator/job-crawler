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
    // Current time in UTC
    const now = new Date();

    // IST Offset: UTC + 5:30 (19800000 ms)
    const istOffset = 5.5 * 60 * 60 * 1000;

    // Create a "Virtual IST Date" by shifting time
    // We use UTC methods on this object to get IST values
    const istDate = new Date(now.getTime() + istOffset);

    const currentHour = istDate.getUTCHours();

    // Scheduled times in IST (2 AM, 4 AM, 6 AM)
    const scheduledHours = [2, 4, 6];

    for (const hour of scheduledHours) {
        if (hour > currentHour) {
            const next = new Date(istDate);
            next.setUTCHours(hour, 0, 0, 0);
            return next.getTime() - istDate.getTime();
        }
    }

    // If passed all times, schedule for next day 2 AM IST
    const next = new Date(istDate);
    next.setUTCDate(next.getUTCDate() + 1);
    next.setUTCHours(2, 0, 0, 0);
    return next.getTime() - istDate.getTime();
};

module.exports = {
    sleep,
    formatDuration,
    isValidUrl,
    normalizeUrl,
    getTimeUntilNext
};
