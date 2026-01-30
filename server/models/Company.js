const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    urls: [{
        type: String,
        trim: true,
        required: true
    }],
    customTags: [{
        type: String,
        trim: true
    }],
    customPersona: {
        type: String,
        trim: true,
        default: ''
    },
    logoUrl: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Company', CompanySchema);
