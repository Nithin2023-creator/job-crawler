const mongoose = require('mongoose');

const CrawlerConfigSchema = new mongoose.Schema({
    urls: [{
        type: String,
        trim: true,
        required: true
    }],
    targetRoles: [{
        type: String,
        trim: true
    }],
    location: {
        type: String,
        trim: true,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: false  // Hunt not active by default
    },
    scheduleTimes: [{
        type: String,
        default: ['0 2 * * *', '0 4 * * *', '0 6 * * *']  // 2AM, 4AM, 6AM
    }],
    lastRunAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Only one config document should exist (singleton pattern)
CrawlerConfigSchema.statics.getConfig = async function () {
    let config = await this.findOne();
    if (!config) {
        // Create default config if none exists
        config = await this.create({
            urls: [],
            targetRoles: ['Intern', 'Fresher', 'Entry Level', 'Junior'],
            location: '',
            isActive: false,
            scheduleTimes: ['0 2 * * *', '0 4 * * *', '0 6 * * *']
        });
    }
    return config;
};

// Update the singleton config
CrawlerConfigSchema.statics.updateConfig = async function (updates) {
    updates.updatedAt = new Date();
    let config = await this.findOne();
    if (!config) {
        config = await this.create(updates);
    } else {
        Object.assign(config, updates);
        await config.save();
    }
    return config;
};

// Update only the isActive status
CrawlerConfigSchema.statics.setActiveStatus = async function (isActive) {
    return this.updateConfig({ isActive });
};

module.exports = mongoose.model('CrawlerConfig', CrawlerConfigSchema);
