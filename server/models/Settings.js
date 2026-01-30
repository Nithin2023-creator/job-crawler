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
        default: 'I am a software engineer looking for backend or fullstack roles.'
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
