const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: false // Optional for now to support migration/legacy
    },
    link: {
        type: String,
        required: true,
        unique: true,  // For deduplication
        trim: true
    },
    location: {
        type: String,
        trim: true,
        default: 'Not specified'
    },
    detectedAt: {
        type: Date,
        default: Date.now
    },
    isFresh: {
        type: Boolean,
        default: true  // Flag for morning brief
    },
    keywords: [{
        type: String,
        trim: true
    }],
    sourceUrl: {
        type: String,  // The career page URL where this was found
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    employmentType: {
        type: String,   // "Full-time", "Internship", "Contract", etc.
        trim: true,
        default: ''
    },
    experienceLevel: {
        type: String,   // "Entry", "Mid", "Senior", "Lead"
        trim: true,
        default: ''
    },
    salary: {
        type: String,
        trim: true,
        default: ''
    },
    relevanceScore: {
        type: Number,   // 0-100 AI-assigned score
        default: 0
    },
    matchReason: {
        type: String,
        trim: true,
        default: ''
    },
    source: {
        type: String,   // "career_page", "linkedin", "indeed", "jsearch"
        default: 'career_page'
    },
    lastSeenAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient morning brief queries (jobs in last 12 hours)
JobSchema.index({ detectedAt: -1 });
JobSchema.index({ isFresh: 1, detectedAt: -1 });

// Static method to get morning brief (jobs from last 12 hours)
JobSchema.statics.getMorningBrief = async function () {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    return this.find({ detectedAt: { $gte: twelveHoursAgo } })
        .sort({ detectedAt: -1 });
};

// Static method to check if job already exists
JobSchema.statics.existsByLink = async function (link) {
    const existing = await this.findOne({ link });
    return !!existing;
};

// Static method to delete stale jobs for a company
JobSchema.statics.deleteStaleJobs = async function (companyId, activeLinkSet) {
    const result = await this.deleteMany({
        companyId: companyId,
        link: { $nin: Array.from(activeLinkSet) }
    });
    return result.deletedCount;
};

// Static method to touch lastSeenAt for active jobs
JobSchema.statics.touchActiveJobs = async function (companyId, activeLinkSet) {
    return this.updateMany(
        { companyId: companyId, link: { $in: Array.from(activeLinkSet) } },
        { $set: { lastSeenAt: new Date() } }
    );
};

module.exports = mongoose.model('Job', JobSchema);
