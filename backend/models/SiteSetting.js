// ============================================
// models/SiteSetting.js — Singleton Site Configuration
// ============================================

const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema({
    collegeName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    logoUrl: {
        type: String,
        default: ''
    },
    visitorCount: {
        type: Number,
        default: 0
    },
    academicCalendarPdf: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists (singleton pattern)
siteSettingSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('SiteSetting', siteSettingSchema);
