const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    defaultTags: [{
        type: String,
        trim: true,
        default: ['SDE', 'Fresher', 'Intern']
    }],
    schedule: {
        type: String,
        trim: true,
        default: '0 2 * * *' // Default to 2 AM
    },
    userPersona: {
        type: String,
        trim: true,
        default: 'I am a fresher/entry-level software engineer looking for backend or fullstack roles. Skills: Node.js, Python, React, MongoDB, PostgreSQL. Preferred: Remote or Hyderabad, India. Open to internships and entry-level positions.'
    },
    searchQueries: [{
        type: String,
        trim: true,
        default: ['Backend Engineer Fresher', 'Full Stack Developer Entry Level', 'Software Engineer Intern']
    }],
    preferredLocations: [{
        type: String,
        trim: true,
        default: ['Remote', 'Hyderabad', 'Bangalore']
    }],
    minRelevanceScore: {
        type: Number,
        default: 50  // Minimum score to save a job
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Singleton pattern for Settings
SettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);
