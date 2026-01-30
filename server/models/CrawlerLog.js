const mongoose = require('mongoose');

const CrawlerLogSchema = new mongoose.Schema({
    batchTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    urlsScanned: {
        type: Number,
        default: 0
    },
    jobsFound: {
        type: Number,
        default: 0
    },
    crawlErrors: [{
        url: {
            type: String,
            trim: true
        },
        message: {
            type: String,
            trim: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    duration: {
        type: Number,  // Duration in milliseconds
        default: 0
    },
    status: {
        type: String,
        enum: ['running', 'completed', 'failed'],
        default: 'running'
    },
    triggerType: {
        type: String,
        enum: ['scheduled', 'manual'],
        default: 'scheduled'
    }
}, {
    timestamps: true
});

// Index for retrieving recent logs
CrawlerLogSchema.index({ batchTime: -1 });

// Static method to get latest log
CrawlerLogSchema.statics.getLatest = async function () {
    return this.findOne().sort({ batchTime: -1 });
};

// Static method to get logs from today
CrawlerLogSchema.statics.getTodaysLogs = async function () {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return this.find({ batchTime: { $gte: startOfDay } })
        .sort({ batchTime: -1 });
};

module.exports = mongoose.model('CrawlerLog', CrawlerLogSchema);
