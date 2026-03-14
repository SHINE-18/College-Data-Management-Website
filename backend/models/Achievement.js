// ============================================
// models/Achievement.js — Faculty Achievements Data Structure
// ============================================

const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    facultyName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    achievementType: {
        type: String,
        required: true,
        enum: ['Award', 'Certification', 'Honor', 'Recognition', 'Prize', 'Other']
    },
    issuingOrganization: {
        type: String,
        trim: true
    },
    date: {
        type: Date
    },
    location: {
        type: String,
        trim: true
    },
    certificateUrl: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// ============================================
// INDEXES — For improved query performance
// ============================================
achievementSchema.index({ facultyId: 1 });
achievementSchema.index({ achievementType: 1 });
achievementSchema.index({ date: -1 });
achievementSchema.index({ title: 'text', description: 'text' });
achievementSchema.index({ isVerified: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);

